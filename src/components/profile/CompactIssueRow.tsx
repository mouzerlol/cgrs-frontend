'use client';

import Image from 'next/image';
import Link from 'next/link';
import { isNonOptimizableImageSrc } from '@/lib/image';
import {
  Wrench,
  Trash2,
  Car,
  CircleHelp,
  Volume2,
  Shield,
  Trees,
  CircleDot,
  ChevronRight,
  User,
  Timer,
  CheckCircle2,
  XCircle,
  ChevronsUp,
  ChevronUp,
  Minus,
  ChevronDown,
} from 'lucide-react';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn, formatRelativeDate } from '@/lib/utils';
import type { TaskPriority } from '@/types/work-management';

interface CompactIssueRowProps {
  id: string;
  title: string;
  category: string;
  status: 'open' | 'in_progress' | 'closed' | 'withdrawn';
  submittedAt: string;
  priority?: TaskPriority;
  assigneeName?: string;
  assigneeAvatarUrl?: string | null;
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

const CATEGORY_LABELS: Record<string, string> = {
  maintenance: 'Maintenance',
  waste: 'Waste',
  parking: 'Parking',
  general: 'General',
  noise: 'Noise Complaint',
  safety: 'Safety',
  landscaping: 'Landscaping',
};

const STATUS_BAR_COLORS = {
  open: 'bg-amber',
  in_progress: 'bg-sage',
  closed: 'bg-forest-light',
  withdrawn: 'bg-gray-300',
};

const STATUS_ICONS = {
  open: CircleDot,
  in_progress: Timer,
  closed: CheckCircle2,
  withdrawn: XCircle,
};

const STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  closed: 'Closed',
  withdrawn: 'Withdrawn',
};

const STATUS_ICON_COLORS = {
  open: 'text-amber-600',
  in_progress: 'text-sage',
  closed: 'text-forest-light',
  withdrawn: 'text-gray-400',
};

const PRIORITY_ICONS = {
  urgent: ChevronsUp,
  high: ChevronUp,
  medium: Minus,
  low: ChevronDown,
};

const PRIORITY_COLORS = {
  urgent: 'text-terracotta',
  high: 'text-amber-600',
  medium: 'text-sage',
  low: 'text-forest/50',
};

export default function CompactIssueRow({
  id,
  title,
  category,
  status,
  submittedAt,
  priority = 'medium',
  assigneeName,
  assigneeAvatarUrl,
}: CompactIssueRowProps) {
  const IconComponent = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] || CircleDot;
  const categoryLabel = CATEGORY_LABELS[category] || 'Other';
  const barColor = STATUS_BAR_COLORS[status] || 'bg-sage';
  
  const StatusIcon = STATUS_ICONS[status] || CircleDot;
  const PriorityIcon = PRIORITY_ICONS[priority] || Minus;

  return (
    <Link
      href={`/profile/reported-issues/${id}`}
      className={cn(
        'group/card relative flex items-center gap-3 px-3 py-1 sm:px-4 sm:py-1',
        'bg-white border border-sage/20',
        'transition-all duration-200 ease-out',
        'hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(26,34,24,0.08)] hover:border-sage/40'
      )}
    >
      {/* Accent Bar */}
      <div
        className={cn(
          'absolute left-0 top-2 bottom-2 w-[3px] rounded-full',
          barColor
        )}
        aria-hidden="true"
      />

      {/* Category Icon Tile */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-terracotta/8 sm:ml-1">
        <IconComponent className="h-4 w-4 text-terracotta" aria-hidden="true" />
      </div>

      {/* Title & Category Label */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-display font-semibold text-forest transition-colors group-hover/card:text-terracotta">
          {title}
        </p>
        <p className="text-xs text-forest/50 mt-0.5">
          {categoryLabel}
        </p>
      </div>

      {/* Status Tray */}
      <div className="hidden sm:flex shrink-0 items-center gap-2.5 rounded-lg bg-sage-light/30 px-2.5 py-1.5 border border-sage/10">
        <Tooltip content={`Status: ${STATUS_LABELS[status]}`}>
          <StatusIcon className={cn("w-4 h-4", STATUS_ICON_COLORS[status])} />
        </Tooltip>
        
        <div className="w-px h-3.5 bg-sage/30" />
        
        <Tooltip content="Time since reported">
          <span className="text-[11px] font-medium text-forest/60 whitespace-nowrap">
            {formatRelativeDate(submittedAt)}
          </span>
        </Tooltip>

        <div className="w-px h-3.5 bg-sage/30" />
        
        <Tooltip content={`Priority: ${priority.charAt(0).toUpperCase() + priority.slice(1)}`}>
          <PriorityIcon className={cn("w-4 h-4", PRIORITY_COLORS[priority])} />
        </Tooltip>

        <div className="w-px h-3.5 bg-sage/30" />
        
        <Tooltip content={assigneeName ? `Assigned to ${assigneeName}` : 'Unassigned'}>
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-bone border border-sage/20 overflow-hidden">
            {assigneeAvatarUrl ? (
              <Image
                src={assigneeAvatarUrl}
                alt={assigneeName || 'Assignee'}
                width={20}
                height={20}
                unoptimized={isNonOptimizableImageSrc(assigneeAvatarUrl)}
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-3 w-3 text-forest/40" />
            )}
          </div>
        </Tooltip>
      </div>
      
      {/* Mobile abbreviated status tray */}
      <div className="flex sm:hidden shrink-0 items-center gap-1.5 rounded-lg bg-sage-light/30 px-2 py-1">
        <StatusIcon className={cn("w-3.5 h-3.5", STATUS_ICON_COLORS[status])} />
        <span className="text-[10px] font-medium text-forest/60 whitespace-nowrap">
          {formatRelativeDate(submittedAt, true)}
        </span>
      </div>

      {/* Hover Chevron */}
      <ChevronRight 
        className="h-4 w-4 shrink-0 text-terracotta opacity-0 -ml-1 -mr-1 transition-all duration-200 group-hover/card:opacity-100 group-hover/card:translate-x-0.5" 
        aria-hidden="true" 
      />
    </Link>
  );
}