'use client';

import { Building2, AlertCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Heading Experiments
 * --------------------
 * Ten candidate designs for ONE parameterised account-section heading. The
 * winner becomes a shared <AccountSectionHeading /> rolled across every
 * /account/* subpage, replacing the hand-rolled icon-box + h2 + p pattern.
 *
 * Brief (confirmed): universal treatment (same on rounded community tabs and
 * square management tabs), purely typographic content model (eyebrow + title +
 * one-line subtitle), icon kept but reinvented per concept. ~7 wild, 3 safe.
 *
 * Every variant takes the same props so they are genuinely interchangeable.
 */

interface HeadingProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  /** decorative chapter mark, used only by the Chapter Index concept */
  index?: string;
}

/* Two representative datasets so each concept is judged on real copy. */
const SAMPLES: HeadingProps[] = [
  {
    eyebrow: 'Membership',
    title: 'My Property',
    subtitle: 'Your stake in the neighbourhood, on the record.',
    icon: Building2,
    index: '04',
  },
  {
    eyebrow: 'Requests',
    title: 'Reported Issues',
    subtitle: 'Everything you have raised, and where each one stands.',
    icon: AlertCircle,
    index: '03',
  },
];

/* ------------------------------------------------------------------ */
/* WILD CONCEPTS                                                        */
/* ------------------------------------------------------------------ */

// 1. Oversized Masthead — giant title, micro eyebrow, icon as faint watermark.
function OversizedMasthead({ eyebrow, title, subtitle, icon: Icon }: HeadingProps) {
  return (
    <div className="relative overflow-hidden">
      <Icon
        aria-hidden
        className="pointer-events-none absolute -right-2 -top-6 h-32 w-32 text-forest/[0.06] sm:h-40 sm:w-40"
        strokeWidth={1.25}
      />
      <div className="relative">
        <span className="block text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-terracotta">
          {eyebrow}
        </span>
        <h2 className="mt-1 font-display text-4xl leading-[1.02] tracking-[-0.02em] text-forest sm:text-5xl">
          {title}
        </h2>
        <p className="mt-2 max-w-md text-sm text-forest/55">{subtitle}</p>
      </div>
    </div>
  );
}

// 2. Ledger Rule — eyebrow + title on a hairline that runs the column, icon as a seal on the rule.
function LedgerRule({ eyebrow, title, subtitle, icon: Icon }: HeadingProps) {
  return (
    <div>
      <span className="block font-mono text-[0.7rem] uppercase tracking-[0.18em] text-forest/45">
        {eyebrow}
      </span>
      <div className="mt-2 flex items-end gap-4">
        <h2 className="font-display text-3xl leading-none tracking-[-0.01em] text-forest sm:text-[2.5rem]">
          {title}
        </h2>
        <span className="mb-2 h-px flex-1 bg-sage/40" />
        <span className="mb-1 flex h-9 w-9 shrink-0 items-center justify-center text-forest/70">
          <Icon className="h-5 w-5" strokeWidth={1.5} />
        </span>
      </div>
      <p className="mt-3 text-sm text-forest/55">{subtitle}</p>
    </div>
  );
}

// 3. Chapter Index — almanac chapter mark beside the title.
function ChapterIndex({ eyebrow, title, subtitle, icon: Icon, index }: HeadingProps) {
  return (
    <div className="flex items-stretch gap-5">
      <div className="flex flex-col items-center">
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-forest/40">№</span>
        <span className="font-display text-4xl leading-none text-terracotta sm:text-5xl">{index}</span>
        <span className="mt-2 w-px flex-1 bg-sage/40" />
      </div>
      <div className="pt-0.5">
        <span className="flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-forest/45">
          <Icon className="h-3.5 w-3.5" strokeWidth={2} />
          {eyebrow}
        </span>
        <h2 className="mt-1 font-display text-3xl leading-tight tracking-[-0.01em] text-forest sm:text-4xl">
          {title}
        </h2>
        <p className="mt-1.5 text-sm text-forest/55">{subtitle}</p>
      </div>
    </div>
  );
}

