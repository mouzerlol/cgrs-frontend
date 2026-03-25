'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
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
  DragCancelEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { reorderTasksInLanes, type TaskBoardMoveArgs } from '@/lib/work-management-dnd';
import type { Task, TaskStatus } from '@/types/work-management';
import DragOverlayCard from './DragOverlayCard';
import { consumeTaskOpenSuppressionIfMatch, markTaskOpenSuppressionAfterDrag } from '@/lib/task-open-suppression';

interface BoardDndContextValue {
  recentlyMovedTaskId: string | null;
  /** Ignore the next task open for this id (ghost click after drag). Returns true if suppressed. */
  consumeSuppressedTaskOpen: (taskId: string) => boolean;
}

const BoardDndContext = createContext<BoardDndContextValue>({
  recentlyMovedTaskId: null,
  consumeSuppressedTaskOpen: () => false,
});

export function useBoardDndContext() {
  return useContext(BoardDndContext);
}

interface BoardDndContextProps {
  children: React.ReactNode;
  tasks: Task[];
  onTaskMove: (args: TaskBoardMoveArgs) => void;
}

const collisionDetectionStrategy: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args);
  if (pointerCollisions.length > 0) {
    return pointerCollisions;
  }
  return closestCorners(args);
};

export default function BoardDndContextProvider({ children, tasks, onTaskMove }: BoardDndContextProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [recentlyMovedTaskId, setRecentlyMovedTaskId] = useState<string | null>(null);
  const moveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const suppressTaskOpenRef = useRef<string | null>(null);

  const consumeSuppressedTaskOpen = useCallback((taskId: string) => {
    return consumeTaskOpenSuppressionIfMatch(suppressTaskOpenRef, taskId);
  }, []);

  const triggerOptimisticPulse = useCallback((taskId: string) => {
    setRecentlyMovedTaskId(taskId);

    if (moveTimeoutRef.current) {
      clearTimeout(moveTimeoutRef.current);
    }

    moveTimeoutRef.current = setTimeout(() => {
      setRecentlyMovedTaskId(null);
    }, 500);
  }, []);

  useEffect(() => {
    return () => {
      if (moveTimeoutRef.current) {
        clearTimeout(moveTimeoutRef.current);
      }
    };
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
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
    /** After a real drag, pointerup can synthesize a click on the card — suppress opening detail once. */
    markTaskOpenSuppressionAfterDrag(suppressTaskOpenRef, String(active.id));

    if (!over) {
      setActiveTask(null);
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);

    if (activeId === overId) {
      setActiveTask(null);
      return;
    }

    const isActiveTask = active.data.current?.type === 'Task';
    const isOverTask = over.data.current?.type === 'Task';
    const isOverColumn = over.data.current?.type === 'Column';

    const finish = (args: TaskBoardMoveArgs) => {
      /** Defer cache/API work so @dnd-kit drop measurement is not racing React re-renders (avoids ghost snap-back). */
      requestAnimationFrame(() => {
        onTaskMove(args);
        triggerOptimisticPulse(args.taskId);
        setActiveTask(null);
      });
    };

    if (isActiveTask && isOverTask) {
      const activeIndex = tasks.findIndex((t) => t.id === activeId);
      const overIndex = tasks.findIndex((t) => t.id === overId);

      if (activeIndex === -1 || overIndex === -1) {
        setActiveTask(null);
        return;
      }

      const overStatus = tasks[overIndex].status;
      const activeTop = active.rect.current.translated?.top ?? active.rect.current.initial?.top ?? 0;
      const overMidpoint = over.rect.top + over.rect.height / 2;
      const placeAfterOverTask = activeTop > overMidpoint;

      const previousStatus = tasks[activeIndex].status;
      const nextTasks = reorderTasksInLanes(tasks, activeId, overStatus, overId, placeAfterOverTask);
      const moved = nextTasks.find((t) => t.id === activeId);
      if (!moved) {
        setActiveTask(null);
        return;
      }

      finish({
        taskId: activeId,
        previousStatus,
        nextStatus: moved.status,
        nextTasks,
      });
      return;
    }

    if (isActiveTask && isOverColumn) {
      const activeIndex = tasks.findIndex((t) => t.id === activeId);
      if (activeIndex === -1) {
        setActiveTask(null);
        return;
      }

      const overStatus = overId as TaskStatus;
      const previousStatus = tasks[activeIndex].status;

      /** Dropping on the column droppable (e.g. bottom placeholder) appends to lane end; same-lane used to early-return and skipped PATCH. */
      const nextTasks = reorderTasksInLanes(tasks, activeId, overStatus, null, false);
      const moved = nextTasks.find((t) => t.id === activeId);
      if (!moved) {
        setActiveTask(null);
        return;
      }

      if (previousStatus === overStatus) {
        const prevLaneIds = tasks.filter((t) => t.status === overStatus).map((t) => t.id);
        const nextLaneIds = nextTasks.filter((t) => t.status === overStatus).map((t) => t.id);
        const laneOrderUnchanged =
          prevLaneIds.length === nextLaneIds.length && prevLaneIds.every((id, i) => id === nextLaneIds[i]);
        if (laneOrderUnchanged) {
          setActiveTask(null);
          return;
        }
      }

      finish({
        taskId: activeId,
        previousStatus,
        nextStatus: moved.status,
        nextTasks,
      });
      return;
    }

    setActiveTask(null);
  };

  const handleDragCancel = (event: DragCancelEvent) => {
    markTaskOpenSuppressionAfterDrag(suppressTaskOpenRef, String(event.active.id));
    setActiveTask(null);
  };

  return (
    <BoardDndContext.Provider value={{ recentlyMovedTaskId, consumeSuppressedTaskOpen }}>
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetectionStrategy}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        {children}
        <DragOverlay dropAnimation={null}>
          {activeTask ? <DragOverlayCard task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>
    </BoardDndContext.Provider>
  );
}
