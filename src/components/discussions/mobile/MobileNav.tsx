'use client';

import {
  forwardRef,
  useRef,
  useEffect,
  useState,
  useCallback,
  type HTMLAttributes,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import type { DiscussionCategory, DiscussionCategorySlug } from '@/types';

interface MobileNavProps extends HTMLAttributes<HTMLDivElement> {
  /** List of categories to display */
  categories: DiscussionCategory[];
  /** Currently active category (null = "All") */
  activeCategory: DiscussionCategorySlug | null;
  /** Callback when category is selected */
  onSelectCategory: (slug: DiscussionCategorySlug | null) => void;
  /** Show thread count per category */
  showCounts?: boolean;
  /** Thread counts by category */
  categoryCounts?: Record<DiscussionCategorySlug, number>;
}

/**
 * Mobile-optimized horizontal scrolling category navigation.
 *
 * Features:
 * - Horizontally scrollable category pills
 * - "All" option to show all categories
 * - Active category with visual highlight
 * - Minimum 44px touch targets
 * - Hidden scrollbar with smooth momentum scrolling
 * - Fade edges to indicate more content
 * - Auto-scroll to keep active category visible
 */
const MobileNav = forwardRef<HTMLDivElement, MobileNavProps>(
  ({
    categories,
    activeCategory,
    onSelectCategory,
    showCounts = false,
    categoryCounts,
    className,
    ...props
  }, ref) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showLeftFade, setShowLeftFade] = useState(false);
    const [showRightFade, setShowRightFade] = useState(true);

    // Update fade visibility based on scroll position
    const updateFades = useCallback(() => {
      const container = scrollRef.current;
      if (!container) return;

      const { scrollLeft, scrollWidth, clientWidth } = container;
      setShowLeftFade(scrollLeft > 10);
      setShowRightFade(scrollLeft < scrollWidth - clientWidth - 10);
    }, []);

    // Auto-scroll to active category
    useEffect(() => {
      const container = scrollRef.current;
      if (!container) return;

      const activeButton = container.querySelector('[data-active="true"]');
      if (activeButton) {
        const containerRect = container.getBoundingClientRect();
        const buttonRect = activeButton.getBoundingClientRect();
        const scrollOffset =
          buttonRect.left -
          containerRect.left -
          containerRect.width / 2 +
          buttonRect.width / 2;

        container.scrollBy({
          left: scrollOffset,
          behavior: 'smooth',
        });
      }
    }, [activeCategory]);

    // Set up scroll listener
    useEffect(() => {
      const container = scrollRef.current;
      if (!container) return;

      updateFades();
      container.addEventListener('scroll', updateFades, { passive: true });
      window.addEventListener('resize', updateFades);

      return () => {
        container.removeEventListener('scroll', updateFades);
        window.removeEventListener('resize', updateFades);
      };
    }, [updateFades]);

    const getCategoryColor = (color: DiscussionCategory['color']) => {
      switch (color) {
        case 'terracotta':
          return 'bg-terracotta text-bone';
        case 'forest':
          return 'bg-forest text-bone';
        case 'sage':
          return 'bg-sage text-forest';
        default:
          return 'bg-sage-light text-forest';
      }
    };

    const getInactiveStyle = (color: DiscussionCategory['color']) => {
      switch (color) {
        case 'terracotta':
          return 'border-terracotta/30 text-terracotta hover:bg-terracotta/10';
        case 'forest':
          return 'border-forest/30 text-forest hover:bg-forest/10';
        case 'sage':
          return 'border-sage text-forest hover:bg-sage-light';
        default:
          return 'border-sage/50 text-forest/70 hover:bg-sage-light';
      }
    };

    return (
      <div
        ref={ref}
        className={cn('relative', className)}
        {...props}
      >
        {/* Left Fade Indicator */}
        <AnimatePresence>
          {showLeftFade && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={cn(
                'absolute left-0 top-0 bottom-0 w-12 z-10',
                'bg-gradient-to-r from-bone via-bone/80 to-transparent',
                'pointer-events-none'
              )}
            />
          )}
        </AnimatePresence>

        {/* Right Fade Indicator */}
        <AnimatePresence>
          {showRightFade && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={cn(
                'absolute right-0 top-0 bottom-0 w-12 z-10',
                'bg-gradient-to-l from-bone via-bone/80 to-transparent',
                'pointer-events-none'
              )}
            />
          )}
        </AnimatePresence>

        {/* Scrollable Container */}
        <div
          ref={scrollRef}
          className={cn(
            'flex items-center gap-2 overflow-x-auto',
            'px-4 py-2',
            'scrollbar-hide',
            '-webkit-overflow-scrolling-touch'
          )}
        >
          {/* "All" Option */}
          <motion.button
            type="button"
            data-active={activeCategory === null}
            onClick={() => onSelectCategory(null)}
            className={cn(
              'flex-shrink-0',
              'flex items-center gap-2',
              'px-4 py-2.5 min-h-[44px]',
              'rounded-full border-2',
              'font-body text-sm font-semibold',
              'transition-all duration-200',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-forest/50',
              activeCategory === null
                ? 'bg-forest text-bone border-forest shadow-md'
                : 'bg-transparent border-forest/30 text-forest hover:bg-forest/10'
            )}
            whileTap={{ scale: 0.95 }}
          >
            <Icon icon="lucide:layout-grid" className="w-4 h-4" />
            <span>All</span>
          </motion.button>

          {/* Category Pills */}
          {categories.map((category) => {
            const isActive = activeCategory === category.slug;
            const count = categoryCounts?.[category.slug];

            return (
              <motion.button
                key={category.slug}
                type="button"
                data-active={isActive}
                onClick={() => onSelectCategory(category.slug)}
                className={cn(
                  'flex-shrink-0',
                  'flex items-center gap-2',
                  'px-4 py-2.5 min-h-[44px]',
                  'rounded-full border-2',
                  'font-body text-sm font-semibold',
                  'transition-all duration-200',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-forest/50',
                  isActive
                    ? cn(getCategoryColor(category.color), 'border-transparent shadow-md')
                    : cn('bg-transparent', getInactiveStyle(category.color))
                )}
                whileTap={{ scale: 0.95 }}
              >
                <Icon icon={category.icon} className="w-4 h-4" />
                <span className="whitespace-nowrap">{category.name}</span>
                {showCounts && count !== undefined && (
                  <span
                    className={cn(
                      'px-1.5 py-0.5 text-xs rounded-full',
                      isActive
                        ? 'bg-bone/20 text-current'
                        : 'bg-current/10 text-current'
                    )}
                  >
                    {count}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  }
);

MobileNav.displayName = 'MobileNav';

export default MobileNav;
