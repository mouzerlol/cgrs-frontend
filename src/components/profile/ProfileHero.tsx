'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { CurrentUserResponse } from '@/hooks/useCurrentUser';

interface ProfileHeroProps {
  user: CurrentUserResponse['user'];
  membership: CurrentUserResponse['membership'];
  clerkFallback?: { firstName?: string; lastName?: string; imageUrl?: string; email?: string };
}

function formatRole(role: string): string {
  return role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ProfileHero({ user, membership, clerkFallback }: ProfileHeroProps) {
  const prefersReducedMotion = useReducedMotion();

  const firstName = user.first_name || clerkFallback?.firstName || '';
  const lastName = user.last_name || clerkFallback?.lastName || '';
  const avatarUrl = user.avatar_url || clerkFallback?.imageUrl || '';
  const displayEmail = user.email || clerkFallback?.email || '';
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'No name set';
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white p-6 shadow-[0_8px_32px_rgba(26,34,24,0.08)]"
    >
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={fullName}
            className="h-24 w-24 rounded-full object-cover ring-4 ring-sage-light"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-forest text-2xl font-bold text-bone ring-4 ring-sage-light">
            {initials}
          </div>
        )}
        <div className="text-center sm:text-left">
          <h1 className="font-display text-2xl text-forest">{fullName}</h1>
          {displayEmail ? <p className="text-sm text-forest/90">{displayEmail}</p> : null}
          {membership && (
            <span className="mt-2 inline-block rounded-md bg-terracotta px-1.5 py-0.5 font-body text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-white">
              {formatRole(membership.role)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