// 4. Drop-Cap Initial — illuminated first letter, almanac manuscript energy.
function DropCapInitial({ eyebrow, title, subtitle, icon: Icon }: HeadingProps) {
  const initial = title.charAt(0);
  const rest = title.slice(1);
  return (
    <div>
      <span className="flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-forest/45">
        <Icon className="h-3.5 w-3.5" strokeWidth={2} />
        {eyebrow}
      </span>
      <h2 className="mt-1 flex items-baseline font-display text-forest">
        <span className="self-start font-display text-6xl leading-[0.72] text-terracotta sm:text-7xl">{initial}</span>
        <span className="text-3xl leading-tight tracking-[-0.01em] sm:text-4xl">{rest}</span>
      </h2>
      <p className="mt-2 text-sm text-forest/55">{subtitle}</p>
    </div>
  );
}

// 5. Hand-Set Stamp — icon reinvented as a circular terracotta-ring stamp.
function HandSetStamp({ eyebrow, title, subtitle, icon: Icon }: HeadingProps) {
  return (
    <div className="flex items-center gap-4 sm:gap-5">
      <span className="flex h-16 w-16 shrink-0 -rotate-6 items-center justify-center rounded-full border-2 border-terracotta/70 text-terracotta">
        <Icon className="h-7 w-7" strokeWidth={1.5} />
      </span>
      <div>
        <span className="block text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-forest/45">
          {eyebrow}
        </span>
        <h2 className="mt-0.5 font-display text-3xl leading-tight tracking-[-0.01em] text-forest sm:text-4xl">
          {title}
        </h2>
        <p className="mt-1 text-sm text-forest/55">{subtitle}</p>
      </div>
    </div>
  );
}

// 6. Split Column — icon + eyebrow in a narrow left column, hairline divider, title right.
function SplitColumn({ eyebrow, title, subtitle, icon: Icon }: HeadingProps) {
  return (
    <div className="flex items-stretch gap-5">
      <div className="flex w-24 shrink-0 flex-col gap-3 border-r border-sage/40 pr-5">
        <Icon className="h-6 w-6 text-forest/70" strokeWidth={1.5} />
        <span className="text-[0.65rem] font-semibold uppercase leading-tight tracking-[0.18em] text-terracotta">
          {eyebrow}
        </span>
      </div>
      <div className="pt-0.5">
        <h2 className="font-display text-3xl leading-tight tracking-[-0.01em] text-forest sm:text-4xl">
          {title}
        </h2>
        <p className="mt-2 text-sm text-forest/55">{subtitle}</p>
      </div>
    </div>
  );
}

