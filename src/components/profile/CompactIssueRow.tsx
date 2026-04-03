'use client';

import Link from 'next/link';
import {
  Wrench,
  Trash2,
  Car,
  CircleHelp,
  Volume2,
  Shield,
  Trees,
  CircleDot,
} from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatRelativeDate } from '@/lib/utils';

interface CompactIssueRowProps {
  id: string;
  title: string;
  category: string;
  status: 'open' | 'in_progress' | 'closed' | 'withdrawn';
  submittedAt: string;
}

const CATEGORY_ICONS = {
  maintenance: Wrench,
  waste: Trash2,
  parking: Car,
  general: CircleHelp,
  noise: Volume2,
  safety: Shield,
  landscaping: Trees,
};

export default function CompactIssueRow({
  id,
  title,
  category,
  status,
  submittedAt,
}: CompactIssueRowProps) {
  const IconComponent = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] || CircleDot;

  return (
    <Link
      href={`/profile/reported-issues/${id}`}
      className="flex items-center gap-4 rounded-xl px-4 py-3 transition-colors hover:bg-sage-light/30"
    >
      <IconComponent className="h-5 w-5 shrink-0 text-terracotta" aria-hidden="true" />
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
