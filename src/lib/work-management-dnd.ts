import type { Task, TaskStatus } from '@/types/work-management';

/** Column order used when flattening tasks after a drag reorder. */
export const TASK_STATUS_LANE_ORDER: TaskStatus[] = [
  'backlog',
  'todo',
  'in_progress',
  'review',
  'done',
  'closed',
];

/** Payload after a drag operation: next list order and status transition for the active card. */
export interface TaskBoardMoveArgs {
  taskId: string;
  previousStatus: TaskStatus;
  nextStatus: TaskStatus;
  nextTasks: Task[];
}

/**
 * Move a task into a lane (and optional position among cards in that lane), returning a new flat task list.
 * Order follows TASK_STATUS_LANE_ORDER, then per-lane id order; assigns lane_position within each lane.
 */
export function reorderTasksInLanes(
  items: Task[],
  activeId: string,
  targetStatus: TaskStatus,
  overTaskId: string | null,
  placeAfterOverTask: boolean,
): Task[] {
  const byId = new Map(items.map((task) => [task.id, { ...task }]));
  const activeTask = byId.get(activeId);
  if (!activeTask) {
    return items;
  }

  const lanes = new Map<TaskStatus, string[]>(
    TASK_STATUS_LANE_ORDER.map((status) => [status, items.filter((task) => task.status === status).map((task) => task.id)]),
  );

  const sourceStatus = activeTask.status;
  lanes.set(
    sourceStatus,
    (lanes.get(sourceStatus) || []).filter((id) => id !== activeId),
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

  const now = new Date().toISOString();
  byId.set(activeId, { ...activeTask, status: targetStatus, updated_at: now });

  const rebuilt: Task[] = [];
  for (const status of TASK_STATUS_LANE_ORDER) {
    let lanePos = 0;
    for (const id of lanes.get(status) || []) {
      const task = byId.get(id);
      if (task) {
        rebuilt.push({
          ...task,
          status,
          lane_position: lanePos++,
          updated_at: id === activeId ? now : task.updated_at,
        });
      }
    }
  }
  return rebuilt;
}
