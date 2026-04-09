'use client';

import Image from 'next/image';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { SiteBreadcrumbs } from '@/components/ui/breadcrumb';
import { BrutallyMinimalHeroHeadingCard } from '@/components/sections/BrutallyMinimalHeroHeadingCard';

interface PageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  dark?: boolean;
  backgroundImage?: string;
  /** Variant for different page types: 'default' for marketing, 'compact' for functional pages, 'flush' for no gap below */
  variant?: 'default' | 'compact' | 'flush';
  /** When false, skip the trail under the hero (rare; e.g. embedded demos). Default true. */
  showBreadcrumbs?: boolean;
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
  variant = 'default',
  showBreadcrumbs = true,
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
      ? 'page-header pt-20 pb-0 md:pt-24 relative overflow-hidden'
      : 'page-header pt-20 pb-0 md:pt-24 relative overflow-hidden';

  const containerMinHeight = isCompact ? 'min-h-[100px]' : 'min-h-[200px]';

  return (
    <>
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

      {/* Floating Card */}
      <div className={`container relative z-10 flex items-end ${containerMinHeight}`}>
        <div
          ref={ref}
          className={`fade-up w-full ${isVisible ? 'visible' : ''}`}
        >
          <BrutallyMinimalHeroHeadingCard
            title={title}
            eyebrow={eyebrow}
            description={description}
            size={isCompact ? 'sm' : 'md'}
            className="max-w-xl"
          />
        </div>
      </div>
    </section>
    {showBreadcrumbs ? <SiteBreadcrumbs variant="belowHero" /> : null}
    </>
  );
}
