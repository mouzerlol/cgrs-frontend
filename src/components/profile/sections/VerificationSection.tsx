'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { ShieldCheck, Clock, Home, Building2, ArrowRight, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useStreetsQuery,
  useVerificationStatusQuery,
  usePendingVerificationsQuery,
  useMyPropertiesQuery,
  useInvalidateProfileData,
} from '@/hooks/useProfileData';
import { lookupAddress, createVerificationRequest } from '@/lib/api/verification';
import { useMarkRead } from '@/hooks/useNotifications';
import AddressSelectionForm from '@/components/profile/verification/AddressSelectionForm';
import PendingVerificationCard from '@/components/profile/verification/PendingVerificationCard';
import VerificationStatus from '@/components/profile/verification/VerificationStatus';
import VerificationHistory from '@/components/profile/verification/VerificationHistory';
import PropertyBadge from '@/components/profile/verification/PropertyBadge';
import { Skeleton } from '@/components/ui/Skeleton';

export default function VerificationSection() {
  const { getToken } = useAuth();
  const searchParams = useSearchParams();
  const markRead = useMarkRead();

  const notificationId = searchParams.get('notification_id');

  useEffect(() => {
    if (notificationId) {
      markRead.mutate(
        { notification_ids: [notificationId] },
        {
          onSuccess: () => {
            const url = new URL(window.location.href);
            url.searchParams.delete('notification_id');
            window.history.replaceState({}, '', url.pathname);
          },
        },
      );
    }
  }, [notificationId]); // eslint-disable-line react-hooks/exhaustive-deps

  const [showVerifyForm, setShowVerifyForm] = useState(false);
  const [selectedCard, setSelectedCard] = useState<'resident' | 'owner' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: streets, isLoading: isStreetsLoading } = useStreetsQuery();
  const { data: verificationStatus, isLoading: isStatusLoading } = useVerificationStatusQuery();
  const { data: pendingData, isLoading: isPendingLoading } = usePendingVerificationsQuery();
  const { data: myProperties, isLoading: isPropsLoading } = useMyPropertiesQuery();
  const { invalidateMyProperties, invalidateVerification } = useInvalidateProfileData();

  const verifiedProperties = myProperties?.verified_properties ?? [];
  const pendingResponses = pendingData?.pending_responses ?? [];
  const hasVerified = verifiedProperties.length > 0;
  const hasPending = verificationStatus?.has_pending_request ?? false;

  // State-adaptive layout (design D7):
  const isNoneState = !hasVerified && !hasPending;
  // One-in-flight UI gate (design D3): re-entry only when verified and nothing pending.
  const showVerifyAnotherButton = hasVerified && !hasPending;

  async function handleAddressSubmit(data: {
    streetId: string;
    streetNumber: string;
    verificationType: 'resident' | 'owner';
  }) {
    try {
      setError(null);
      const token = await getToken();

      await lookupAddress(
        { street_id: data.streetId, street_number: data.streetNumber, verification_type: data.verificationType },
        async () => token,
      );

      await createVerificationRequest(
        { street_id: data.streetId, street_number: data.streetNumber, verification_type: data.verificationType },
        async () => token,
      );

      // Collapse the inline flow; the new pending request surfaces in the pending section
      // once the refreshed queries resolve (design D8).
      setShowVerifyForm(false);
      setSelectedCard(null);
      invalidateMyProperties();
      invalidateVerification();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit verification');
    }
  }

  async function handleApprove(requestId: string) {
    try {
      setError(null);
      const { respondToVerification } = await import('@/lib/api/verification');
      const token = await getToken();
      await respondToVerification(requestId, true, async () => token);
      invalidateVerification();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve');
    }
  }

  async function handleReject(requestId: string) {
    try {
      setError(null);
      const { respondToVerification } = await import('@/lib/api/verification');
      const token = await getToken();
      await respondToVerification(requestId, false, async () => token);
      invalidateVerification();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject');
    }
  }

  // Loading skeleton
  if (isStreetsLoading || isStatusLoading || isPendingLoading || isPropsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="ml-14 space-y-4">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    );
  }

  // The resident/owner selection flow — reused as the whole page (NONE state) and
  // behind the "Verify another property" toggle (design D8).
  const verifyFlow = (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <motion.button
          type="button"
          onClick={() => setSelectedCard('resident')}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className={cn(
            'rounded-2xl bg-white p-6 shadow-sm border border-sage text-left transition-all',
            selectedCard === 'resident'
              ? 'border-terracotta ring-2 ring-terracotta/20'
              : 'hover:bg-sage-light/50 hover:border-forest/30 hover:shadow-[0_10px_28px_rgba(26,34,24,0.1)]',
          )}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-terracotta/10">
              <Home className="h-5 w-5 text-terracotta" />
            </div>
            <div className="flex-1">
              <h4 className="font-display text-lg text-forest">Become a Resident</h4>
            </div>
            {selectedCard === 'resident' && (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-terracotta text-bone">
                <ShieldCheck className="h-4 w-4" />
              </div>
            )}
          </div>
          <p className="text-sm text-forest/70">
            Select your street and property number. If other residents live there, they can verify your residency.
            Otherwise, a QR code will be mailed to your address.
          </p>
        </motion.button>

        <motion.button
          type="button"
          onClick={() => setSelectedCard('owner')}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className={cn(
            'rounded-2xl bg-white p-6 shadow-sm border border-sage text-left transition-all',
            selectedCard === 'owner'
              ? 'border-forest ring-2 ring-forest/20'
              : 'hover:bg-sage-light/50 hover:border-forest/30 hover:shadow-[0_10px_28px_rgba(26,34,24,0.1)]',
          )}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest/10">
              <Building2 className="h-5 w-5 text-forest" />
            </div>
            <div className="flex-1">
              <h4 className="font-display text-lg text-forest">Become an Owner</h4>
            </div>
            {selectedCard === 'owner' && (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-forest text-bone">
                <ShieldCheck className="h-4 w-4" />
              </div>
            )}
          </div>
          <p className="text-sm text-forest/70">
            Property owners can verify co-ownership. If no owner exists in the system yet, you&apos;ll receive
            instructions on how to verify.
          </p>
        </motion.button>
      </div>

      {selectedCard && streets ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <AddressSelectionForm
            streets={streets}
            onSubmit={handleAddressSubmit}
            initialVerificationType={selectedCard}
          />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl bg-sage-light/30 p-8 text-center text-forest/60 text-sm"
        >
          Select an option above to continue
        </motion.div>
      )}
    </div>
  );

  // NONE state — the selection flow IS the page.
  if (isNoneState) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-terracotta/10">
            <ShieldCheck className="h-6 w-6 text-terracotta" />
          </div>
          <div>
            <h2 className="font-display text-2xl text-forest">Verification</h2>
            <p className="text-sm text-forest/60">Become a verified resident or owner of your property.</p>
          </div>
        </div>

        {error && (
          <div className="ml-14 rounded-xl bg-terracotta/10 border border-terracotta/30 p-4 text-terracotta text-sm">
            {error}
          </div>
        )}

        <div className="ml-14">{verifyFlow}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sage/10">
          <ShieldCheck className="h-6 w-6 text-sage" />
        </div>
        <div>
          <h2 className="font-display text-2xl text-forest">Verification</h2>
          <p className="text-sm text-forest/60">Manage your verified properties and verification status.</p>
        </div>
      </div>

      {error && (
        <div className="ml-14 rounded-xl bg-terracotta/10 border border-terracotta/30 p-4 text-terracotta text-sm">
          {error}
        </div>
      )}

      {/* 1. Verified property badges */}
      {hasVerified && (
        <section data-section="badges" className="ml-14 space-y-4">
          <div data-testid="badge-wall" className="grid gap-4 md:grid-cols-2">
            {verifiedProperties.map((property) => (
              <PropertyBadge
                key={property.property_id}
                streetName={property.street_name}
                streetNumber={property.street_number}
                verificationType={property.verification_type}
              />
            ))}
          </div>
          <Link
            href="/account/my-property"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-forest hover:text-terracotta transition-colors"
          >
            View my properties
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      )}

      {/* 2. Pending request (singular, one-in-flight) */}
      {hasPending && (
        <motion.section
          data-section="pending"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="ml-14"
        >
          <VerificationStatus
            type="pending"
            address={verificationStatus?.pending_address || ''}
            verificationType={(verificationStatus?.pending_type as 'resident' | 'owner') || 'resident'}
            verificationMethod={verificationStatus?.pending_verification_method}
          />
        </motion.section>
      )}

      {/* 3. Requests needing your response */}
      {pendingResponses.length > 0 && (
        <section data-section="responses" className="ml-14 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber/10">
              <Clock className="h-5 w-5 text-amber" />
            </div>
            <div>
              <h3 className="font-display text-lg text-forest">Requests Needing Your Response</h3>
              <p className="text-sm text-forest/60">
                As a verified member, you can approve or reject requests from others at your property.
              </p>
            </div>
          </div>
          <div className="space-y-4 pl-[3.5rem]">
            {pendingResponses.map((item) => (
              <PendingVerificationCard
                key={item.id}
                request={item}
                onApprove={() => handleApprove(item.id)}
                onReject={() => handleReject(item.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* 4. Verification history */}
      <section data-section="history" className="ml-14">
        <VerificationHistory />
      </section>

      {/* 5. Verify another property (gated: verified AND no pending) */}
      {showVerifyAnotherButton && (
        <section className="ml-14">
          {!showVerifyForm ? (
            <motion.button
              type="button"
              onClick={() => setShowVerifyForm(true)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="inline-flex items-center gap-2 rounded-xl border border-forest/20 bg-white px-5 py-3 text-sm font-medium text-forest shadow-sm transition-all hover:border-forest/40 hover:shadow-[0_10px_28px_rgba(26,34,24,0.1)]"
            >
              <Plus className="h-4 w-4" />
              Verify another property
            </motion.button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg text-forest">Verify another property</h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowVerifyForm(false);
                    setSelectedCard(null);
                  }}
                  className="inline-flex items-center gap-1.5 text-sm text-forest/60 hover:text-terracotta transition-colors"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              </div>
              {verifyFlow}
            </motion.div>
          )}
        </section>
      )}
    </div>
  );
}
