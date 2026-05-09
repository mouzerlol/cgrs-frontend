/**
 * Layout helpers for the fixed site chrome (header, etc.).
 */

/** Fallback when `document` is unavailable or no header is mounted (matches ~pt-20 below nav). */
const FIXED_HEADER_HEIGHT_FALLBACK_PX = 80;

/**
 * Return the rendered height of the primary fixed site header in CSS pixels.
 *
 * Used so scroll-into-view and viewport-filled regions stay aligned with the real header
 * (padding + content height), instead of a stale hardcoded value.
 *
 * Prefer `[data-site-header]` so we never measure a page-level `<header>` inside hero cards.
 */
export function getFixedSiteHeaderHeight(): number {
  if (typeof document === 'undefined') {
    return FIXED_HEADER_HEIGHT_FALLBACK_PX;
  }
  const header =
    document.querySelector<HTMLElement>('[data-site-header]') ?? document.querySelector('header');
  if (!header) {
    return FIXED_HEADER_HEIGHT_FALLBACK_PX;
  }
  return Math.ceil(header.getBoundingClientRect().height);
}
