import { cn } from '@/lib/utils';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';

type Status = 'open' | 'in_progress' | 'closed' | 'withdrawn';

interface StatusBadgeProps {
  status: Status;
  label?: string;
  className?: string;
  /**
   * Which identity is rendering the badge.
   * - `management` (default): "open" is amber + a pulsing dot (live work to action).
   * - `community`: "open" is calm forest, no pulse. The Amber Promotion Rule says
   *   amber-as-status on the community side reads as alarm, so a resident's own open
   *   issue must not flash amber at them.
   */
  surface?: 'management' | 'community';
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

export default function StatusBadge({
  status,
  label,
  className,
  surface = 'management',
}: StatusBadgeProps) {
  const calmOpen = surface === 'community' && status === 'open';
  const variant: BadgeVariant = calmOpen ? 'forest' : STATUS_VARIANT[status];

  return (
    <Badge
      variant={variant}
      shape="pill"
      size="sm"
      className={cn('tracking-wide flex items-center', className)}
    >
      {status === 'open' && (
        <span
          className={cn(
            'mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-current',
            !calmOpen && 'animate-[poll-pulse_2s_infinite]',
          )}
          aria-hidden="true"
        />
      )}
      {label || STATUS_LABELS[status]}
    </Badge>
  );
}
