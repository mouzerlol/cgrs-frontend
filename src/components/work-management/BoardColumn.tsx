'use client';

import { TaskStatus, Task } from '@/types/work-management';
import Button from '@/components/ui/Button';
import DraggableCard from './DraggableCard';
import DroppableColumn from './DroppableColumn';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDndContext } from '@dnd-kit/core';
import { useEffect, useMemo, useRef, useState } from 'react';

interface BoardColumnProps {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  onCreateTask: (status: TaskStatus) => void;
  onCardClick: (taskId: string) => void;
}

// #region agent log
const logDebug = (hypothesisId: string, location: string, message: string, data: Record<string, unknown>) => {
  fetch('http://127.0.0.1:7719/ingest/e80822c0-0494-4ae7-81f4-f09c3792dba1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d22ed8'},body:JSON.stringify({sessionId:'d22ed8',runId:'preview-v2',hypothesisId,location,message,data,timestamp:Date.now()})}).catch(()=>{});
};
// #endregion

export default function BoardColumn({ status, title, tasks, onCreateTask, onCardClick }: BoardColumnProps) {
  const { active, over } = useDndContext();
  const taskIds = useMemo(() => tasks.map((task) => task.id), [tasks]);
  const [dropIndicatorHeight, setDropIndicatorHeight] = useState(96);
  const measuredActiveIdRef = useRef<string | null>(null);
  const loggedPreviewKeyRef = useRef<string | null>(null);
  const overType = over?.data.current?.type;
  const overTaskId = overType === 'Task' ? String(over?.id) : null;
  const overColumnId = overType === 'Column' ? String(over?.id) : overType === 'Task' ? String(over?.data.current?.status) : null;
  const isDraggingTask = active?.data.current?.type === 'Task';
  const isTargetColumn = Boolean(isDraggingTask && overColumnId === status);
  const activeTaskId = isDraggingTask ? String(active?.id) : null;
  const sourceColumnId = isDraggingTask ? String(active?.data.current?.status ?? '') : null;
  const lastTaskIdInColumn = tasks.length > 0 ? tasks[tasks.length - 1].id : null;
  const isOverLastTaskInTargetColumn = isTargetColumn && overType === 'Task' && overTaskId === lastTaskIdInColumn;
  const activeTop = active?.rect.current.translated?.top ?? active?.rect.current.initial?.top ?? null;
  const overMidpoint = typeof over?.rect?.top === 'number' && typeof over?.rect?.height === 'number'
    ? over.rect.top + over.rect.height / 2
    : null;
  const isBelowOverMidpoint = activeTop !== null && overMidpoint !== null ? activeTop > overMidpoint : false;
  const shouldShowBottomIndicatorForLastTask = Boolean(isOverLastTaskInTargetColumn && isBelowOverMidpoint);

  useEffect(() => {
    if (!activeTaskId) {
      measuredActiveIdRef.current = null;
      return;
    }

    if (measuredActiveIdRef.current === activeTaskId) {
      return;
    }

    const selector = `[data-task-id="${activeTaskId}"]`;
    const activeTaskElement = document.querySelector<HTMLElement>(selector);
    if (!activeTaskElement) {
      return;
    }

    const measuredHeight = Math.round(activeTaskElement.getBoundingClientRect().height);
    if (measuredHeight > 0) {
      setDropIndicatorHeight(measuredHeight);
      measuredActiveIdRef.current = activeTaskId;
      // #region agent log
      logDebug('H5', 'BoardColumn.tsx:useEffect(measure)', 'measured-active-card-height', {
        columnStatus: status,
        activeTaskId,
        measuredHeight,
      });
      // #endregion
    }
  }, [activeTaskId, status]);

  useEffect(() => {
    if (!isDraggingTask) {
      loggedPreviewKeyRef.current = null;
      return;
    }

    const previewKey = `${activeTaskId}|${status}|${String(overType ?? 'none')}|${String(overColumnId ?? 'none')}|${String(overTaskId ?? 'none')}`;
    if (loggedPreviewKeyRef.current === previewKey) {
      return;
    }

    loggedPreviewKeyRef.current = previewKey;
    // #region agent log
    logDebug('H7', 'BoardColumn.tsx:useEffect(preview)', 'preview-target-updated', {
      activeTaskId,
      columnStatus: status,
      isTargetColumn,
      overType: overType ?? null,
      overColumnId,
      overTaskId,
      indicatorHeight: dropIndicatorHeight,
      isOverLastTaskInTargetColumn,
      isBelowOverMidpoint,
      shouldShowBottomIndicatorForLastTask,
    });
    // #endregion
  }, [
    activeTaskId,
    dropIndicatorHeight,
    isDraggingTask,
    isTargetColumn,
    isOverLastTaskInTargetColumn,
    isBelowOverMidpoint,
    shouldShowBottomIndicatorForLastTask,
    overColumnId,
    overTaskId,
    overType,
    status,
  ]);

  useEffect(() => {
    if (!isDraggingTask || !activeTaskId) {
      return;
    }
    // #region agent log
    logDebug('H15', 'BoardColumn.tsx:useEffect(source-lane)', 'source-target-lane-state', {
      activeTaskId,
      columnStatus: status,
      sourceColumnId,
      isSourceColumn: sourceColumnId === status,
      isTargetColumn,
      overType: overType ?? null,
      overTaskId,
    });
    // #endregion
  }, [activeTaskId, isDraggingTask, isTargetColumn, overTaskId, overType, sourceColumnId, status]);

  return (
    <div className="bg-sage-lite/60 backdrop-blur-xl border border-sage/30 shadow-sm rounded-[10px] w-[280px] min-w-[280px] flex flex-col h-full min-h-0 transition-shadow hover:shadow-md">
      <div className="p-3 flex items-center justify-between shrink-0 border-b border-sage/10">
        <h2 className="font-display text-[15px] font-semibold text-forest tracking-wide">{title}</h2>
        <span className="bg-forest/10 text-forest/90 text-[10px] px-2 py-0.5 rounded-full font-medium">
          {tasks.length}
        </span>
      </div>
      
      <DroppableColumn status={status}>
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <div className="overflow-y-auto flex-1 p-2 space-y-2 scrollbar-thin min-h-[2px]">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={isDraggingTask ? 'transition-[transform] duration-120 ease-out' : ''}
              >
                <div
                  className={isDraggingTask ? 'overflow-hidden transition-[height,margin] duration-120 ease-out' : 'overflow-hidden'}
                  style={{
                    height: isTargetColumn &&
                      overType === 'Task' &&
                      overTaskId === task.id &&
                      activeTaskId !== task.id &&
                      !(shouldShowBottomIndicatorForLastTask && task.id === lastTaskIdInColumn)
                      ? dropIndicatorHeight
                      : 0,
                    marginBottom: isTargetColumn &&
                      overType === 'Task' &&
                      overTaskId === task.id &&
                      activeTaskId !== task.id &&
                      !(shouldShowBottomIndicatorForLastTask && task.id === lastTaskIdInColumn)
                      ? 8
                      : 0,
                  }}
                >
                  <div className="h-full rounded-[10px] border border-zinc-500/45 bg-zinc-400/35 ring-1 ring-zinc-500/30" />
                </div>
                <DraggableCard task={task} onClick={onCardClick} />
              </div>
            ))}
            <div
              className={isDraggingTask ? '!mt-0 overflow-hidden transition-[height] duration-120 ease-out' : '!mt-0 overflow-hidden'}
              style={{
                height: isTargetColumn && (overType === 'Column' || shouldShowBottomIndicatorForLastTask)
                  ? dropIndicatorHeight
                  : 0,
              }}
            >
              <div className="h-full rounded-[10px] border border-zinc-500/45 bg-zinc-400/35 ring-1 ring-zinc-500/30" />
            </div>
          </div>
        </SortableContext>
      </DroppableColumn>

      <div className="p-2 shrink-0 border-t border-sage/10">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-forest/60 hover:text-forest text-sm bg-transparent border-transparent hover:bg-forest/5 font-medium transition-colors"
          onClick={() => onCreateTask(status)}
        >
          + Add a card
        </Button>
      </div>
    </div>
  );
}
