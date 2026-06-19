'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import { categoryIcon, categoryLabel } from '@/lib/reported-issue-display';
import { cn, formatRelativeDate } from '@/lib/utils';
import type { TaskPriority } from '@/types/work-management';

interface CompactIssueRowProps {
  id: string;
  title: string;
  category: string;
  status: 'open' | 'in_progress' | 'closed' | 'withdrawn';
  submittedAt: string;
  // Operational fields kept on the type for callers; the resident row no longer
  // surfaces priority/assignee (committee-facing data), only what a reporter needs:
  // what it is, when reported, and where it's at.
  priority?: TaskPriority;
  assigneeName?: string;
  assigneeAvatarUrl?: string | null;
}

/**
 * One reported issue, rendered as an almanac ledger line: category, what it is, when
 * it was reported, and a plainly-readable status badge that is visible at every
 * breakpoint (no hover-gated meaning, which dies on touch).
 */
export default function CompactIssueRow({
  id,
  title,
  category,
  status,
  submittedAt,
}: CompactIssueRowProps) {
  const IconComponent = categoryIcon(category);

  return (
    <Link
      href={`/account/reported-issues/${id}`}
      className={cn(
        'group/row flex items-center gap-3 px-3 py-1.5 sm:gap-4 sm:px-4',
        'border border-sage/20 bg-white',
        'transition-colors duration-200 ease-out',
        'hover:border-sage/40 hover:bg-sage-light/20',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-1',
      )}
    >
      {/* Category tile, quiet forest (terracotta is reserved for one action per screen) */}
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-forest/5 text-forest/70">
        <IconComponent className="h-4 w-4" aria-hidden="true" />
      </span>

      {/* What it is, plus the ledger metadata */}
      <span className="min-w-0 flex-1">
        <span className="block truncate font-display text-[15px] text-forest">{title}</span>
        <span className="mt-0.5 flex items-center gap-1.5 text-xs text-forest/55">
          <span>{categoryLabel(category)}</span>
          <span className="text-sage" aria-hidden="true">·</span>
          {/* Amber on a timestamp is decorative, which the brand permits on the community side */}
          <span className="text-amber-dark">{formatRelativeDate(submittedAt)}</span>
        </span>
      </span>

      <StatusBadge status={status} surface="community" className="shrink-0" />

      <ChevronRight
        className="h-4 w-4 shrink-0 text-forest/30 transition-transform duration-200 group-hover/row:translate-x-0.5 group-hover/row:text-forest/60"
        aria-hidden="true"
      />
    </Link>
  );
}
