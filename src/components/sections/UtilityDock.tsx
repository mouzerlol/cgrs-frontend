'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useStaggeredReveal, useFadeUpObserver } from '@/hooks/useIntersectionObserver';
import Icon, { IconName } from '@/components/ui/Icon';
import { useAllFeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import { FEATURE_FLAG_IDS } from '@/lib/feature-flags';
import { cn } from '@/lib/utils';

export interface UtilityDockItem {
  name: string;
  href: string;
  icon: string;
  label: string;
  flagId?: string | null;
}

interface UtilityDockProps {
  items?: UtilityDockItem[];
  useIconComponent?: boolean;
  /** When true (default), negative top margin overlaps the hero. When false, dock sits in normal flow (e.g. below news). */
  overlapHero?: boolean;
}

const DEFAULT_FLAG_IDS = {
  'nav.report-issue': true,
  'nav.discussion': true,
  'nav.calendar': true,
  'nav.blog': true,
};

/**
 * Floating utility dock with icon links.
 * Overlaps hero section with elevated shadow.
 * Pass custom items or use defaults from constants.
 * Set useIconComponent=true to use Icon component instead of images.
 * The section respects `home.utility-dock`; individual tiles respect matching nav flags.
 */
export default function UtilityDock({ items, useIconComponent = false, overlapHero = true }: UtilityDockProps) {
  const utilityDockSectionEnabled = useFeatureFlag(FEATURE_FLAG_IDS.HOME_UTILITY_DOCK);
  const setRef = useStaggeredReveal(200, 100);
  useFadeUpObserver();
  const featureFlags = useAllFeatureFlags();

  const defaultItems: UtilityDockItem[] = [
    {
      name: 'Management Request',
      href: '/management-request',
      icon: '/icons/maintenance-request-icon.png',
      label: 'Management<br>Request',
      flagId: 'nav.report-issue',
    },
    {
      name: 'Message Board',
      href: '/discussion',
      icon: '/icons/notice-board-icon.png',
      label: 'Message<br>Board',
      flagId: 'nav.discussion',
    },
    {
      name: 'Community Calendar',
      href: '/calendar',
      icon: '/icons/community-events-icon.png',
      label: 'Community<br>Calendar',
      flagId: 'nav.calendar',
    },
    {
      name: 'Blog',
      href: '/blog',
      icon: '/icons/community-news-icon.png',
      label: 'Blog',
      flagId: 'nav.blog',
    },
  ];

  const dockItems = items || defaultItems;

  // Filter items based on feature flags
  const visibleItems = useMemo(() => {
    return dockItems.filter((item) => {
      if (!item.flagId) return true;
      // Use feature flag if available, otherwise default to true
      return featureFlags[item.flagId] ?? DEFAULT_FLAG_IDS[item.flagId as keyof typeof DEFAULT_FLAG_IDS] ?? true;
    });
  }, [dockItems, featureFlags]);

  if (!utilityDockSectionEnabled) {
    return null;
  }

  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <section
      className={cn(
        'utility-dock relative mx-auto py-lg px-md md:p-md bg-white rounded-dock shadow-dock w-fit max-w-full z-[100] fade-up',
        overlapHero ? '-mt-lg' : 'mt-lg',
      )}
    >
      <div className="utility-grid flex flex-wrap justify-center gap-md sm:gap-5 sm:flex-nowrap md:gap-md">
        {visibleItems.map((item, index) => (
          <Link
            key={item.name}
            href={item.href}
            className="utility-item group flex flex-col items-center justify-center gap-2.5 p-4 rounded-xl bg-transparent transition-all duration-300 ease-out-custom cursor-pointer w-[140px] sm:w-[160px] md:w-[180px] shrink-0 hover:-translate-y-1 hover:bg-sage-light"
            aria-label={item.name}
            ref={setRef(index)}
          >
            {useIconComponent ? (
              <Icon name={item.icon as IconName} size="xl" className="w-[90px] h-[90px] md:w-[110px] md:h-[110px] object-contain transition-all duration-400 ease-out-custom drop-shadow-[0_2px_8px_rgba(26,34,24,0.08)] group-hover:scale-[1.08] group-hover:drop-shadow-[0_4px_12px_rgba(26,34,24,0.12)]" />
            ) : (
              <Image
                src={item.icon}
                alt={item.name}
                width={110}
                height={110}
                className="w-[90px] h-[90px] md:w-[110px] md:h-[110px] object-contain transition-all duration-400 ease-out-custom drop-shadow-[0_2px_8px_rgba(26,34,24,0.08)] group-hover:scale-[1.08] group-hover:drop-shadow-[0_4px_12px_rgba(26,34,24,0.12)]"
                loading="lazy"
              />
            )}
            <span
              className="font-body text-[0.65rem] md:text-xs font-semibold uppercase tracking-[0.12em] md:tracking-[0.15em] text-center text-forest/80 leading-snug group-hover:text-forest"
              dangerouslySetInnerHTML={{ __html: item.label.replace('\n', '<br>') }}
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
