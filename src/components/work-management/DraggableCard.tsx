import { useDraggable } from '@dnd-kit/core';
import { Task } from '@/types/work-management';
import { cn } from '@/lib/utils';
import TaskCard from './TaskCard';

interface DraggableCardProps {
  task: Task;
  onClick: (taskId: string) => void;
}

export default function DraggableCard({ task, onClick }: DraggableCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    data: {
      type: 'Task',
      task,
      status: task.status,
    },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        "touch-none",
        isDragging && "opacity-50"
      )}
    >
      <TaskCard task={task} onClick={onClick} />
    </div>
  );
}
