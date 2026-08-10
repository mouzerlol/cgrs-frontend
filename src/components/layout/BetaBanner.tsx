'use client';

import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { FEATURE_FLAG_IDS } from '@/lib/feature-flags';

/**
 * Site-wide beta-testing announcement.
 *
 * Renders directly under the header inside the {@link SiteChrome} wrapper (community
 * {@link Layout}, immersive `(immersive)/layout`). It flows beneath the header in the
 * fixed wrapper — no own positioning — and is hidden in print.
 *
 * Content padding (`pt-[calc(72px + var(--site-banner-height))]`) clears it via the
 * `:root:has([data-site-banner])` rule in `globals.css`, which reads the banner's
 * presence rather than being told about it. Publishing the height from an effect
 * here instead meant the variable was 0 through first paint, and every page's hero
 * dropped 36px once hydration ran. Keep BANNER_HEIGHT_PX and that rule in step.
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

  if (!enabled) return null;

  return (
    <div
      data-site-banner
      role="status"
      aria-live="off"
      className="group relative z-0 w-full overflow-hidden bg-forest border-y border-amber/40 print:hidden select-none"
      style={{ height: `${BANNER_HEIGHT_PX}px` }}
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
