'use client';

import type { CardFamilyProps } from '../kit';
import EdgeFrame, { type EdgeTheme } from './EdgeFrame';

/**
 * 15 — Deep Footer. **Stretch: inverts forest's role inside one component.**
 *
 * The footer band goes solid forest-light with bone type on it, so the card is
 * weighted at the bottom and the record line reads as a plate the card is
 * standing on rather than as a strip it happens to end with. It is the only
 * variant where the who / when is darker than the title.
 *
 * DESIGN.md's Forest Inversion Rule says forest is text on bone on the
 * community side and a surface under bone text on the management side, decided
 * once per surface and not mixed on one component. This mixes it on one
 * component deliberately: forest ink in the title, forest surface in the
 * footer. Worth seeing, because the pairing is what gives the card its weight,
 * and worth labelling, because adopting it means amending the rule.
 *
 * `bone/65` on forest-light, not `bone/55`: the lighter step measures 4.3:1 and
 * misses AA at footer size.
 */
const THEME: EdgeTheme = {
  chip: 'bg-bone text-forest/80',
  chipIcon: 'text-forest/70',
  category: 'text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-forest/70',
  title: {
    home: 'text-[1.375rem] font-medium leading-[1.2]',
    readnext: 'text-[1.125rem] font-medium leading-snug',
    listing: 'text-[1.25rem] font-medium leading-[1.25]',
  },
  excerpt: 'text-[0.8125rem] leading-relaxed text-forest/85',
  footer: 'bg-forest-light',
  author: 'font-mono text-[0.625rem] uppercase tracking-[0.08em] text-bone/65',
  date: 'text-[0.6875rem] font-medium text-bone/85',
  dateIcon: 'text-bone/60',
};

export default function Option15DeepFooter(props: CardFamilyProps) {
  return <EdgeFrame {...props} theme={THEME} />;
}
