'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

export interface BrutallyMinimalHeroHeadingCardProps {
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
 * Standalone hero heading card with brutalist minimal aesthetic.
 * Alternative to the standard HeroHeadingCard.
 */
export function BrutallyMinimalHeroHeadingCard({
  title,
  eyebrow,
  description,
  size = 'lg',
  className,
}: BrutallyMinimalHeroHeadingCardProps) {
  const sizeClasses = {
    sm: {
      eyebrow: 'text-[10px]',
      title: 'text-3xl md:text-4xl',
      description: 'text-xs md:text-sm',
      padding: 'py-4 px-8 sm:py-6 sm:px-12',
    },
    md: {
      eyebrow: 'text-[10px] md:text-xs',
      title: 'text-4xl md:text-5xl',
      description: 'text-sm md:text-base',
      padding: 'py-6 px-12 sm:py-8 sm:px-16',
    },
    lg: {
      eyebrow: 'text-xs md:text-sm',
      title: 'text-5xl md:text-7xl',
      description: 'text-base md:text-lg',
      padding: 'py-6 px-12 sm:py-10 sm:px-20',
    },
  };

  const s = sizeClasses[size];

  return (
    <div 
      className={cn(
        'bg-bone text-black inline-flex flex-col rounded-t-2xl', 
        s.padding, 
        className
      )}
    >
      <div className="flex flex-col h-full">
        {eyebrow && (
          <div className="mb-2">
            <span className="text-eyebrow !text-bone inline-block px-2 py-0.5 bg-terracotta rounded-md">
              {eyebrow}
            </span>
          </div>
        )}
        
        <h1 
          className={cn(
            'font-display font-medium leading-none mb-6 text-balance', 
            s.title
          )}
        >
          {title}
        </h1>

        {description && (
          <p className={cn('font-sans leading-snug', s.description)}>
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

export interface BrutallyMinimalHeroPageHeaderProps {
  /** Main heading text */
  title: string;
  /** Optional eyebrow label below the heading */
  eyebrow?: string;
  /** Description/body text */
  description?: string;
  /** Background image URL */
  backgroundImage: string;
  /** Card size */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Full-page hero header with brutally minimal aesthetic.
 */
export function BrutallyMinimalHeroPageHeader({
  title,
  eyebrow,
  description,
  backgroundImage,
  size = 'lg',
  className,
}: BrutallyMinimalHeroPageHeaderProps) {
  const sizeClasses = {
    sm: { minHeight: 'min-h-[50vh]', cardMaxWidth: 'max-w-xl' },
    md: { minHeight: 'min-h-[60vh]', cardMaxWidth: 'max-w-2xl' },
    lg: { minHeight: 'min-h-[70vh]', cardMaxWidth: 'max-w-3xl' },
  };

  const { minHeight, cardMaxWidth } = sizeClasses[size];

  return (
    <header className={cn('relative flex items-end overflow-hidden', minHeight, className)}>
      {/* Background Image - Grayscale */}
      <div className="absolute inset-0 z-0 bg-forest">
        <Image
          src={backgroundImage}
          alt=""
          fill
          className="object-cover grayscale mix-blend-luminosity opacity-60"
          priority
        />
      </div>

      {/* Content Card - positioned flush at bottom left */}
      <div className="relative z-10 w-full container pt-32">
        <BrutallyMinimalHeroHeadingCard
          title={title}
          eyebrow={eyebrow}
          description={description}
          size={size}
          className={cardMaxWidth}
        />
      </div>
    </header>
  );
}
