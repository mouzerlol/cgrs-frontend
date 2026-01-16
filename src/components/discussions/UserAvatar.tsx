'use client';

import { forwardRef, HTMLAttributes } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
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
    const sizeClasses = {
      sm: { avatar: 'w-8 h-8', text: 'text-sm', title: 'text-xs' },
      md: { avatar: 'w-10 h-10', text: 'text-sm', title: 'text-xs' },
      lg: { avatar: 'w-14 h-14', text: 'text-base', title: 'text-sm' },
    };

    const sizes = sizeClasses[size];

    // Generate initials from display name
    const initials = user.displayName
      .split(/(?=[A-Z])|[^a-zA-Z]/)
      .filter(Boolean)
      .slice(0, 2)
      .map(s => s[0]?.toUpperCase())
      .join('');

    return (
      <div
        ref={ref}
        className={cn('flex items-center gap-2', className)}
        {...props}
      >
        {/* Avatar */}
        <div
          className={cn(
            'relative rounded-full overflow-hidden bg-sage-light flex items-center justify-center flex-shrink-0',
            sizes.avatar
          )}
        >
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt={user.displayName}
              fill
              className="object-cover"
            />
          ) : (
            <span className="font-semibold text-forest/60">{initials}</span>
          )}
        </div>

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
