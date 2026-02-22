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
    data: {
      type: 'Task',
      task,
      status: task.status,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
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
