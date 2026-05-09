/**
 * Shared visual tokens for surfaces that sit in the site header chrome (dropdowns, popovers).
 * Solid forest fill (opaque), bone text, subtle white border — pairs with the glass header bar.
 */
export const siteHeaderDropdownSurface = [
  'bg-forest',
  'border border-white/10 text-bone',
  'shadow-[0_20px_60px_rgba(26,34,24,0.18)]',
].join(' ');

/** Link/action row styling aligned with Navigation "More" overflow items. */
export const siteHeaderDropdownItemInteractive =
  'transition-colors hover:bg-white/10 focus-visible:bg-white/10';
