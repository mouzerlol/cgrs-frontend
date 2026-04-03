'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Clock,
  Home,
  Building2,
} from 'lucide-react';
import { useStreetsQuery, useVerificationStatusQuery, usePendingVerificationsQuery } from '@/hooks/useProfileData';
import { lookupAddress, createVerificationRequest } from '@/lib/api/verification';
import AddressSelectionForm from '@/components/profile/verification/AddressSelectionForm';
import QRInstructions from '@/components/profile/verification/QRInstructions';
import OwnerRequestInstructions from '@/components/profile/verification/OwnerRequestInstructions';
import PendingVerificationCard from '@/components/profile/verification/PendingVerificationCard';
import VerificationStatus from '@/components/profile/verification/VerificationStatus';
import VerificationHistory from '@/components/profile/verification/VerificationHistory';
import { Skeleton } from '@/components/ui/Skeleton';
import type {
  AddressLookupResponse,
  VerificationRequestResponse,
} from '@/lib/api/verification';

type Step = 'select' | 'pending' | 'qr' | 'role_management' | 'verified';

export default function VerificationSection() {
  const { getToken } = useAuth();
  const [step, setStep] = useState<Step>('select');
  const [selectedAddress, setSelectedAddress] = useState<{
    streetId: string;
    streetName: string;
    streetNumber: string;
  } | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerificationRequestResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [addressLookupResult, setAddressLookupResult] = useState<AddressLookupResponse | null>(null);
  const [selectedVerificationType, setSelectedVerificationType] = useState<'resident' | 'owner' | null>(null);

  // Use centralized queries
  const { data: streets, isLoading: isStreetsLoading } = useStreetsQuery();
  const { data: verificationStatus, isLoading: isStatusLoading } = useVerificationStatusQuery();
  const { data: pendingData, isLoading: isPendingLoading } = usePendingVerificationsQuery();

  const pendingResponses = pendingData?.pending_responses ?? [];

  // Determine initial step based on verification status
  if (verificationStatus && step === 'select') {
    if (verificationStatus.is_verified) {
      setStep('verified');
    } else if (verificationStatus.has_pending_request) {
      setSelectedAddress({
        streetId: '',
        streetName: verificationStatus.pending_address?.split(' ')[0] || '',
        streetNumber: verificationStatus.pending_address?.split(' ').slice(1).join(' ') || '',
      });
      setStep('pending');
    }
  }

  async function handleAddressSubmit(data: {
    streetId: string;
    streetNumber: string;
    verificationType: 'resident' | 'owner';
  }) {
    try {
      setError(null);
      const token = await getToken();

      const lookup = await lookupAddress(
        { street_id: data.streetId, street_number: data.streetNumber, verification_type: data.verificationType },
        async () => token,
      );

      setSelectedAddress({
        streetId: data.streetId,
        streetName: lookup.street_name,
        streetNumber: data.streetNumber,
      });
      setAddressLookupResult(lookup);
      setSelectedVerificationType(data.verificationType);

      const result = await createVerificationRequest(
        { street_id: data.streetId, street_number: data.streetNumber, verification_type: data.verificationType },
        async () => token,
      );

      setVerificationResult(result);

      if (result.verification_method === 'qr_mail') {
        setStep('qr');
      } else if (result.verification_method === 'role_management') {
        setStep('role_management');
      } else {
        setStep('pending');
      }
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject');
    }
  }

  // Loading skeleton
  if (isStreetsLoading || isStatusLoading || isPendingLoading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        {/* Content skeleton */}
        <div className="ml-14 space-y-4">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    );
  }

  // Verified state
  if (step === 'verified') {
    return (
      <div className="space-y-6">
        {/* Header with icon */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sage/10">
            <ShieldCheck className="h-6 w-6 text-sage" />
          </div>
          <div>
            <h2 className="font-display text-2xl text-forest">Verification</h2>
            <p className="text-sm text-forest/60">
              You are a verified {verificationStatus?.role || 'member'} of this community.
            </p>
          </div>
        </div>

        {/* Pending Responses Section */}
        {pendingResponses.length > 0 && (
          <section className="ml-14 space-y-4">
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

        {/* Verified badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="ml-14 flex flex-col items-center rounded-2xl bg-white p-8 shadow-sm border border-sage/20"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-sage/10 mb-4">
            <ShieldCheck className="h-10 w-10 text-sage" />
          </div>
          <h3 className="font-display text-xl text-forest mb-2">Verified {verificationStatus?.role}</h3>
          <p className="text-sm text-forest/60 text-center max-w-md">
            Your identity has been verified. You have full access to community features.
          </p>
        </motion.div>

        {/* Verification History */}
        <section className="ml-14">
          <VerificationHistory />
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with icon */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-terracotta/10">
          <ShieldCheck className="h-6 w-6 text-terracotta" />
        </div>
        <div>
          <h2 className="font-display text-2xl text-forest">Verification</h2>
          <p className="text-sm text-forest/60">
            Become a verified resident or owner of your property.
          </p>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="ml-14 rounded-xl bg-terracotta/10 border border-terracotta/30 p-4 text-terracotta text-sm">
          {error}
        </div>
      )}

      {/* Pending Responses Section */}
      {pendingResponses.length > 0 && (
        <section className="ml-14 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber/10">
              <Clock className="h-5 w-5 text-amber" />
            </div>
            <div>
              <h3 className="font-display text-lg text-forest">Requests Needing Your Response</h3>
              <p className="text-sm text-forest/60">
                As a verified member, you can approve or reject requests from others.
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

      {/* Already has pending request */}
      {step === 'pending' && verificationStatus?.has_pending_request && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="ml-14"
        >
          <VerificationStatus
            type="pending"
            address={verificationStatus.pending_address || ''}
            verificationType={verificationStatus.pending_type as 'resident' | 'owner' || 'resident'}
          />
        </motion.div>
      )}

      {/* QR Mail Instructions */}
      {step === 'qr' && verificationResult && selectedAddress && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="ml-14"
        >
          <QRInstructions
            address={`${selectedAddress.streetName} ${selectedAddress.streetNumber}`}
            expiresAt={verificationResult.expires_at}
            hasExistingResidents={addressLookupResult?.has_residents}
            hasExistingOwners={addressLookupResult?.has_owners}
            verificationType={selectedVerificationType || 'resident'}
          />
        </motion.div>
      )}

      {/* Role Management Request Instructions */}
      {step === 'role_management' && verificationResult && selectedAddress && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="ml-14"
        >
          <OwnerRequestInstructions
            address={`${selectedAddress.streetName} ${selectedAddress.streetNumber}`}
            requestId={verificationResult.request_id}
          />
        </motion.div>
      )}

      {/* Address Selection */}
      {step === 'select' && !verificationStatus?.has_pending_request && streets && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="ml-14 space-y-6"
        >
          {/* Process explanation cards */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-sage/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-terracotta/10">
                  <Home className="h-5 w-5 text-terracotta" />
                </div>
                <h4 className="font-display text-lg text-forest">Become a Resident</h4>
              </div>
              <p className="text-sm text-forest/70">
                Select your street and property number. If other residents live there, they can verify your residency.
                Otherwise, a QR code will be mailed to your address.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm border border-sage/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest/10">
                  <Building2 className="h-5 w-5 text-forest" />
                </div>
                <h4 className="font-display text-lg text-forest">Become an Owner</h4>
              </div>
              <p className="text-sm text-forest/70">
                Property owners can verify co-ownership. If no owner exists in the system yet, you&apos;ll receive
                instructions on how to verify.
              </p>
            </div>
          </div>

          <AddressSelectionForm streets={streets} onSubmit={handleAddressSubmit} />
        </motion.div>
      )}

      {/* Verification History */}
      <section className="ml-14">
        <VerificationHistory />
      </section>
    </div>
  );
}
