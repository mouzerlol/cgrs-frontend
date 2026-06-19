'use client';

import Image from 'next/image';
import { isNonOptimizableImageSrc } from '@/lib/image';
import { cn } from '@/lib/utils';
import type { CurrentUserResponse } from '@/hooks/useCurrentUser';

interface ProfileIdentityCardProps {
  user: CurrentUserResponse['user'];
  membership: CurrentUserResponse['membership'];
  clerkFallback?: { firstName?: string; lastName?: string; imageUrl?: string; email?: string };
  /**
   * `card` sits at the top of the nav rail / mobile drawer, above the nav
   * buttons. `trigger` is the compact identity chip inside the mobile menu
   * button that opens the drawer.
   */
  variant?: 'card' | 'trigger';
  /**
   * When provided, the `card` variant renders as a button that activates the
   * profile-details tab (the card doubles as a link to your profile).
   */
  onActivate?: () => void;
  className?: string;
}

function formatRole(role: string): string {
  return role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * The signed-in resident's identity (avatar, name, role) shown at the top of the
 * account nav rail and drawer. Replaces the former page-top ProfileHero header,
 * reclaiming vertical space. Derivation mirrors the old hero so the displayed
 * name/initials/avatar are unchanged.
 */
export default function ProfileIdentityCard({
  user,
  membership,
  clerkFallback,
  variant = 'card',
  onActivate,
  className,
}: ProfileIdentityCardProps) {
  const firstName = user.first_name || clerkFallback?.firstName || '';
  const lastName = user.last_name || clerkFallback?.lastName || '';
  const avatarUrl = user.avatar_url || clerkFallback?.imageUrl || '';
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'No name set';
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  const role = membership ? formatRole(membership.role) : null;

  const isTrigger = variant === 'trigger';
  const size = isTrigger ? 32 : 44;

  // alt="" because the name sits adjacent as text; a duplicate label would just
  // be noise for screen readers.
  const avatar = avatarUrl ? (
    <Image
      src={avatarUrl}
      alt=""
      width={size}
      height={size}
      unoptimized={isNonOptimizableImageSrc(avatarUrl)}
      style={{ width: size, height: size }}
      className="shrink-0 rounded-full object-cover ring-2 ring-bone/15"
    />
  ) : (
    <span
      aria-hidden="true"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-forest font-display font-medium leading-none text-bone ring-2 ring-bone/15"
    >
      {initials}
    </span>
  );

  if (isTrigger) {
    return (
      <span className={cn('flex min-w-0 flex-1 items-center gap-2.5', className)}>
        {avatar}
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium text-bone" title={fullName}>
            {fullName}
          </span>
          {role && (
            <span className="block truncate text-[0.625rem] uppercase tracking-[0.1em] text-sage-light">
              {role}
            </span>
          )}
        </span>
      </span>
    );
  }

  const cardClasses = cn('mb-0 flex items-center gap-3 border-b border-bone/15 pb-4 lg:mb-6', className);
  const cardBody = (
    <>
      {avatar}
      <div className="min-w-0">
        <p
          className="truncate font-display text-[0.95rem] leading-tight text-bone underline-offset-2 decoration-bone/40 group-hover:underline"
          title={fullName}
        >
          {fullName}
        </p>
        {role && (
          <p className="mt-0.5 text-[0.6875rem] uppercase tracking-[0.12em] text-sage-light">{role}</p>
        )}
      </div>
    </>
  );

  if (onActivate) {
    return (
      <button
        type="button"
        onClick={onActivate}
        aria-label={role ? `${fullName}, ${role}. View profile details` : `${fullName}. View profile details`}
        className={cn(
          cardClasses,
          'group w-full cursor-pointer text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-terracotta',
        )}
      >
        {cardBody}
      </button>
    );
  }

  return <div className={cardClasses}>{cardBody}</div>;
}
