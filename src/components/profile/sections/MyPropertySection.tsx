'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Building2,
  AlertTriangle,
  Home,
  CheckCircle,
  Clock,
  Hourglass,
  Loader2,
  X,
} from 'lucide-react';
import { useMyPropertiesQuery, useInvalidateProfileData } from '@/hooks/useProfileData';
import { withdrawVerificationRequest } from '@/lib/api/verification';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';

export default function MyPropertySection() {
  const { getToken } = useAuth();
  const prefersReducedMotion = useReducedMotion();
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

  // Use centralized query
  const { data, isLoading, error } = useMyPropertiesQuery();
  const { invalidateMyProperties } = useInvalidateProfileData();

  async function handleWithdraw(requestId: string) {
    setWithdrawingId(requestId);
    try {
      const token = await getToken();
      await withdrawVerificationRequest(requestId, async () => token);
      // Invalidate to refetch
      await invalidateMyProperties();
    } catch {
      // Error handling - could add toast notification here
    } finally {
      setWithdrawingId(null);
    }
  }

  // Loading skeleton
  if (isLoading) {
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
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        {/* Header with icon */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-forest/10">
            <Building2 className="h-6 w-6 text-forest" />
          </div>
          <div>
            <h2 className="font-display text-2xl text-forest">My Property</h2>
            <p className="text-sm text-forest/60">
              View your verified properties and pending requests.
            </p>
          </div>
        </div>
        <div className="ml-14">
          <div className="rounded-xl bg-terracotta/10 p-6 text-center">
            <div className="flex justify-center mb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-terracotta/10">
                <AlertTriangle className="h-6 w-6 text-terracotta" />
              </div>
            </div>
            <p className="text-terracotta">Failed to load properties. Please try again.</p>
          </div>
        </div>
      </div>
    );
  }

  const hasVerifiedProperties = data?.verified_properties && data.verified_properties.length > 0;
  const hasPendingRequests = data?.pending_requests && data.pending_requests.length > 0;

  if (!hasVerifiedProperties && !hasPendingRequests) {
    return (
      <div className="space-y-6">
        {/* Header with icon */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-forest/10">
            <Building2 className="h-6 w-6 text-forest" />
          </div>
          <div>
            <h2 className="font-display text-2xl text-forest">My Property</h2>
            <p className="text-sm text-forest/60">
              View your verified properties and pending requests.
            </p>
          </div>
        </div>

        <div className="ml-14">
          <div className="rounded-xl bg-white p-6 shadow-[0_8px_32px_rgba(26,34,24,0.08)]">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sage/10">
                <Home className="h-6 w-6 text-sage" />
              </div>
              <div>
                <h3 className="font-display text-lg text-forest mb-1">No Verified Properties</h3>
                <p className="text-sm text-forest/70">
                  Go to{' '}
                  <a href="/profile/verification" className="text-terracotta hover:underline font-medium">
                    Verification
                  </a>{' '}
                  to verify your property.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with icon */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-forest/10">
          <Building2 className="h-6 w-6 text-forest" />
        </div>
        <div>
          <h2 className="font-display text-2xl text-forest">My Property</h2>
          <p className="text-sm text-forest/60">
            Your verified properties and pending requests.
          </p>
        </div>
      </div>

      {/* Verified Properties */}
      {hasVerifiedProperties && (
        <section className="ml-14 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sage/10">
              <CheckCircle className="h-5 w-5 text-sage" />
            </div>
            <h3 className="font-display text-lg text-forest">Verified Properties</h3>
          </div>
          <div className="space-y-4 pl-[3.5rem]">
            {data?.verified_properties.map((property) => (
              <motion.div
                key={property.property_id}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="overflow-hidden rounded-xl bg-white shadow-[0_8px_32px_rgba(26,34,24,0.08)]"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sage/10">
                        {property.verification_type === 'owner' ? (
                          <Building2 className="h-5 w-5 text-sage" />
                        ) : (
                          <Home className="h-5 w-5 text-sage" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-display text-lg text-forest">
                          {property.street_number} {property.street_name}
                        </h4>
                        <p className="mt-1 text-sm text-forest/70 capitalize">
                          Verified as: {property.verification_type}
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-forest/50 pl-[2.5rem]">
                    Verified on: {new Date(property.verified_at).toLocaleDateString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Pending Requests */}
      {hasPendingRequests && (
        <section className="ml-14 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber/10">
              <Clock className="h-5 w-5 text-amber" />
            </div>
            <h3 className="font-display text-lg text-forest">Pending Requests</h3>
          </div>
          <div className="space-y-4 pl-[3.5rem]">
            {data?.pending_requests.map((request) => (
              <motion.div
                key={request.id}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="overflow-hidden rounded-xl bg-white shadow-[0_8px_32px_rgba(26,34,24,0.08)]"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber/10">
                        <Hourglass className="h-5 w-5 text-amber" />
                      </div>
                      <div>
                        <h4 className="font-display text-lg text-forest">
                          Property ID: {request.property_id.slice(0, 8)}
                        </h4>
                        <p className="mt-1 text-sm text-forest/70 capitalize">
                          Request type: {request.verification_type}
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-forest/50 pl-[2.5rem]">
                    Requested on: {new Date(request.created_at).toLocaleDateString()}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleWithdraw(request.id)}
                    disabled={withdrawingId === request.id}
                    className={cn(
                      'mt-4 flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all w-full sm:w-auto sm:ml-[2.5rem]',
                      'bg-terracotta/10 text-terracotta hover:bg-terracotta/20',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                    )}
                  >
                    {withdrawingId === request.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                    Withdraw Request
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
