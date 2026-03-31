import { cn } from '@/lib/utils';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';

type Status = 'open' | 'in_progress' | 'closed' | 'withdrawn';

interface StatusBadgeProps {
  status: Status;
  label?: string;
  className?: string;
}

const STATUS_LABELS: Record<Status, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  closed: 'Closed',
  withdrawn: 'Withdrawn',
};

const STATUS_VARIANT: Record<Status, BadgeVariant> = {
  open: 'status-open',
  in_progress: 'status-in-progress',
  closed: 'status-closed',
  withdrawn: 'status-withdrawn',
};

export default function StatusBadge({ status, label, className }: StatusBadgeProps) {
  return (
    <Badge
      variant={STATUS_VARIANT[status]}
      shape="pill"
      size="sm"
      className={cn('tracking-wide', className)}
    >
      {label || STATUS_LABELS[status]}
    </Badge>
  );
}
