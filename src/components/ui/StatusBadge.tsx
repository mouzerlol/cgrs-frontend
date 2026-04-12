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
      className={cn('tracking-wide flex items-center', className)}
    >
      {status === 'open' && (
        <span 
          className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-current animate-[poll-pulse_2s_infinite]" 
          aria-hidden="true" 
        />
      )}
      {label || STATUS_LABELS[status]}
    </Badge>
  );
}
