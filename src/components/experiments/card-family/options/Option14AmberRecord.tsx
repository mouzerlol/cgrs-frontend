'use client';

import type { CardFamilyProps } from '../kit';
import EdgeFrame, { type EdgeTheme } from './EdgeFrame';

/**
 * 14 — Amber Record.
 *
 * The widest type range in the set: the title goes up to 24px with negative
 * tracking while the excerpt drops to 12px, so the ratio between the two opens
 * to 2:1 and the excerpt reads as a caption under a headline rather than as a
 * second paragraph.
 *
 * Colour is spent on the two glyphs only. Amber is the community side's
 * timestamp colour, and the clock and the calendar are exactly that, so the
 * warmth lands on the metadata without any of it depending on colour to be
 * read. The values themselves stay forest: amber-dark measures about 3:1 on
 * bone and cannot carry 11px text on its own.
 */
const THEME: EdgeTheme = {
  chip: 'bg-bone text-forest/80',
  chipIcon: 'text-amber-dark',
  category: 'text-[0.625rem] font-semibold uppercase tracking-[0.22em] text-forest/70',
  title: {
    home: 'text-[1.5rem] leading-[1.15] tracking-[-0.01em]',
    readnext: 'text-[1.25rem] leading-snug tracking-[-0.01em]',
    listing: 'text-[1.375rem] leading-[1.2] tracking-[-0.01em]',
  },
  excerpt: 'text-xs leading-relaxed text-forest/85',
  footer: 'border-t border-bone-edge bg-bone-light',
  author: 'font-mono text-[0.625rem] uppercase tracking-[0.08em] text-forest/70',
  date: 'text-[0.6875rem] font-medium text-forest/70',
  dateIcon: 'text-amber-dark',
};

export default function Option14AmberRecord(props: CardFamilyProps) {
  return <EdgeFrame {...props} theme={THEME} />;
}
