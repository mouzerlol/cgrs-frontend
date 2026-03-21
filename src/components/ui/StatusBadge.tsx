import { cn } from '@/lib/utils';

type Status = 'open' | 'in_progress' | 'closed' | 'withdrawn';

interface StatusBadgeProps {
  status: Status;
  label?: string;
  className?: string;
}

const STATUS_STYLES: Record<Status, string> = {
  open: 'bg-amber/15 text-amber-700',
  in_progress: 'bg-sage-light text-forest',
  closed: 'bg-forest-light/15 text-forest-light',
  withdrawn: 'bg-gray-100 text-gray-500',
};

const STATUS_LABELS: Record<Status, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  closed: 'Closed',
  withdrawn: 'Withdrawn',
};

export default function StatusBadge({ status, label, className }: StatusBadgeProps) {
  return (
    <span
      role="status"
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide',
        STATUS_STYLES[status],
        className
      )}
    >
      {label || STATUS_LABELS[status]}
    </span>
  );
}
