'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface HeroHeadingCardProps {
  /** Main heading text */
  title: string;
  /** Optional eyebrow label below the heading */
  eyebrow?: string;
  /** Description/body text */
  description?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Standalone hero heading card with large display title.
 * For use within an existing layout or background.
 */
export function HeroHeadingCard({
  title,
  eyebrow,
  description,
  size = 'lg',
  className,
}: HeroHeadingCardProps) {
  const sizeClasses = {
    sm: {
      eyebrow: 'text-[10px]',
      title: 'text-xl md:text-2xl',
      description: 'text-sm',
    },
    md: {
      eyebrow: 'text-xs',
      title: 'text-2xl md:text-3xl',
      description: 'text-base',
    },
    lg: {
      eyebrow: 'text-xs',
      title: 'text-3xl md:text-4xl',
      description: 'text-base',
    },
  };

  const s = sizeClasses[size];

  return (
    <div className={cn('max-w-xl', className)}>
      {/* Main Heading - bold and prominent */}
      <h1
        className={cn(
          'font-display font-bold tracking-tight leading-tight text-forest mb-3',
          s.title
        )}
      >
        {title}
      </h1>

      {/* Eyebrow - positioned below H1 */}
      {eyebrow && (
        <span
          className={cn(
            'inline-block mb-4 px-2 py-0.5 bg-terracotta text-bone font-semibold uppercase tracking-widest',
            s.eyebrow
          )}
        >
          {eyebrow}
        </span>
      )}

      {/* Description */}
      {description && (
        <p className={cn('text-forest/80 leading-relaxed', s.description)}>
          {description}
        </p>
      )}
    </div>
  );
}

interface HeroPageHeaderProps {
  /** Main heading text */
  title: string;
  /** Optional eyebrow label below the heading */
  eyebrow?: string;
  /** Description/body text */
  description?: string;
  /** Background image URL */
  backgroundImage: string;
  /** Background overlay opacity (0-1), default 0.4 */
  overlayOpacity?: number;
  /** Card size */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Full-page hero header with bottom-left positioned content card.
 *
 * Creates the AAF-style layout where:
 * - Background image fills most of the viewport
 * - Dark gradient overlay on the image
 * - Light card positioned at bottom-left, bridging hero and content areas
 * - Card has sharp contrast: light bg, dark bold text
 *
 * The card creates a visual "step" as it occupies the transition zone
 * between the hero image and page body content below.
 */
export function HeroPageHeader({
  title,
  eyebrow,
  description,
  backgroundImage,
  overlayOpacity = 0.4,
  size = 'lg',
  className,
}: HeroPageHeaderProps) {
  const sizeClasses = {
    sm: { minHeight: 'min-h-[50vh]', cardPadding: 'p-4 md:p-5' },
    md: { minHeight: 'min-h-[50vh]', cardPadding: 'p-5 md:p-6' },
    lg: { minHeight: 'min-h-[50vh]', cardPadding: 'p-6 md:p-8' },
  };

  const { minHeight, cardPadding } = sizeClasses[size];

  return (
    <header className={cn('relative overflow-hidden', minHeight, className)}>
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={backgroundImage}
          alt=""
          fill
          className="object-cover"
          priority
        />
        {/* Dark gradient overlay - heavier at bottom to lift the card */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom, rgba(26,34,24,${overlayOpacity}) 0%, rgba(26,34,24,${overlayOpacity * 1.5}) 60%, rgba(26,34,24,${overlayOpacity * 0.8}) 100%)`,
          }}
        />
      </div>

      {/* Content Card - bottom-positioned, full-width bg-bone strip */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        {/* Full-width bg-bone extends to viewport edges */}
        <div className="bg-bone">
          {/* Container aligns text with page content below */}
          <div className="container">
            <div className={cn('max-w-md', cardPadding)}>
              <HeroHeadingCard
                title={title}
                eyebrow={eyebrow}
                description={description}
                size={size}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
