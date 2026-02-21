import { TaskPriority } from '@/types/work-management';
import { PRIORITY_CONFIG } from '@/lib/work-management';
import { cn } from '@/lib/utils';

interface PriorityIndicatorProps {
  priority: TaskPriority;
  className?: string;
  showLabel?: boolean;
}

export default function PriorityIndicator({ priority, className, showLabel = true }: PriorityIndicatorProps) {
  const config = PRIORITY_CONFIG[priority];
  
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span 
        className="w-2 h-2 rounded-full" 
        style={{ backgroundColor: config.color }}
        aria-hidden="true"
      />
      {showLabel && <span className="text-sm font-medium text-forest/80">{config.label}</span>}
    </div>
  );
}
