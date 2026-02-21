'use client';

import { useState } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  pointerWithin, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragStartEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Task, TaskStatus } from '@/types/work-management';
import DragOverlayCard from './DragOverlayCard';

interface BoardDndContextProps {
  children: React.ReactNode;
  tasks: Task[];
  onTaskMove: (taskId: string, newStatus: TaskStatus) => void;
}

export default function BoardDndContext({ children, tasks, onTaskMove }: BoardDndContextProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (over && active.id !== over.id) {
      const activeTaskId = active.id as string;
      const newStatus = over.id as TaskStatus;
      
      const draggedTask = tasks.find(t => t.id === activeTaskId);
      if (draggedTask && draggedTask.status !== newStatus) {
        onTaskMove(activeTaskId, newStatus);
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {children}
      <DragOverlay
        dropAnimation={{
          sideEffects: defaultDropAnimationSideEffects({
            styles: {
              active: {
                opacity: '0.5',
              },
            },
          }),
        }}
      >
        {activeTask ? <DragOverlayCard task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
