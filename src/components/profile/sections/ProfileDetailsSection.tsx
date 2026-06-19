'use client';

import { useClerk } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { User, Settings, Shield } from 'lucide-react';
import { useCurrentUserQuery } from '@/hooks/useProfileData';
import AccountSectionHeading from '@/components/profile/AccountSectionHeading';
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
        <div className="space-y-4">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!userData) return null;

  return (
    <motion.div
      className="space-y-6 lg:pl-8 lg:[&>*:first-child]:-ml-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <AccountSectionHeading
        eyebrow="Account"
        title="Profile Details"
        subtitle="Manage your account settings and preferences."
        icon={User}
        action={
          <button
            type="button"
            onClick={() => openUserProfile()}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-terracotta px-4 py-2 text-sm font-semibold text-bone transition-colors hover:bg-terracotta-dark"
          >
            <Settings className="w-4 h-4" />
            Manage account
          </button>
        }
      />

      {/* Membership Card */}
      {userData.membership && (
        <div>
          <MembershipCard membership={userData.membership} />
        </div>
      )}

      {/* Capabilities Card */}
      {userData.capabilities.length > 0 && (
        <div>
          <CapabilitiesCard capabilities={userData.capabilities} />
        </div>
      )}

      {/* Superadmin indicator */}
      {userData.is_superadmin && (
        <div>
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