// 7. Stacked Editorial — eyebrow, oversized title, subtitle, full-width rule beneath.
function StackedEditorial({ eyebrow, title, subtitle, icon: Icon }: HeadingProps) {
  return (
    <div>
      <span className="flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-terracotta">
        <Icon className="h-3.5 w-3.5" strokeWidth={2} />
        {eyebrow}
      </span>
      <h2 className="mt-2 font-display text-4xl leading-[1.04] tracking-[-0.02em] text-forest sm:text-[2.75rem]">
        {title}
      </h2>
      <p className="mt-2 text-sm text-forest/55">{subtitle}</p>
      <span className="mt-4 block h-px w-full bg-sage/35" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* SAFE CONCEPTS                                                        */
/* ------------------------------------------------------------------ */

// 8. Refined Current — today's icon-box + title, tightened: eyebrow added, hairline under, grain plate.
function RefinedCurrent({ eyebrow, title, subtitle, icon: Icon }: HeadingProps) {
  return (
    <div className="border-b border-sage/30 pb-4">
      <div className="flex items-center gap-3.5">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-forest/[0.07] text-forest">
          <Icon className="h-6 w-6" strokeWidth={1.5} />
        </span>
        <div>
          <span className="block text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-terracotta">
            {eyebrow}
          </span>
          <h2 className="font-display text-2xl leading-tight text-forest">{title}</h2>
        </div>
      </div>
      <p className="mt-2.5 text-sm text-forest/55">{subtitle}</p>
    </div>
  );
}

// 9. Clean Stack — eyebrow / large title / subtitle, minimal inline icon mark.
function CleanStack({ eyebrow, title, subtitle, icon: Icon }: HeadingProps) {
  return (
    <div>
      <span className="flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-terracotta">
        <Icon className="h-3.5 w-3.5" strokeWidth={2} />
        {eyebrow}
      </span>
      <h2 className="mt-1.5 font-display text-3xl leading-tight tracking-[-0.01em] text-forest">
        {title}
      </h2>
      <p className="mt-1.5 max-w-md text-sm text-forest/55">{subtitle}</p>
    </div>
  );
}

// 10. Bordered Plate — heading inside a flat bone-light plate, hairline border.
function BorderedPlate({ eyebrow, title, subtitle, icon: Icon }: HeadingProps) {
  return (
    <div className="flex items-start gap-4 border border-sage/30 bg-bone-light p-5">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-sage/40 text-forest/70">
        <Icon className="h-5 w-5" strokeWidth={1.5} />
      </span>
      <div>
        <span className="block text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-forest/45">
          {eyebrow}
        </span>
        <h2 className="mt-0.5 font-display text-2xl leading-tight text-forest">{title}</h2>
        <p className="mt-1 text-sm text-forest/55">{subtitle}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* MASHUP                                                              */
/* ------------------------------------------------------------------ */

// 11. Column Plate — Split Column's layout inside Bordered Plate's framed plate.
function ColumnPlate({ eyebrow, title, subtitle, icon: Icon }: HeadingProps) {
  return (
    <div className="flex items-stretch gap-5 border border-sage/30 bg-bone-light p-5 sm:p-6">
      <div className="flex w-20 shrink-0 flex-col items-center gap-3 border-r border-sage/40 pr-5 sm:w-24">
        <span className="flex h-12 w-12 items-center justify-center rounded-md bg-forest/[0.07] text-forest">
          <Icon className="h-6 w-6" strokeWidth={1.5} />
        </span>
        <span className="text-center text-[0.62rem] font-semibold uppercase leading-tight tracking-[0.16em] text-terracotta">
          {eyebrow}
        </span>
      </div>
      <div className="pt-0.5">
        <h2 className="font-display text-2xl leading-tight tracking-[-0.01em] text-forest sm:text-3xl">
          {title}
        </h2>
        <p className="mt-1.5 text-sm text-forest/55">{subtitle}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

type Variant = {
  id: string;
  name: string;
  tag: 'wild' | 'safe' | 'mashup';
  note: string;
  Component: (p: HeadingProps) => React.ReactElement;
};

const VARIANTS: Variant[] = [
  { id: 'oversized-masthead', name: 'Oversized Masthead', tag: 'wild', note: 'Giant Fraunces title, micro terracotta eyebrow, icon as a faint watermark bleeding off the corner.', Component: OversizedMasthead },
  { id: 'ledger-rule', name: 'Ledger Rule', tag: 'wild', note: 'Title sits on a hairline that runs the column; icon rides the rule like a seal. Mono eyebrow.', Component: LedgerRule },
  { id: 'chapter-index', name: 'Chapter Index', tag: 'wild', note: 'Almanac chapter mark (№ in terracotta) beside the title, joined by a vertical rule.', Component: ChapterIndex },
  { id: 'drop-cap-initial', name: 'Drop-Cap Initial', tag: 'wild', note: 'Illuminated first letter, manuscript energy. Icon woven into the eyebrow.', Component: DropCapInitial },
  { id: 'hand-set-stamp', name: 'Hand-Set Stamp', tag: 'wild', note: 'Icon reinvented as a circular terracotta-ring stamp, tilted, anchoring the line.', Component: HandSetStamp },
  { id: 'split-column', name: 'Split Column', tag: 'wild', note: 'Icon + eyebrow in a narrow left column, 1px sage divider, title and subtitle to the right.', Component: SplitColumn },
  { id: 'stacked-editorial', name: 'Stacked Editorial', tag: 'wild', note: 'Eyebrow, oversized title, subtitle, then a full-width rule closing the block.', Component: StackedEditorial },
  { id: 'refined-current', name: 'Refined Current', tag: 'safe', note: 'Today’s icon-box pattern, tightened: terracotta eyebrow added, hairline under, grain plate.', Component: RefinedCurrent },
  { id: 'clean-stack', name: 'Clean Stack', tag: 'safe', note: 'Eyebrow / large title / subtitle with a minimal inline icon mark. Nothing extra.', Component: CleanStack },
  { id: 'bordered-plate', name: 'Bordered Plate', tag: 'safe', note: 'Heading in a flat bone-light plate with a hairline border. The most conservative option.', Component: BorderedPlate },
  { id: 'column-plate', name: 'Column Plate', tag: 'mashup', note: 'Split Column’s layout (icon + eyebrow, divider, title) inside Bordered Plate’s framed bone-light plate.', Component: ColumnPlate },
];

function VariantShowcase({ variant, n }: { variant: Variant; n: number }) {
  const { Component } = variant;
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-mono text-xs text-forest/45">{String(n).padStart(2, '0')}</span>
        <h3 className="font-display text-xl text-forest">{variant.name}</h3>
        <span
          className={cn(
            'rounded px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-[0.12em]',
            variant.tag === 'wild' && 'bg-terracotta/15 text-terracotta-dark',
            variant.tag === 'safe' && 'bg-sage-light text-forest/60',
            variant.tag === 'mashup' && 'bg-amber/20 text-amber-dark',
          )}
        >
          {variant.tag}
        </span>
        <p className="w-full text-sm text-forest/50 sm:w-auto sm:flex-1">{variant.note}</p>
      </div>

      {/* Rendered on sage-light to mirror the real /account content panel. */}
      <div className="grid gap-4 lg:grid-cols-2">
        {SAMPLES.map((sample) => (
          <div key={sample.title} className="bg-sage-light p-6 sm:p-8">
            <Component {...sample} />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function HeadingExperiments() {
  const wild = VARIANTS.filter((v) => v.tag === 'wild');
  const safe = VARIANTS.filter((v) => v.tag === 'safe');
  const mashup = VARIANTS.filter((v) => v.tag === 'mashup');

  return (
    <div className="space-y-12">
      <div className="bg-forest/[0.03] p-6">
        <span className="block text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-terracotta">
          Heading System
        </span>
        <h2 className="mt-1 font-display text-2xl text-forest">Account Section Headings</h2>
        <p className="mt-2 max-w-2xl text-sm text-forest/60">
          Ten candidate designs for one parameterised heading (eyebrow, title, subtitle, icon). Each is
          rendered with two real datasets, My Property and Reported Issues, on the sage-light panel the
          account pages actually use. Pick a champion; it becomes the shared component across all eight
          subpages.
        </p>
      </div>

      <div className="space-y-10">
        <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-forest/40">Wild &mdash; 7</h3>
        {wild.map((v, i) => (
          <VariantShowcase key={v.id} variant={v} n={i + 1} />
        ))}
      </div>

      <div className="space-y-10">
        <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-forest/40">Safe &mdash; 3</h3>
        {safe.map((v, i) => (
          <VariantShowcase key={v.id} variant={v} n={wild.length + i + 1} />
        ))}
      </div>

      <div className="space-y-10">
        <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-amber-dark">Mashup &mdash; Split Column &times; Bordered Plate</h3>
        {mashup.map((v, i) => (
          <VariantShowcase key={v.id} variant={v} n={wild.length + safe.length + i + 1} />
        ))}
      </div>
    </div>
  );
}
