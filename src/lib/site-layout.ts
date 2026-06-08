/**
 * Layout helpers for the fixed site chrome (header, etc.).
 */

/** Fallback when `document` is unavailable or no header is mounted (matches ~pt-20 below nav). */
const FIXED_HEADER_HEIGHT_FALLBACK_PX = 80;

/**
 * Return the rendered height of the fixed top chrome (header + beta banner) in CSS pixels.
 *
 * Used so scroll-into-view and viewport-filled regions stay aligned with the real chrome
 * (padding + content height), instead of a stale hardcoded value.
 *
 * The beta banner ({@link BetaBanner}) is fixed directly beneath the header, so anything
 * pinned below the header must also clear the banner — mirrors the CSS `calc(72px +
 * var(--site-banner-height))` convention used by the immersive layout and page headers.
 *
 * Prefer `[data-site-header]` so we never measure a page-level `<header>` inside hero cards.
 */
export function getFixedSiteHeaderHeight(): number {
  if (typeof document === 'undefined') {
    return FIXED_HEADER_HEIGHT_FALLBACK_PX;
  }
  const header =
    document.querySelector<HTMLElement>('[data-site-header]') ?? document.querySelector('header');
  const headerHeight = header
    ? Math.ceil(header.getBoundingClientRect().height)
    : FIXED_HEADER_HEIGHT_FALLBACK_PX;

  const banner = document.querySelector<HTMLElement>('[data-site-banner]');
  const bannerHeight = banner ? Math.ceil(banner.getBoundingClientRect().height) : 0;

  return headerHeight + bannerHeight;
}
