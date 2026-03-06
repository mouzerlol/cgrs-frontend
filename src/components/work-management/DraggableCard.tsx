import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/types/work-management';
import { cn } from '@/lib/utils';
import TaskCard from './TaskCard';

interface DraggableCardProps {
  task: Task;
  onClick: (taskId: string) => void;
}

export default function DraggableCard({ task, onClick }: DraggableCardProps) {
  const { 
    attributes, 
    listeners, 
    setNodeRef, 
    transform, 
    transition, 
    isDragging 
  } = useSortable({
    id: task.id,
    animateLayoutChanges: () => false,
    data: {
      type: 'Task',
      task,
      status: task.status,
    },
  });

  const style = {
    transition: isDragging ? undefined : transition,
    transform: CSS.Transform.toString(transform),
    ...(isDragging
      ? {
          height: 0,
          margin: 0,
          padding: 0,
          overflow: 'hidden' as const,
        }
      : {}),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-task-id={task.id}
      {...attributes}
      {...listeners}
      className={cn(
        "touch-none",
        isDragging && "opacity-0 pointer-events-none"
      )}
    >
      <TaskCard task={task} onClick={onClick} />
    </div>
  );
}
