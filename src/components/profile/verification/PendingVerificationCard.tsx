'use client';

import { useState } from 'react';
import { Check, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PendingResponseItem } from '@/lib/api/verification';

interface PendingVerificationCardProps {
  request: PendingResponseItem;
  onApprove: () => Promise<void>;
  onReject: () => Promise<void>;
}

export default function PendingVerificationCard({ request, onApprove, onReject }: PendingVerificationCardProps) {
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [responded, setResponded] = useState(false);

  async function handleApprove() {
    setIsApproving(true);
    try {
      await onApprove();
      setResponded(true);
    } finally {
      setIsApproving(false);
    }
  }

  async function handleReject() {
    setIsRejecting(true);
    try {
      await onReject();
      setResponded(true);
    } finally {
      setIsRejecting(false);
    }
  }

  const formattedDate = new Date(request.created_at).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  if (responded) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-sage/20 opacity-60">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sage-light">
            <Check className="h-5 w-5 text-forest" />
          </div>
          <div>
            <p className="font-medium text-forest">Response recorded</p>
            <p className="text-sm text-forest/60">
              {request.street_name} {request.street_number} - {request.verification_type}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm border border-sage/20">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="font-display text-lg text-forest">
            {request.street_name} {request.street_number}
          </h4>
          <p className="text-sm text-forest/60">
            {request.requester_name || request.requester_email || 'Someone'} wants to verify as{' '}
            {request.verification_type} &middot; {formattedDate}
          </p>
        </div>
        <div
          className={cn(
            'rounded-full px-3 py-1 text-xs font-medium',
            request.verification_type === 'resident'
              ? 'bg-terracotta/10 text-terracotta'
              : 'bg-forest/10 text-forest',
          )}
        >
          {request.verification_type === 'resident' ? 'Resident' : 'Owner'}
        </div>
      </div>

      {/* Question */}
      <p className="text-forest mb-6">
        Is this person a co-{request.verification_type} of the property at{' '}
        <strong>
          {request.street_name} {request.street_number}
        </strong>
        ?
      </p>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleApprove}
          disabled={isApproving || isRejecting}
          className={cn(
            'flex items-center justify-center gap-2 rounded-xl px-6 py-4 text-sm font-medium transition-all',
            'bg-forest text-bone hover:bg-forest/90',
            'disabled:opacity-50 disabled:cursor-not-allowed',
          )}
        >
          {isApproving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          Yes, Approve
        </button>
        <button
          type="button"
          onClick={handleReject}
          disabled={isApproving || isRejecting}
          className={cn(
            'flex items-center justify-center gap-2 rounded-xl px-6 py-4 text-sm font-medium transition-all',
            'bg-terracotta/10 text-terracotta hover:bg-terracotta/20',
            'disabled:opacity-50 disabled:cursor-not-allowed',
          )}
        >
          {isRejecting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <X className="h-4 w-4" />
          )}
          No, Reject
        </button>
      </div>
    </div>
  );
}
