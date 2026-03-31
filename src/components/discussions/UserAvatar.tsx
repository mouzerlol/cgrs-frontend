'use client';

import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar';
import type { ForumUser } from '@/types';

interface UserAvatarProps extends HTMLAttributes<HTMLDivElement> {
  /** Forum user data */
  user: ForumUser;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show user title below name */
  showTitle?: boolean;
  /** Show badges */
  showBadges?: boolean;
  /** Show only avatar (no name/title) */
  avatarOnly?: boolean;
  /** Link to user profile (future feature) */
  href?: string;
}

/** Badge icons mapping */
const BADGE_ICONS: Record<string, string> = {
  'early-bird': '🐦',
  'helpful-neighbor': '🤝',
  'founding-member': '⭐',
  'committee': '🏛️',
  'conversation-starter': '💬',
  'green-thumb': '🌱',
  'night-owl': '🦉',
  'poll-master': '📊',
};

/** Maps UserAvatar sizes to Avatar sizes */
const AVATAR_SIZE_MAP = {
  sm: 'sm',
  md: 'md',
  lg: 'xl',
} as const;

const TEXT_SIZE_MAP = {
  sm: { text: 'text-sm', title: 'text-xs' },
  md: { text: 'text-sm', title: 'text-xs' },
  lg: { text: 'text-base', title: 'text-sm' },
};

/**
 * User avatar component with name, garden-themed title, and badges.
 * Displays anonymous user identity with gamification elements.
 */
const UserAvatar = forwardRef<HTMLDivElement, UserAvatarProps>(
  ({
    user,
    size = 'md',
    showTitle = true,
    showBadges = true,
    avatarOnly = false,
    className,
    ...props
  }, ref) => {
    const sizes = TEXT_SIZE_MAP[size];

    return (
      <div
        ref={ref}
        className={cn('flex items-center gap-2', className)}
        {...props}
      >
        <Avatar
          src={user.avatar}
          alt={user.displayName}
          name={user.displayName}
          size={AVATAR_SIZE_MAP[size]}
        />

        {/* User Info */}
        {!avatarOnly && (
          <div className="flex flex-col min-w-0">
            {/* Name Row */}
            <div className="flex items-center gap-1.5">
              <span className={cn('font-semibold text-forest truncate', sizes.text)}>
                {user.displayName}
              </span>

              {/* Badges */}
              {showBadges && user.badges.length > 0 && (
                <span className="flex items-center gap-0.5 flex-shrink-0">
                  {user.badges.slice(0, 3).map((badgeId) => (
                    <span
                      key={badgeId}
                      className="text-xs"
                      title={badgeId.replace(/-/g, ' ')}
                    >
                      {BADGE_ICONS[badgeId] || '🏅'}
                    </span>
                  ))}
                </span>
              )}
            </div>

            {/* Title */}
            {showTitle && user.title && (
              <span className={cn('text-terracotta font-medium', sizes.title)}>
                {user.title}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }
);

UserAvatar.displayName = 'UserAvatar';

export default UserAvatar;
