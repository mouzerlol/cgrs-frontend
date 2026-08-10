'use client';

import type { CardFamilyProps } from '../kit';
import EdgeFrame, { type EdgeTheme } from './EdgeFrame';

/**
 * 11 — Quiet Bone.
 *
 * The baseline of the set, and the most restrained reading of it. No colour
 * beyond the neutrals: the footer is bone one step off white, the chip is paper
 * with a forest glyph, and the whole hierarchy is carried by scale and tone.
 *
 * Category runs at 10px with the widest tracking in the set, so it reads as a
 * filing label rather than as a line of text. Title to category is 2.2:1,
 * which is the widest gap available before the title starts to crowd a
 * three-across home row.
 */
const THEME: EdgeTheme = {
  chip: 'bg-bone text-forest/75',
  chipIcon: 'text-forest/70',
  category: 'text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-forest/70',
  title: {
    home: 'text-[1.375rem] leading-[1.2]',
    readnext: 'text-[1.125rem] leading-snug',
    listing: 'text-[1.25rem] leading-[1.25]',
  },
  excerpt: 'text-[0.8125rem] leading-relaxed text-forest/85',
  footer: 'border-t border-bone-edge bg-bone-light',
  author: 'font-mono text-[0.625rem] uppercase tracking-[0.08em] text-forest/70',
  date: 'text-[0.6875rem] text-forest/70',
  dateIcon: 'text-forest/70',
};

export default function Option11QuietBone(props: CardFamilyProps) {
  return <EdgeFrame {...props} theme={THEME} />;
}
