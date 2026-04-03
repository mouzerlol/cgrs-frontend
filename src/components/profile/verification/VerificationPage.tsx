'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import AddressSelectionForm from './AddressSelectionForm';
import QRInstructions from './QRInstructions';
import OwnerRequestInstructions from './OwnerRequestInstructions';
import PendingVerificationCard from './PendingVerificationCard';
import VerificationStatus from './VerificationStatus';
import VerificationHistory from './VerificationHistory';
import type {
  AddressLookupResponse,
  PendingVerificationsResponse,
  StreetResponse,
  VerificationRequestResponse,
  VerificationStatusResponse,
} from '@/lib/api/verification';

interface VerificationPageProps {
  streets: StreetResponse[];
  verificationStatus?: VerificationStatusResponse;
}

type Step = 'select' | 'pending' | 'qr' | 'role_management' | 'complete' | 'verified';

export default function VerificationPage({ streets, verificationStatus }: VerificationPageProps) {
  const { getToken } = useAuth();
  const [step, setStep] = useState<Step>('select');
  const [selectedAddress, setSelectedAddress] = useState<{
    streetId: string;
    streetName: string;
    streetNumber: string;
  } | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerificationRequestResponse | null>(null);
  const [pendingResponses, setPendingResponses] = useState<PendingVerificationsResponse['pending_responses']>([]);
  const [error, setError] = useState<string | null>(null);
  const [addressLookupResult, setAddressLookupResult] = useState<AddressLookupResponse | null>(null);
  const [selectedVerificationType, setSelectedVerificationType] = useState<'resident' | 'owner' | null>(null);

  const fetchPendingResponses = useCallback(async () => {
    try {
      const { getPendingVerifications } = await import('@/lib/api/verification');
      const token = await getToken();
      const data = await getPendingVerifications(async () => token);
      setPendingResponses(data.pending_responses);
    } catch {
      // Silently fail - not critical
    }
  }, [getToken]);

  // Determine initial step based on verification status
  useEffect(() => {
    if (!verificationStatus) return;

    if (verificationStatus.is_verified) {
      setStep('verified');
      fetchPendingResponses();
      return;
    }

    if (verificationStatus.has_pending_request) {
      setSelectedAddress({
        streetId: '',
        streetName: verificationStatus.pending_address?.split(' ')[0] || '',
        streetNumber: verificationStatus.pending_address?.split(' ').slice(1).join(' ') || '',
      });
      setStep('pending');
      fetchPendingResponses();
      return;
    }

    fetchPendingResponses();
  }, [verificationStatus, fetchPendingResponses]);

  async function handleAddressSubmit(data: {
    streetId: string;
    streetNumber: string;
    verificationType: 'resident' | 'owner';
  }) {
    try {
      setError(null);
      const { lookupAddress, createVerificationRequest } = await import('@/lib/api/verification');
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
      await fetchPendingResponses();
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
      await fetchPendingResponses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject');
    }
  }

  // User is already verified
  if (step === 'verified') {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="font-display text-2xl text-forest">Verification</h2>
          <p className="mt-1 text-forest/70">
            You are a verified {verificationStatus?.role || 'member'} of this community.
          </p>
        </div>

        {/* Pending Responses Section */}
        {pendingResponses.length > 0 && (
          <section>
            <h3 className="font-display text-lg text-forest mb-4">Requests Needing Your Response</h3>
            <p className="text-sm text-forest/60 mb-4">
              As a verified resident/owner, you can approve or reject verification requests from others at your property.
            </p>
            <div className="space-y-4">
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
          className="flex flex-col items-center rounded-2xl bg-white p-8 shadow-sm border border-sage/20"
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
        <VerificationHistory />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="font-display text-2xl text-forest">Verification</h2>
        <p className="mt-1 text-forest/70">
          Become a verified resident or owner of your property.
        </p>
      </div>

      {/* Error display */}
      {error && (
        <div className="rounded-xl bg-terracotta/10 border border-terracotta/30 p-4 text-terracotta text-sm">
          {error}
        </div>
      )}

      {/* Pending Responses Section */}
      {pendingResponses.length > 0 && (
        <section>
          <h3 className="font-display text-lg text-forest mb-4">Requests Needing Your Response</h3>
          <p className="text-sm text-forest/60 mb-4">
            As a verified resident/owner, you can approve or reject verification requests from others at your property.
          </p>
          <div className="space-y-4">
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
        >
          <OwnerRequestInstructions
            address={`${selectedAddress.streetName} ${selectedAddress.streetNumber}`}
            requestId={verificationResult.request_id}
          />
        </motion.div>
      )}

      {/* Address Selection */}
      {step === 'select' && !verificationStatus?.has_pending_request && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <AddressSelectionForm streets={streets} onSubmit={handleAddressSubmit} />
        </motion.div>
      )}

      {/* Verification History */}
      <VerificationHistory />
    </div>
  );
}
