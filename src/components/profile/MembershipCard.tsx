'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { MembershipResponse } from '@/hooks/useCurrentUser';
import { profileSectionTitleSmClass } from '@/components/profile/profileSectionTitle';
import { cn } from '@/lib/utils';

function formatRole(role: string): string {
  return role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(isoString: string | null | undefined): string {
  if (!isoString) return '—';
  const d = new Date(isoString);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
}

interface MembershipCardProps {
  membership: MembershipResponse;
}

export default function MembershipCard({ membership }: MembershipCardProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="bg-white p-6 shadow-[0_8px_32px_rgba(26,34,24,0.08)]"
    >
      <h3 className={cn('mb-4', profileSectionTitleSmClass)}>Community Membership</h3>
      <div className="space-y-3">
        <div className="flex justify-between border-b border-bone pb-2">
          <span className="text-sm font-medium text-forest/70">Role</span>
          <span className="text-sm font-semibold text-terracotta">{formatRole(membership.role)}</span>
        </div>
        <div className="flex justify-between border-b border-bone pb-2">
          <span className="text-sm font-medium text-forest/70">Member since</span>
          <span className="text-sm text-forest">{formatDate(membership.created_at)}</span>
        </div>
      </div>
    </motion.div>
  );
}
