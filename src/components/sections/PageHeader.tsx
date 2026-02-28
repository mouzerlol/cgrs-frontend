'use client';

import Image from 'next/image';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface PageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  dark?: boolean;
  backgroundImage?: string;
  /** Variant for different page types: 'default' for marketing, 'compact' for functional pages, 'flush' for no gap below */
  variant?: 'default' | 'compact' | 'flush';
}

/**
 * Page header with floating glassmorphism card over full-bleed image.
 *
 * Variants:
 * - 'default': Standard marketing page header with generous spacing
 * - 'compact': Reduced spacing for functional/utility pages (e.g., discussions, calendar)
 * - 'flush': No bottom gap, content flows directly below (e.g., calendar with forest-light bar)
 */
export default function PageHeader({
  title,
  description,
  eyebrow,
  dark = true,
  backgroundImage,
  variant = 'default'
}: PageHeaderProps) {
  const [ref, isVisible] = useIntersectionObserver<HTMLDivElement>({ threshold: 0.2 });

  const isCompact = variant === 'compact' || variant === 'flush';
  const isFlush = variant === 'flush';

  // Variant-specific classes
  // Note: Top padding must account for fixed nav height (~64px) + margin
  // Compact reduces bottom padding; flush removes it entirely
  const sectionClasses = isFlush
    ? 'page-header pt-20 pb-0 md:pt-24 relative overflow-hidden'
    : isCompact
      ? 'page-header pt-20 pb-5 md:pt-24 md:pb-6 relative overflow-hidden'
      : 'page-header pt-20 pb-6 md:pt-24 md:pb-8 relative overflow-hidden';

  const containerMinHeight = isCompact ? 'min-h-[100px]' : 'min-h-[200px]';
  const cardPadding = isCompact ? 'p-3 md:p-4' : 'p-4 md:p-6';
  const titleSize = isCompact
    ? 'clamp(1.25rem, 3vw, 1.5rem)'
    : 'clamp(1.5rem, 4vw, 2rem)';

  return (
    <section className={sectionClasses}>
      {/* Full-bleed Background Image */}
      {backgroundImage && (
        <div className="absolute inset-0 z-0">
          <Image
            src={backgroundImage}
            alt=""
            fill
            className="object-cover"
            priority
          />
          {/* Light overlay for text readability */}
          <div className="absolute inset-0 bg-forest/25" />
        </div>
      )}

      {/* Floating Glassmorphism Card */}
      <div className={`container relative z-10 flex items-center ${containerMinHeight}`}>
        <div
          ref={ref}
          className={`fade-up ${isVisible ? 'visible' : ''}`}
        >
          <div className="max-w-xl">
            {/* Card header - glassmorphism */}
            <div className={`bg-bone/50 backdrop-blur-md rounded-t-xl ${cardPadding}`}>
              {eyebrow && (
                <span className="text-eyebrow !text-bone inline-block px-2 py-0.5 mb-2 bg-terracotta rounded-md">
                  {eyebrow}
                </span>
              )}
              <h1
                className="font-semibold text-forest leading-tight truncate whitespace-nowrap"
                style={{ fontSize: titleSize }}
              >
                {title}
              </h1>
            </div>
            {/* Card body - solid sage-light */}
            {description && (
              <div className={`bg-sage-light rounded-b-xl ${cardPadding} -mt-1`}>
                <p className="text-sm leading-normal opacity-80 text-forest/90 truncate whitespace-nowrap">
                  {description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
