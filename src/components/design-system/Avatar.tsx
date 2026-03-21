'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  /** Used for initials when `src` is missing or the image fails to load. */
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'card';
  className?: string;
  title?: string;
}

const sizeMap = {
  xs: 'w-5 h-5 text-[9px]',
  sm: 'w-9 h-9 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  /** Task board cards: 24px circle */
  card: 'w-6 h-6 text-[10px]',
};

/** Builds up to two initials from a display name for the fallback glyph. */
function initialsFromName(label: string): string {
  const trimmed = label.trim();
  if (!trimmed) return '?';
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const a = parts[0][0];
    const b = parts[parts.length - 1][0];
    if (a && b) return `${a}${b}`.toUpperCase();
  }
  return trimmed.slice(0, 2).toUpperCase();
}

export const Avatar = ({ src, alt, name, size = 'sm', className, title }: AvatarProps) => {
  const [imageFailed, setImageFailed] = useState(false);
  const labelForInitials = name ?? alt ?? '';
  const showImage = Boolean(src) && !imageFailed;

  useEffect(() => {
    setImageFailed(false);
  }, [src]);

  const dimensionClass = sizeMap[size];

  return (
    <div className={cn('relative shrink-0', className)} title={title}>
      {showImage ? (
        <img
          src={src!}
          alt={alt || 'User'}
          onError={() => setImageFailed(true)}
          className={cn(
            dimensionClass,
            'rounded-full object-cover border-2 border-white shadow-sm ring-1 ring-sage/10',
          )}
        />
      ) : (
        <div
          role="img"
          aria-label={alt || name || 'User'}
          className={cn(
            dimensionClass,
            'rounded-full border-2 border-white shadow-sm ring-1 ring-sage/10',
            'flex items-center justify-center font-semibold bg-sage/35 text-forest/80 select-none',
          )}
        >
          {initialsFromName(labelForInitials)}
        </div>
      )}
    </div>
  );
};
