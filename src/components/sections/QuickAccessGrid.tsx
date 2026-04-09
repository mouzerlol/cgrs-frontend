'use client';

import { useMemo } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { useAllFeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import { FEATURE_FLAG_IDS } from '@/lib/feature-flags';
import { QuickAccessCardType } from '@/components/ui/QuickAccessCard';
import BrutallyMinimalCard from '@/components/ui/experimental-cards/BrutallyMinimalCard';

const DEFAULT_FLAG_IDS: Record<string, boolean> = {
  [FEATURE_FLAG_IDS.NAV_REPORT_ISSUE]: true,
  [FEATURE_FLAG_IDS.NAV_DISCUSSION]: true,
  [FEATURE_FLAG_IDS.NAV_CALENDAR]: true,
  [FEATURE_FLAG_IDS.NAV_BLOG]: true,
  [FEATURE_FLAG_IDS.NAV_MAP]: true,
};

const CARDS: QuickAccessCardType[] = [
  {
    title: 'Report an Issue',
    description: 'Report maintenance & community issues',
    href: '/management-request',
    type: 'large',
    backgroundImage: '/images/quick-access/report-issue.png',
    flagId: FEATURE_FLAG_IDS.NAV_REPORT_ISSUE,
  },
  {
    title: 'Message Board',
    description: 'Community notices & announcements',
    href: '/discussion',
    type: 'simple',
    icon: 'message',
    backgroundImage: '/images/quick-access/message-board.png',
    flagId: FEATURE_FLAG_IDS.NAV_DISCUSSION,
  },
  {
    title: 'Committee Blog',
    description: 'Updates from your committee',
    href: '/blog',
    type: 'simple',
    icon: 'edit',
    backgroundImage: '/images/quick-access/committee-blog.png',
    flagId: FEATURE_FLAG_IDS.NAV_BLOG,
  },
  {
    title: 'CGRS Calendar',
    description: 'Community events & activities',
    href: '/calendar',
    type: 'simple',
    icon: 'calendar',
    backgroundImage: '/images/quick-access/cgrs-calendar.png',
    flagId: FEATURE_FLAG_IDS.NAV_CALENDAR,
  },
  {
    title: 'Coronation Gardens Map',
    description: 'Explore our community boundaries',
    href: '/map',
    type: 'simple',
    icon: 'map',
    backgroundImage: '/images/quick-access/coronation-gardens-map.png',
    flagId: FEATURE_FLAG_IDS.NAV_MAP,
  },
  {
    title: 'Community Guidelines',
    description: 'Rules, forms & policies',
    href: '/guidelines',
    type: 'simple',
    icon: 'document',
    backgroundImage: '/images/quick-access/community-guidelines.png',
  },
  {
    title: 'Connect',
    description: 'Join our Facebook & Messenger',
    href: '/contact?subject=connect',
    type: 'simple',
    icon: 'share',
    backgroundImage: '/images/quick-access/connect.png',
  },
];

/**
 * Quick Access grid with mixed card layouts.
 * Features large card with background image and smaller utility cards.
 * The block respects `home.quick-access`; individual tiles respect matching nav flags.
 */
export default function QuickAccessGrid() {
  const quickAccessSectionEnabled = useFeatureFlag(FEATURE_FLAG_IDS.HOME_QUICK_ACCESS);
  const [headerRef, headerVisible] = useIntersectionObserver<HTMLDivElement>({ threshold: 0.2 });
  const featureFlags = useAllFeatureFlags();

  if (!quickAccessSectionEnabled) {
    return null;
  }

  // Filter cards based on feature flags
  const visibleCards = useMemo(() => {
    return CARDS.filter((card) => {
      if (!card.flagId) return true;
      // Use feature flag if available, otherwise default to true
      return featureFlags[card.flagId] ?? DEFAULT_FLAG_IDS[card.flagId] ?? true;
    });
  }, [featureFlags]);

  if (visibleCards.length === 0) {
    return null;
  }

  return (
    <section
      className="section relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, var(--bone) 0%, #FAF8F3 100%)' }}
      id="quick-access"
    >
      {/* Divider line at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-sage/40" />

      {/* Subtle gradient overlay */}
      <div
        className="absolute top-px left-0 right-0 h-0.5 opacity-60"
        style={{ background: 'linear-gradient(90deg, transparent, var(--sage) 30%, transparent)' }}
      />

      <div className="container">
        <div
          ref={headerRef}
          className={`text-center max-w-[700px] mx-auto mb-10 md:mb-16 fade-up ${headerVisible ? 'visible' : ''}`}
        >
          <span className="text-eyebrow block mb-4">Essential Services</span>
          <h2>Everything You Need,<br />One Click Away</h2>
          <p className="mt-4 opacity-70">Access all resident services and community features instantly</p>
        </div>

        <div className="p-4 sm:p-8 bg-sage-light border border-black mb-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {visibleCards.map((card, index) => (
              <BrutallyMinimalCard 
                key={card.title}
                title={card.title}
                description={card.description}
                href={card.href}
                variant={card.type === 'large' ? 'large' : 'standard'}
                icon={card.icon}
                image={card.backgroundImage}
                index={index}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

