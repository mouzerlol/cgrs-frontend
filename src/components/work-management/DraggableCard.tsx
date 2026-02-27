import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/types/work-management';
import { cn } from '@/lib/utils';
import TaskCard from './TaskCard';
import { useEffect, useRef } from 'react';

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
  const lastDraggingStateRef = useRef<boolean>(false);

  useEffect(() => {
    if (lastDraggingStateRef.current === isDragging) {
      return;
    }
    lastDraggingStateRef.current = isDragging;
    // #region agent log
    fetch('http://127.0.0.1:7719/ingest/e80822c0-0494-4ae7-81f4-f09c3792dba1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d22ed8'},body:JSON.stringify({sessionId:'d22ed8',runId:'preview-v3',hypothesisId:'H14',location:'DraggableCard.tsx:useEffect',message:'dragging-state-changed',data:{taskId:task.id,isDragging},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
  }, [isDragging, task.id]);

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
