import { TaskPriority } from '@/types/work-management';
import { PRIORITY_CONFIG } from '@/lib/work-management';
import { cn } from '@/lib/utils';

interface PrioritySelectorProps {
  value: TaskPriority;
  onChange: (priority: TaskPriority) => void;
}

export default function PrioritySelector({ value, onChange }: PrioritySelectorProps) {
  const priorities = Object.keys(PRIORITY_CONFIG) as TaskPriority[];

  return (
    <div className="flex flex-wrap gap-2">
      {priorities.map(p => {
        const config = PRIORITY_CONFIG[p];
        const isSelected = value === p;
        return (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors text-sm font-medium",
              isSelected 
                ? "border-transparent bg-sage-light"
                : "border-sage/30 bg-white hover:bg-sage-light/30"
            )}
            style={{
              borderColor: isSelected ? config.color : undefined,
              boxShadow: isSelected ? `0 0 0 1px ${config.color}` : undefined
            }}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: config.color }} />
            <span className={cn(isSelected ? "text-forest" : "text-forest/70")}>{config.label}</span>
          </button>
        );
      })}
    </div>
  );
}
