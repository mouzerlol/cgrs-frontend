'use client';

import { useEffect, useState } from 'react';
import Header from './Header';
import BetaBanner from './BetaBanner';
import { useHideOnScroll } from '@/hooks/useHideOnScroll';
import { getFixedSiteHeaderHeight } from '@/lib/site-layout';

interface SiteChromeBarProps {
  /** Pass false on immersive routes (window doesn't scroll) to skip the listener. */
  scrollHide?: boolean;
}

/**
 * Fixed top chrome wrapper owning the Header and BetaBanner as a single unit.
 *
 * On mobile the whole unit collapses upward on scroll-down and restores on scroll-up
 * (see {@link useHideOnScroll}); desktop is unchanged. Publishes `--chrome-offset` —
 * the measured chrome height when shown, `0` when hidden — so sticky sub-bars can dock
 * to the viewport top as the chrome retracts.
 */
export default function SiteChromeBar({ scrollHide = true }: SiteChromeBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { hidden } = useHideOnScroll({ scrollHide, isMenuOpen: menuOpen });

  useEffect(() => {
    const root = document.documentElement;
    const apply = () => {
      const h = getFixedSiteHeaderHeight();
      // Stable chrome height (always the real height) — for bars that ride WITH the chrome.
      root.style.setProperty('--chrome-height', `${h}px`);
      // Collapsing offset (0 when hidden) — for bars that DOCK to the viewport top.
      root.style.setProperty('--chrome-offset', hidden ? '0px' : `${h}px`);
    };
    apply();
    // Boolean signal so elements anchored to the chrome can hide/show in lockstep with it.
    if (hidden) root.setAttribute('data-chrome-hidden', '');
    else root.removeAttribute('data-chrome-hidden');
    window.addEventListener('resize', apply);
    return () => window.removeEventListener('resize', apply);
  }, [hidden]);

  return (
    <div
      data-site-chrome
      className={`fixed top-0 left-0 w-full z-[1000] will-change-transform transition-transform duration-300 ease-out-custom motion-reduce:transition-none ${
        hidden ? 'max-md:-translate-y-full' : ''
      }`}
    >
      <Header onMenuOpenChange={setMenuOpen} />
      <BetaBanner />
    </div>
  );
}
