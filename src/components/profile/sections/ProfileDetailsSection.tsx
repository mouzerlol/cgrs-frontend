'use client';

import { useClerk } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { User, Key, Shield } from 'lucide-react';
import { useCurrentUserQuery } from '@/hooks/useProfileData';
import MembershipCard from '@/components/profile/MembershipCard';
import CapabilitiesCard from '@/components/profile/CapabilitiesCard';
import { Skeleton } from '@/components/ui/Skeleton';

export default function ProfileDetailsSection() {
  const { data: userData, isLoading } = useCurrentUserQuery();
  const { openUserProfile } = useClerk();

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
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!userData) return null;

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header with icon */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-forest/10">
          <User className="h-6 w-6 text-forest" />
        </div>
        <div>
          <h2 className="font-display text-2xl text-forest">Profile Details</h2>
          <p className="text-sm text-forest/60">
            Manage your account settings and preferences.
          </p>
        </div>
      </div>

      {/* Account & Security Card */}
      <div className="ml-14">
        <div className="flex flex-col gap-3 border border-sage/25 bg-white p-6 shadow-[0_8px_32px_rgba(26,34,24,0.06)] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sage/10">
              <Key className="h-5 w-5 text-forest" />
            </div>
            <div>
              <h3 className="font-display text-sm font-semibold text-forest">Account &amp; security</h3>
              <p className="text-xs text-forest/65">
                Email addresses, password, and connected sign-in methods (Clerk).
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => openUserProfile()}
            className="shrink-0 rounded-xl border border-sage/40 bg-bone px-4 py-2.5 text-sm font-medium text-forest transition-colors hover:border-forest/20 hover:bg-sage-light/50"
          >
            Manage account
          </button>
        </div>
      </div>

      {/* Membership Card */}
      {userData.membership && (
        <div className="ml-14">
          <MembershipCard membership={userData.membership} />
        </div>
      )}

      {/* Capabilities Card */}
      {userData.capabilities.length > 0 && (
        <div className="ml-14">
          <CapabilitiesCard capabilities={userData.capabilities} />
        </div>
      )}

      {/* Superadmin indicator */}
      {userData.is_superadmin && (
        <div className="ml-14">
          <div className="flex items-center gap-3 rounded-xl bg-forest p-4 text-bone">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-bone/10">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium">Super Administrator</p>
              <p className="text-xs text-bone/70">You have full system access</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
