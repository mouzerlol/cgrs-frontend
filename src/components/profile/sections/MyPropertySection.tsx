'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { motion, useReducedMotion } from 'framer-motion';
import {
  AlertTriangle,
  Building2,
  CheckCircle,
  Clock,
  Home,
  Loader2,
  X,
} from 'lucide-react';
import { useMyPropertiesQuery, useInvalidateProfileData } from '@/hooks/useProfileData';
import { withdrawVerificationRequest } from '@/lib/api/verification';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';
import PropertyMap from './PropertyMap';
import CoMembersWidget from './CoMembersWidget';

function DetailItem({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="text-center p-3 bg-bone">
      <p className="text-2xl font-display text-forest">{value ?? '—'}</p>
      <p className="text-xs text-forest/60">{label}</p>
    </div>
  );
}

export default function MyPropertySection() {
  const { getToken } = useAuth();
  const prefersReducedMotion = useReducedMotion();
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

  const { data, isLoading, error } = useMyPropertiesQuery();
  const { invalidateMyProperties } = useInvalidateProfileData();

  async function handleWithdraw(requestId: string) {
    setWithdrawingId(requestId);
    try {
      const token = await getToken();
      await withdrawVerificationRequest(requestId, async () => token);
      await invalidateMyProperties();
    } catch {
      // Error handling
    } finally {
      setWithdrawingId(null);
    }
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="border border-sage/30 p-md bg-white">
          <div className="lg:flex lg:gap-gutter">
            <div className="lg:w-1/3 space-y-4">
              <Skeleton className="h-[200px]" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="lg:w-2/3 space-y-4 mt-4 lg:mt-0">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-[100px]" />
              <Skeleton className="h-4 w-1/3 mt-4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-forest/10">
            <Building2 className="h-6 w-6 text-forest" />
          </div>
          <div>
            <h2 className="font-display text-2xl text-forest">My Property</h2>
            <p className="text-sm text-forest/60">
              View your verified properties and pending requests.
            </p>
          </div>
        </div>
        <div>
          <div className="border border-terracotta/30 bg-terracotta/10 p-6 text-center">
            <div className="flex justify-center mb-3">
              <div className="flex h-12 w-12 items-center justify-center bg-terracotta/10">
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
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-forest/10">
            <Building2 className="h-6 w-6 text-forest" />
          </div>
          <div>
            <h2 className="font-display text-2xl text-forest">My Property</h2>
            <p className="text-sm text-forest/60">
              View your verified properties and pending requests.
            </p>
          </div>
        </div>

        <div>
          <div className="border border-sage/30 bg-white p-6 shadow-[0_8px_32px_rgba(26,34,24,0.08)]">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-sage/10">
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
        <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-forest/10">
          <Building2 className="h-6 w-6 text-forest" />
        </div>
        <div>
          <h2 className="font-display text-2xl text-forest">My Property</h2>
          <p className="text-sm text-forest/60">
            Your verified properties and pending requests.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {hasVerifiedProperties &&
          data?.verified_properties.map((property) => (
            <motion.div
              key={property.property_id}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-sage/30 p-md"
            >
              <div className="lg:flex lg:gap-gutter">
                {/* LEFT COLUMN: 1/3 width */}
                <div className="lg:w-1/3 space-y-3">
                  <PropertyMap
                    lat={property.lat ?? null}
                    lng={property.lng ?? null}
                    address={`${property.street_number} ${property.street_name}`}
                  />

                  <p className="text-sm font-medium text-forest">
                    {property.verification_type === 'owner' 
                      ? ((property.co_members && property.co_members.length > 0) ? 'Owners' : 'Owner') 
                      : ((property.co_members && property.co_members.length > 0) ? 'Residents' : 'Resident')} of{' '}
                    {property.street_number} {property.street_name}
                  </p>

                  <CoMembersWidget
                    members={property.co_members ?? []}
                    type={property.verification_type as 'owner' | 'resident'}
                  />
                </div>

                {/* RIGHT COLUMN: 2/3 width */}
                <div className="lg:w-2/3 flex flex-col justify-between mt-4 lg:mt-0">
                  <div>
                    <h3 className="font-display text-lg text-forest mb-4">
                      {property.street_number} {property.street_name}
                    </h3>

                    <div className="grid grid-cols-3 gap-4">
                      <DetailItem label="Bedrooms" value={property.bedrooms} />
                      <DetailItem label="Bathrooms" value={property.bathrooms} />
                      <DetailItem label="Carparks" value={property.parking_spaces} />
                    </div>
                  </div>

                  <p className="text-xs text-forest/60 mt-4">
                    Verified on: {new Date(property.verified_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}

        {/* Pending Requests Section */}
        {hasPendingRequests && (
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-amber/10">
                <Clock className="h-5 w-5 text-amber" />
              </div>
              <h3 className="font-display text-lg text-forest">Pending Requests</h3>
            </div>

            {data?.pending_requests.map((request) => (
              <motion.div
                key={request.id}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-sage/30 p-md flex flex-col"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-forest">
                      {request.street_number} {request.street_name}
                    </h4>
                    <p className="text-sm text-forest/70">
                      Requested: {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-[11px] font-medium bg-amber/10 text-amber px-2 py-1 uppercase tracking-wider">
                    {request.verification_type}
                  </span>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleWithdraw(request.id)}
                    disabled={withdrawingId === request.id}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all border border-terracotta/30',
                      'text-terracotta hover:bg-terracotta/10',
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
          </section>
        )}
      </div>
    </div>
  );
}
