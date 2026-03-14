'use client';

import { useState } from 'react';
import { 
  CollisionDetection,
  DndContext, 
  DragOverlay, 
  closestCorners, 
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
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const STATUS_ORDER: TaskStatus[] = ['backlog', 'todo', 'in_progress', 'review', 'done', 'closed'];

const reorderInLanes = (
  items: Task[],
  activeId: string,
  targetStatus: TaskStatus,
  overTaskId: string | null,
  placeAfterOverTask: boolean
): Task[] => {
  const byId = new Map(items.map((task) => [task.id, task]));
  const activeTask = byId.get(activeId);
  if (!activeTask) {
    return items;
  }

  const lanes = new Map<TaskStatus, string[]>(
    STATUS_ORDER.map((status) => [status, items.filter((task) => task.status === status).map((task) => task.id)])
  );

  const sourceStatus = activeTask.status;
  lanes.set(
    sourceStatus,
    (lanes.get(sourceStatus) || []).filter((id) => id !== activeId)
  );

  const targetLane = [...(lanes.get(targetStatus) || [])];
  let insertIndex = targetLane.length;
  if (overTaskId) {
    const overLaneIndex = targetLane.indexOf(overTaskId);
    if (overLaneIndex >= 0) {
      insertIndex = overLaneIndex + (placeAfterOverTask ? 1 : 0);
    }
  }

  targetLane.splice(Math.max(0, Math.min(insertIndex, targetLane.length)), 0, activeId);
  lanes.set(targetStatus, targetLane);

  const updatedActiveTask: Task = {
    ...activeTask,
    status: targetStatus,
    updatedAt: new Date().toISOString(),
  };
  byId.set(activeId, updatedActiveTask);

  const rebuilt: Task[] = [];
  for (const status of STATUS_ORDER) {
    for (const id of lanes.get(status) || []) {
      const task = byId.get(id);
      if (task) {
        rebuilt.push(task);
      }
    }
  }
  return rebuilt;
};

const collisionDetectionStrategy: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args);
  if (pointerCollisions.length > 0) {
    return pointerCollisions;
  }
  return closestCorners(args);
};

export default function BoardDndContext({ children, tasks, setTasks }: BoardDndContextProps) {
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
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === 'Task';
    const isOverTask = over.data.current?.type === 'Task';
    const isOverColumn = over.data.current?.type === 'Column';

    // Handle task dropped on another task
    if (isActiveTask && isOverTask) {
      setTasks((prev) => {
        const activeIndex = prev.findIndex((t) => t.id === activeId);
        const overIndex = prev.findIndex((t) => t.id === overId);
        
        if (activeIndex === -1 || overIndex === -1) return prev;
        const activeStatus = prev[activeIndex].status;
        const overStatus = prev[overIndex].status;
        const targetStatus = overStatus;
        const targetOrderBefore = prev.filter((t) => t.status === targetStatus).map((t) => t.id);
        const targetLaneBefore = prev.filter((t) => t.status === overStatus).map((t) => t.id);
        const overLaneIndex = targetLaneBefore.findIndex((id) => id === String(overId));
        const isOverLastInLane = overLaneIndex === targetLaneBefore.length - 1;
        const activeTop = active.rect.current.translated?.top ?? active.rect.current.initial?.top ?? 0;
        const overMidpoint = over.rect.top + (over.rect.height / 2);
        const isBelowOverMidpoint = activeTop > overMidpoint;
        const placeAfterOverTask = isOverLastInLane && isBelowOverMidpoint;
        
        const moved = reorderInLanes(prev, String(activeId), overStatus, String(overId), placeAfterOverTask);
        return moved;
      });
    }

    // Handle task dropped on empty column
    if (isActiveTask && isOverColumn) {
      setTasks((prev) => {
        const activeIndex = prev.findIndex((t) => t.id === activeId);
        const overStatus = overId as TaskStatus;
        
        if (activeIndex === -1) return prev;
        
        // Update status when dropped on different column
        if (prev[activeIndex].status !== overStatus) {
          const moved = reorderInLanes(prev, String(activeId), overStatus, null, false);
          return moved;
        }
        return prev;
      });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetectionStrategy}
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
