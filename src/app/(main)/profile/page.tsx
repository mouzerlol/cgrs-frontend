'use client';

import { useCurrentUser } from '@/hooks/useCurrentUser';
import { motion, useReducedMotion } from 'framer-motion';
import MembershipCard from '@/components/profile/MembershipCard';
import CapabilitiesCard from '@/components/profile/CapabilitiesCard';

export default function ProfilePage() {
  const { data } = useCurrentUser();
  const prefersReducedMotion = useReducedMotion();

  if (!data) return null;

  return (
    <motion.div
      className="space-y-6"
      initial={prefersReducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
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
