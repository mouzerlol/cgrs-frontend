'use client';

import type { CardFamilyProps } from '../kit';
import EdgeFrame, { type EdgeTheme } from './EdgeFrame';

/**
 * 13 — Red Eyebrow.
 *
 * One accent, spent on the smallest thing on the card. The category is the only
 * coloured mark; the footer gives up its fill entirely and becomes a hairline,
 * so nothing else in the card is competing for attention with it.
 *
 * **`terracotta-dark`, not `terracotta`.** The brand red measures about 3.5:1
 * on white, which does not reach AA at 11px. Its hover companion clears 4.5:1
 * and is close enough in hue that the two read as the same colour. This is the
 * fix DESIGN.md's Repeated-Eyebrow Exception is working around when it drops
 * per-item eyebrows to `forest/70` instead.
 *
 * The trade to look at: an eyebrow this loud on every cell of a three-across
 * home row is three accents on one screen, which is the case the One Voice Rule
 * exists to stop. It survives here only because nothing else on the card is
 * coloured at all.
 */
const THEME: EdgeTheme = {
  chip: 'bg-forest text-bone/85',
  chipIcon: 'text-bone/60',
  category: 'text-[0.6875rem] font-bold uppercase tracking-[0.18em] text-terracotta-dark',
  title: {
    home: 'text-[1.375rem] leading-[1.2]',
    readnext: 'text-[1.125rem] leading-snug',
    listing: 'text-[1.25rem] leading-[1.25]',
  },
  excerpt: 'text-[0.8125rem] leading-relaxed text-forest/85',
  footer: 'border-t border-bone-edge bg-white',
  author: 'font-mono text-[0.625rem] uppercase tracking-[0.08em] text-forest/70',
  date: 'text-[0.6875rem] text-forest/70',
  dateIcon: 'text-forest/30',
};

export default function Option13RedEyebrow(props: CardFamilyProps) {
  return <EdgeFrame {...props} theme={THEME} />;
}
