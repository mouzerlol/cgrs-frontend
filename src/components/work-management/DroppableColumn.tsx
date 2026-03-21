import { useDroppable } from '@dnd-kit/core';
import { TaskStatus } from '@/types/work-management';
import { cn } from '@/lib/utils';

interface DroppableColumnProps {
  status: TaskStatus;
  children: React.ReactNode;
}

export default function DroppableColumn({ status, children }: DroppableColumnProps) {
  const { isOver, over, setNodeRef } = useDroppable({
    id: status,
    data: {
      type: 'Column',
      status,
    },
  });

  const isActive = over?.data.current?.type === 'Task';

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col flex-1 min-h-0 overflow-hidden transition-all duration-200 rounded-lg",
        isOver && !isActive && "ring-2 ring-terracotta/30 bg-terracotta/5 animate-pulse-subtle"
      )}
    >
      {children}
    </div>
  );
}
