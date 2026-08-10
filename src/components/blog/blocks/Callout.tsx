import { AlertTriangle, CheckCircle2, Info, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CalloutBlock, CalloutVariant } from '@/lib/blog/types';

/**
 * An aside lifted out of the running copy — a deadline, a warning, an outcome.
 *
 * Three variants and no more. A callout is a signal, and a palette of signals
 * that runs past three stops being read as one.
 *
 * The variants differ by accent and glyph on a shared surface rather than by
 * fill, so a run of two callouts in one article does not turn the page into
 * stripes. The accent is a left rule, which is the same device the ruled list
 * uses for its markers.
 */

interface VariantStyle {
  icon: LucideIcon;
  rule: string;
  accent: string;
  /** Read by assistive technology in place of the glyph, which is decorative. */
  label: string;
}

const VARIANTS: Record<CalloutVariant, VariantStyle> = {
  note: { icon: Info, rule: 'border-l-sage', accent: 'text-forest-light', label: 'Note' },
  warning: {
    icon: AlertTriangle,
    rule: 'border-l-terracotta',
    accent: 'text-terracotta-dark',
    label: 'Warning',
  },
  success: {
    icon: CheckCircle2,
    rule: 'border-l-forest-light',
    accent: 'text-forest-light',
    label: 'Outcome',
  },
};

export default function Callout({
  block,
  children,
}: {
  block: CalloutBlock;
  /** The nested blocks, rendered by the caller so this stays free of the block map. */
  children: React.ReactNode;
}) {
  const variant = VARIANTS[block.variant] ?? VARIANTS.note;
  const Icon = variant.icon;

  return (
    <aside
      className={cn(
        'my-10 rounded-card border border-l-4 border-bone-edge bg-bone-light px-5 py-4 md:my-12 md:px-6 md:py-5',
        variant.rule
      )}
    >
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em]">
        <Icon className={cn('h-4 w-4 shrink-0', variant.accent)} aria-hidden="true" />
        <span className={variant.accent}>{block.title || variant.label}</span>
      </p>

      {/*
       * The nested copy is set tighter than the body's own rhythm: inside a
       * callout the first paragraph opens against the label rather than a full
       * body gap below it.
       */}
      <div className="mt-2 [&>*:first-child]:mt-0">{children}</div>
    </aside>
  );
}
