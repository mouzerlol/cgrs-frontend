'use client';

import { useEffect } from 'react';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { FEATURE_FLAG_IDS } from '@/lib/feature-flags';

/**
 * Site-wide beta-testing announcement.
 *
 * Renders directly under the fixed site header on layouts that mount {@link Header}
 * (community {@link Layout}, immersive `(immersive)/layout`). The banner sits at
 * `top: 72px` to clear the fixed header and is hidden in print.
 *
 * Layouts without the shared header (e.g. `/petition`, `/no-access`, `/verify`) are
 * intentionally banner-free. To show the banner on a future custom-header layout,
 * mount this component explicitly there.
 */

const MESSAGE = 'WEBSITE CURRENTLY UNDER BETA TESTING';
const SEPARATOR = '✦';
const BANNER_HEIGHT_PX = 36;
const REPEATS_PER_TRACK = 8;

export default function BetaBanner() {
  const enabled = useFeatureFlag(FEATURE_FLAG_IDS.SITE_BETA_BANNER);

  useEffect(() => {
    if (!enabled) return;
    const root = document.documentElement;
    root.style.setProperty('--site-banner-height', `${BANNER_HEIGHT_PX}px`);
    return () => {
      root.style.removeProperty('--site-banner-height');
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      data-site-banner
      role="status"
      aria-live="off"
      className="group fixed left-0 right-0 z-[999] overflow-hidden bg-forest border-y border-amber/40 print:hidden select-none"
      style={{ top: '72px', height: `${BANNER_HEIGHT_PX}px` }}
    >
      <span className="sr-only">Website currently under beta testing.</span>
      <div
        aria-hidden="true"
        className="flex h-full w-max items-center whitespace-nowrap will-change-transform animate-marquee group-hover:[animation-play-state:paused]"
      >
        <MarqueeTrack />
        <MarqueeTrack />
      </div>
    </div>
  );
}

function MarqueeTrack() {
  return (
    <div className="flex h-full shrink-0 items-center font-body text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-amber">
      {Array.from({ length: REPEATS_PER_TRACK }).map((_, i) => (
        <span key={i} className="flex items-center">
          <span className="px-[2ch]">{MESSAGE}</span>
          <span aria-hidden="true" className="text-amber/60">
            {SEPARATOR}
          </span>
        </span>
      ))}
    </div>
  );
}
