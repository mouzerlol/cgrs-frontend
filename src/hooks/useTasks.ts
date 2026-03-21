'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import {
  listTasks,
  getTask,
  createTask,
  updateTask,
  addTaskComment,
  updateTaskComment,
  deleteTaskComment,
  deleteTask,
  type CreateTaskRequestBody,
  type UpdateTaskRequestBody,
} from '@/lib/api/work-tasks';
import type { TaskBoardMoveArgs } from '@/lib/work-management-dnd';
import type { Task, TaskComment, TaskStatus } from '@/types/work-management';

/** Board-scoped drag move: includes React Query cache key scope. */
export type TaskBoardMoveVariables = TaskBoardMoveArgs & { boardId: string };

interface TaskFilters {
  board_id?: string;
  assignee_id?: string;
  status_value?: string;
}

/** Fetch tasks with optional filtering. */
export function useTasks(filters: TaskFilters = {}) {
  const { getToken, isSignedIn } = useAuth();

  return useQuery<Task[]>({
    queryKey: ['tasks', filters],
    queryFn: () => listTasks(filters, getToken),
    enabled: !!isSignedIn,
    staleTime: 30 * 1000,
  });
}

/** Create a work task and refresh task lists. */
export function useCreateTask() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateTaskRequestBody) => createTask(body, getToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

function orderedTaskIdsForLane(tasks: Task[], status: TaskStatus): string[] {
  return tasks.filter((t) => t.status === status).map((t) => t.id);
}

function boardTaskListPredicate(boardId: string) {
  return (query: { queryKey: readonly unknown[] }) => {
    const key = query.queryKey;
    return (
      key.length >= 2 &&
      key[0] === 'tasks' &&
      typeof key[1] === 'object' &&
      key[1] !== null &&
      'board_id' in (key[1] as object) &&
      (key[1] as { board_id?: string }).board_id === boardId
    );
  };
}

/**
 * Apply a board drag result: optimistically reorder/update status in cache, PATCH when status changed.
 */
export function useUpdateTask() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, previousStatus, nextStatus, nextTasks }: TaskBoardMoveVariables) => {
      const lane_task_ids = orderedTaskIdsForLane(nextTasks, nextStatus);
      const body: UpdateTaskRequestBody = { lane_task_ids };
      if (previousStatus !== nextStatus) {
        body.status = nextStatus;
      }
      return updateTask(taskId, body, getToken);
    },
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const predicate = boardTaskListPredicate(vars.boardId);
      const previous = queryClient.getQueriesData<Task[]>({ predicate });

      queryClient.setQueriesData<Task[]>({ predicate }, () => vars.nextTasks);

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        for (const [queryKey, data] of context.previous) {
          queryClient.setQueryData(queryKey, data);
        }
      }
    },
    onSettled: (_data, _err, vars) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', vars.taskId] });
    },
  });
}

/** Fetch a single task by ID. */
export function useTask(taskId: string) {
  const { getToken, isSignedIn } = useAuth();

  return useQuery<Task>({
    queryKey: ['tasks', taskId],
    queryFn: () => getTask(taskId, getToken),
    enabled: !!isSignedIn && !!taskId,
  });
}

/** Add a comment to a task. */
export function useAddTaskComment() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, content }: { taskId: string; content: string }) =>
      addTaskComment(taskId, content, getToken),
    onSuccess: (_data, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

/** Update a task comment. */
export function useUpdateTaskComment() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, commentId, content }: { taskId: string; commentId: string; content: string }) =>
      updateTaskComment(taskId, commentId, content, getToken),
    onSuccess: (_data, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

/** Delete a task comment. */
export function useDeleteTaskComment() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, commentId }: { taskId: string; commentId: string }) =>
      deleteTaskComment(taskId, commentId, getToken),
    onSuccess: (_data, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

/** Update individual task fields via PATCH. */
export function useUpdateTaskField() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, updates }: { taskId: string; updates: UpdateTaskRequestBody }) =>
      updateTask(taskId, updates, getToken),
    onSuccess: (_data, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

/** Soft-delete a task. */
export function useDeleteTask() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => deleteTask(taskId, getToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
