'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { motion, useReducedMotion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  Clock,
  Home,
  Loader2,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useMyPropertiesQuery, useInvalidateProfileData } from '@/hooks/useProfileData';
import { withdrawVerificationRequest } from '@/lib/api/verification';
import { resolvePropertyCoordinates } from '@/lib/property-locator';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';
import PropertyMap from './PropertyMap';
import CoMembersWidget from './CoMembersWidget';

const SOCIETY_NAME = "Coronation Gardens Residents' Society";

/** A confident, plain-spoken line describing how the user relates to a property. */
function relationshipLine(type: string, coMemberCount: number): string {
  const isOwner = type === 'owner';
  if (coMemberCount === 0) {
    return isOwner ? "You're the owner here." : "You're a resident here.";
  }
  const total = coMemberCount + 1;
  return isOwner
    ? `You're one of ${total} owners here.`
    : `You're one of ${total} residents here.`;
}

function SectionHeader() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-forest/10">
        <Building2 className="h-6 w-6 text-forest" />
      </div>
      <div>
        <h2 className="font-display text-2xl text-forest">My Property</h2>
        <p className="text-sm text-forest/60">
          Your investment into the neighbourhood
        </p>
      </div>
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
      // Error surfaced on the next query; swallow here.
    } finally {
      setWithdrawingId(null);
    }
  }

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
        <div className="bg-white shadow-[0_8px_32px_rgba(26,34,24,0.08)]">
          <Skeleton className="h-[240px] w-full sm:h-[300px]" />
          <div className="space-y-4 p-6 sm:p-8">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <SectionHeader />
        <div className="border border-terracotta/30 bg-terracotta/10 p-6 text-center">
          <div className="mb-3 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center bg-terracotta/10">
              <AlertTriangle className="h-6 w-6 text-terracotta" />
            </div>
          </div>
          <p className="text-terracotta">Failed to load properties. Please try again.</p>
        </div>
      </div>
    );
  }

  const verifiedProperties = data?.verified_properties ?? [];
  const pendingRequests = data?.pending_requests ?? [];
  const hasVerifiedProperties = verifiedProperties.length > 0;
  const hasPendingRequests = pendingRequests.length > 0;
  const multipleProperties = verifiedProperties.length > 1;

  if (!hasVerifiedProperties && !hasPendingRequests) {
    return (
      <div className="space-y-6">
        <SectionHeader />
        <div className="bg-white p-6 shadow-[0_8px_32px_rgba(26,34,24,0.08)]">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-sage/10">
              <Home className="h-6 w-6 text-sage" />
            </div>
            <div>
              <h3 className="mb-1 font-display text-lg text-forest">No Verified Properties</h3>
              <p className="text-sm text-forest/70">
                Go to{' '}
                <Link
                  href="/account/verification"
                  className="font-medium text-terracotta hover:underline"
                >
                  Verification
                </Link>{' '}
                to verify your property.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <SectionHeader />

      {/* One record per property, stacked. */}
      <div className="space-y-8">
        {verifiedProperties.map((property, index) => {
          const coMembers = property.co_members ?? [];
          const fullAddress = `${property.street_number} ${property.street_name}`;
          const isOwner = property.verification_type === 'owner';

          // Prefer coordinates the API provides; otherwise resolve them locally
          // from the LINZ dataset so the pin still lands on the property. Once
          // the backend populates lat/lng, this fallback self-retires.
          const apiHasCoords = property.lat != null && property.lng != null;
          const fallbackCoords = apiHasCoords
            ? null
            : resolvePropertyCoordinates(property.street_number, property.street_name);
          const mapLat = property.lat ?? fallbackCoords?.[0] ?? null;
          const mapLng = property.lng ?? fallbackCoords?.[1] ?? null;

          return (
            <motion.article
              key={property.property_id}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white shadow-[0_8px_32px_rgba(26,34,24,0.08)]"
            >
              {/* Sequence rule, only when the user holds more than one property. */}
              {multipleProperties && (
                <div className="flex items-center gap-3 px-6 pt-6 sm:px-8">
                  <span className="font-display text-sm tabular-nums text-sage">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="h-px flex-1 bg-sage/25" />
                  <span className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-forest/40">
                    {String(verifiedProperties.length).padStart(2, '0')}
                  </span>
                </div>
              )}

              {/* Hero map: fully zoomed, centred on the pin, no overlay card. */}
              <PropertyMap lat={mapLat} lng={mapLng} address={fullAddress} />

              <div className="space-y-6 p-6 sm:p-8">
                <div className="space-y-2">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.14em]',
                      isOwner ? 'bg-amber/15 text-amber-dark' : 'bg-sage/20 text-forest-light',
                    )}
                  >
                    {isOwner ? 'Owner' : 'Resident'}
                  </span>
                  <h3 className="font-display text-2xl text-forest sm:text-3xl">{fullAddress}</h3>
                  <p className="font-display text-lg italic text-forest/75">
                    {relationshipLine(property.verification_type, coMembers.length)}
                  </p>
                </div>

                {coMembers.length > 0 && (
                  <div className="border-t border-sage/20 pt-6">
                    <CoMembersWidget
                      members={coMembers}
                      type={property.verification_type as 'owner' | 'resident'}
                    />
                  </div>
                )}
              </div>
            </motion.article>
          );
        })}
      </div>

      {/* Pending requests keep their own quieter treatment. */}
      {hasPendingRequests && (
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-amber/10">
              <Clock className="h-5 w-5 text-amber" />
            </div>
            <h3 className="font-display text-lg text-forest">Pending Requests</h3>
          </div>

          {pendingRequests.map((request) => (
            <motion.div
              key={request.id}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col border border-sage/30 bg-white p-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-forest">
                    {request.street_number} {request.street_name}
                  </h4>
                  <p className="text-sm text-forest/70">
                    Requested: {new Date(request.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className="bg-amber/10 px-2 py-1 text-[11px] font-medium uppercase tracking-wider text-amber">
                  {request.verification_type}
                </span>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleWithdraw(request.id)}
                  disabled={withdrawingId === request.id}
                  className={cn(
                    'flex items-center gap-2 border border-terracotta/30 px-4 py-2 text-sm font-medium transition-all',
                    'text-terracotta hover:bg-terracotta/10',
                    'disabled:cursor-not-allowed disabled:opacity-50',
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

      {/* Civic footer: the shared rules that bind every property above. Shown once. */}
      {hasVerifiedProperties && (
        <aside className="bg-forest p-6 text-bone sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-bone/10">
              <ShieldCheck className="h-5 w-5 text-bone" aria-hidden="true" />
            </div>
            <div className="space-y-3">
              <p className="max-w-[60ch] text-[0.95rem] leading-relaxed text-bone/85">
                {multipleProperties ? 'Your properties are' : 'Your property is'} part of{' '}
                <span className="text-bone">{SOCIETY_NAME}</span>, with a set of rules that keep
                everyone safe and happy.
              </p>
              <Link
                href="/rules"
                className="group inline-flex items-center gap-1.5 text-sm font-semibold text-amber transition-colors hover:text-bone"
              >
                Read the rules
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
                  aria-hidden="true"
                />
              </Link>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
