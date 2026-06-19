import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * AccountSectionHeading — the shared heading for every /account tab.
 *
 * Design: "Column Plate" (chosen from the /design-experiments heading round). A
 * framed bone-light plate. On desktop a left column holds the icon centred over
 * its eyebrow, a hairline divider, then the title and subtitle. On mobile it
 * stacks: icon + eyebrow as a row, then title, subtitle, and action below at
 * full width (no narrow squished columns). One heading system, used everywhere,
 * so the account surface stops hand-rolling a different heading per tab.
 *
 * One identical styling everywhere: terracotta eyebrow, rounded icon plate. No
 * per-tab variants. The account surface uses this single component on every tab
 * so the headings read as one family.
 */
interface AccountSectionHeadingProps {
  /** Uppercase label above the title. Keep it short; it sits in a narrow column. */
  eyebrow: string;
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  /** Right-aligned slot for a CTA or a metadata badge. */
  action?: ReactNode;
  className?: string;
}

export default function AccountSectionHeading({
  eyebrow,
  title,
  subtitle,
  icon: Icon,
  action,
  className,
}: AccountSectionHeadingProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 border border-sage/30 bg-bone-light p-5 sm:flex-row sm:items-stretch sm:gap-x-5 sm:p-6',
        className,
      )}
    >
      {/* Icon + eyebrow: an inline row on mobile, a bordered left column on desktop. */}
      <div className="flex shrink-0 items-center gap-3 sm:w-24 sm:flex-col sm:border-r sm:border-sage/40 sm:pr-5">
        <span
          className="flex h-12 w-12 items-center justify-center rounded-md bg-forest/[0.07] text-forest"
          aria-hidden="true"
        >
          <Icon className="h-6 w-6" strokeWidth={1.5} />
        </span>
        <span className="text-[0.62rem] font-semibold uppercase leading-tight tracking-[0.16em] text-terracotta sm:text-center">
          {eyebrow}
        </span>
      </div>

      <div className="min-w-0 flex-1 sm:pt-0.5">
        <h2 className="font-display text-2xl leading-tight tracking-[-0.01em] text-forest sm:text-3xl">
          {title}
        </h2>
        {subtitle ? <p className="mt-1.5 text-sm text-forest/55">{subtitle}</p> : null}
      </div>

      {action ? <div className="flex shrink-0 items-center sm:self-center">{action}</div> : null}
    </div>
  );
}
