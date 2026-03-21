'use client';

import Link from 'next/link';
import { Icon } from '@iconify/react';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatRelativeDate } from '@/lib/utils';

interface CompactIssueRowProps {
  id: string;
  title: string;
  category: string;
  status: 'open' | 'in_progress' | 'closed' | 'withdrawn';
  submittedAt: string;
  categoryIcon?: string;
}

const CATEGORY_ICONS: Record<string, string> = {
  maintenance: 'lucide:wrench',
  waste: 'lucide:trash-2',
  parking: 'lucide:car',
  general: 'lucide:circle-help',
  noise: 'lucide:volume-2',
  safety: 'lucide:shield',
  landscaping: 'lucide:trees',
};

export default function CompactIssueRow({
  id,
  title,
  category,
  status,
  submittedAt,
  categoryIcon,
}: CompactIssueRowProps) {
  const icon = categoryIcon || CATEGORY_ICONS[category] || 'lucide:circle-dot';

  return (
    <Link
      href={`/profile/reported-issues/${id}`}
      className="flex items-center gap-4 rounded-xl px-4 py-3 transition-colors hover:bg-sage-light/30"
    >
      <Icon icon={icon} className="h-5 w-5 shrink-0 text-terracotta" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-forest">{title}</p>
        <p className="text-xs text-forest/50 sm:hidden">{formatRelativeDate(submittedAt)}</p>
      </div>
      <StatusBadge status={status} className="shrink-0" />
      <span className="hidden shrink-0 text-xs text-forest/50 sm:block">
        {formatRelativeDate(submittedAt)}
      </span>
    </Link>
  );
}
