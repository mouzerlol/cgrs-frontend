import { useDroppable } from '@dnd-kit/core';
import { TaskStatus } from '@/types/work-management';
import { cn } from '@/lib/utils';

interface DroppableColumnProps {
  status: TaskStatus;
  children: React.ReactNode;
}

export default function DroppableColumn({ status, children }: DroppableColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: status,
    data: {
      type: 'Column',
      status,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col flex-1 min-h-0 overflow-hidden transition-colors rounded-lg",
        isOver && "ring-2 ring-terracotta/30 bg-sage-light/80"
      )}
    >
      {children}
    </div>
  );
}
