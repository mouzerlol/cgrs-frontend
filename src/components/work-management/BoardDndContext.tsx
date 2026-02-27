'use client';

import { useRef, useState } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragStartEvent,
  DragOverEvent,
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

const STATUS_ORDER: TaskStatus[] = ['backlog', 'todo', 'in_progress', 'review', 'done'];

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

// #region agent log
const logDebug = (hypothesisId: string, location: string, message: string, data: Record<string, unknown>) => {
  fetch('http://127.0.0.1:7719/ingest/e80822c0-0494-4ae7-81f4-f09c3792dba1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d22ed8'},body:JSON.stringify({sessionId:'d22ed8',runId:'preview-v1',hypothesisId,location,message,data,timestamp:Date.now()})}).catch(()=>{});
};
// #endregion

export default function BoardDndContext({ children, tasks, setTasks }: BoardDndContextProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const lastLoggedOverIdRef = useRef<string | null>(null);

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
      lastLoggedOverIdRef.current = null;
      // #region agent log
      logDebug('H1', 'BoardDndContext.tsx:handleDragStart', 'drag-start', { activeId: String(active.id), status: task.status });
      // #endregion
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === 'Task';
    const isOverTask = over.data.current?.type === 'Task';

    if (!isActiveTask) return;

    if (lastLoggedOverIdRef.current !== String(overId)) {
      const activeTaskState = tasks.find((t) => t.id === activeId);
      const overTaskState = isOverTask ? tasks.find((t) => t.id === overId) : null;
      // #region agent log
      logDebug('H2', 'BoardDndContext.tsx:handleDragOver', 'drag-over-target-change', {
        activeId: String(activeId),
        overId: String(overId),
        overType: String(over.data.current?.type ?? 'unknown'),
        activeStatus: activeTaskState?.status ?? null,
        overStatus: overTaskState?.status ?? (over.data.current?.type === 'Column' ? String(overId) : null),
      });
      // #endregion
      lastLoggedOverIdRef.current = String(overId);
    }
    // #region agent log
    logDebug('H8', 'BoardDndContext.tsx:handleDragOver', 'preview-only-no-task-mutation', {
      activeId: String(activeId),
      overId: String(overId),
      overType: String(over.data.current?.type ?? 'unknown'),
    });
    // #endregion
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    lastLoggedOverIdRef.current = null;
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === 'Task';
    const isOverTask = over.data.current?.type === 'Task';
    const isOverColumn = over.data.current?.type === 'Column';
    // #region agent log
    logDebug('H4', 'BoardDndContext.tsx:handleDragEnd', 'drag-end', { activeId: String(activeId), overId: String(overId), overType: String(over.data.current?.type ?? 'unknown') });
    // #endregion

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
        // #region agent log
        logDebug('H10', 'BoardDndContext.tsx:handleDragEnd', 'drop-over-task-before-move', {
          activeId: String(activeId),
          overId: String(overId),
          activeIndex,
          overIndex,
          activeStatus,
          overStatus,
          targetOrderBefore: targetOrderBefore.map(String),
          overLaneIndex,
          isOverLastInLane,
          isBelowOverMidpoint,
          placeAfterOverTask,
        });
        // #endregion
        
        const moved = reorderInLanes(prev, String(activeId), overStatus, String(overId), placeAfterOverTask);
        // #region agent log
        logDebug(activeStatus !== overStatus ? 'H11' : 'H12', 'BoardDndContext.tsx:handleDragEnd', 'drop-over-task-after-lane-rebuild', {
          activeId: String(activeId),
          overId: String(overId),
          fromStatus: activeStatus,
          targetStatus,
          targetOrderAfter: moved.filter((t) => t.status === targetStatus).map((t) => String(t.id)),
        });
        // #endregion
        return moved;
      });
    }

    // Handle task dropped on empty column
    if (isActiveTask && isOverColumn) {
      setTasks((prev) => {
        const activeIndex = prev.findIndex((t) => t.id === activeId);
        const overStatus = overId as TaskStatus;
        
        if (activeIndex === -1) return prev;
        // #region agent log
        logDebug('H13', 'BoardDndContext.tsx:handleDragEnd', 'drop-over-column-before-move', {
          activeId: String(activeId),
          activeIndex,
          fromStatus: prev[activeIndex].status,
          toStatus: overStatus,
        });
        // #endregion
        
        // Update status when dropped on different column
        if (prev[activeIndex].status !== overStatus) {
          const moved = reorderInLanes(prev, String(activeId), overStatus, null, false);
          // #region agent log
          logDebug('H13', 'BoardDndContext.tsx:handleDragEnd', 'drop-over-column-after-move', {
            activeId: String(activeId),
            toStatus: overStatus,
            targetOrderAfter: moved.filter((t) => t.status === overStatus).map((t) => String(t.id)),
          });
          // #endregion
          return moved;
        }
        return prev;
      });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
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
