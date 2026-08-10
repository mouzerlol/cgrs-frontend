'use client';

import type { CardFamilyProps } from '../kit';
import EdgeFrame, { type EdgeTheme } from './EdgeFrame';

/**
 * 12 — Sage Base.
 *
 * The same frame with weight added rather than colour. The title steps up to
 * Fraunces 500 and the excerpt to `forest/65`, so the card reads heavier and
 * closer to a printed page than 11's whisper.
 *
 * Footer moves to sage-light over a sage hairline, which puts the band in the
 * palette's connective tissue instead of in its paper. It is the only variant
 * whose chip is solid forest, so the reading time reads as a stamped mark on
 * the picture rather than as a label resting on it.
 */
const THEME: EdgeTheme = {
  chip: 'bg-forest text-bone/85',
  chipIcon: 'text-bone/60',
  category: 'text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-forest/70',
  title: {
    home: 'text-[1.4375rem] font-medium leading-[1.18]',
    readnext: 'text-[1.1875rem] font-medium leading-snug',
    listing: 'text-[1.3125rem] font-medium leading-[1.22]',
  },
  excerpt: 'text-[0.8125rem] leading-relaxed text-forest/85',
  footer: 'border-t border-sage/30 bg-sage-light',
  author: 'font-mono text-[0.625rem] uppercase tracking-[0.08em] text-forest/80',
  date: 'text-[0.6875rem] font-medium text-forest/80',
  dateIcon: 'text-forest/80',
};

export default function Option12SageBase(props: CardFamilyProps) {
  return <EdgeFrame {...props} theme={THEME} />;
}
