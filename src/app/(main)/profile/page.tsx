'use client';

import { useClerk } from '@clerk/nextjs';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { motion, useReducedMotion } from 'framer-motion';
import MembershipCard from '@/components/profile/MembershipCard';
import CapabilitiesCard from '@/components/profile/CapabilitiesCard';

export default function ProfilePage() {
  const { data } = useCurrentUser();
  const { openUserProfile } = useClerk();
  const prefersReducedMotion = useReducedMotion();

  if (!data) return null;

  return (
    <motion.div
      className="space-y-6"
      initial={prefersReducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col gap-3 rounded-card border border-sage/25 bg-white p-4 shadow-[0_8px_32px_rgba(26,34,24,0.06)] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-sm font-semibold text-forest">Account &amp; security</p>
          <p className="mt-0.5 text-xs text-forest/65">
            Email addresses, password, and connected sign-in methods (Clerk).
          </p>
        </div>
        <button
          type="button"
          onClick={() => openUserProfile()}
          className="shrink-0 rounded-xl border border-sage/40 bg-bone px-4 py-2.5 text-sm font-medium text-forest transition-colors hover:border-forest/20 hover:bg-sage-light/50"
        >
          Manage account
        </button>
      </div>
      {data.membership && <MembershipCard membership={data.membership} />}
      {data.capabilities.length > 0 && <CapabilitiesCard capabilities={data.capabilities} />}
      {data.is_superadmin && (
        <div className="rounded-card bg-forest p-4 text-bone">
          <p className="text-sm font-medium">Super Administrator</p>
          <p className="text-xs text-bone/70">You have full system access</p>
        </div>
      )}
    </motion.div>
  );
}
