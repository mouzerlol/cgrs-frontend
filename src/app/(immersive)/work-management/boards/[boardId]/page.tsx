'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import BoardColumn from '@/components/work-management/BoardColumn';
import BoardDndContext from '@/components/work-management/BoardDndContext';
import TaskDetailModal from '@/components/work-management/TaskDetailModal';
import CreateTaskModal from '@/components/work-management/CreateTaskModal';
import FilterBar from '@/components/work-management/FilterBar';
import WorkManagementNavBar from '@/components/work-management/WorkManagementNavBar';
import BoardLoadingState from '@/components/work-management/BoardLoadingState';
import { BOARD_COLUMNS, groupTasksByStatus } from '@/lib/work-management';
import type { TaskBoardMoveArgs } from '@/lib/work-management-dnd';
import { useBoardFilters } from '@/hooks/useBoardFilters';
import { useBoard } from '@/hooks/useBoards';
import { useTasks, useCreateTask, useUpdateTask, useUpdateTaskField } from '@/hooks/useTasks';
import {
  dueDateInputToIso,
  taskImagesToUpdateBody,
  type CreateTaskRequestBody,
  type UpdateTaskRequestBody,
} from '@/lib/api/work-tasks';
import { formatTaskMutationError } from '@/lib/api/mutation-errors';
import type { CreateTaskFormValues, Task, TaskStatus } from '@/types/work-management';

export default function BoardPage() {
  const params = useParams();
  const boardId = params.boardId as string;

  const { data: board, isLoading: boardLoading } = useBoard(boardId);
  const { data: tasks = [], isLoading: tasksLoading } = useTasks({ board_id: boardId });
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const updateFieldMutation = useUpdateTaskField();

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  /** Snapshot of the task as it was when the modal opened — used to diff changes. */
  const originalTaskRef = useRef<Task | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createColumnId, setCreateColumnId] = useState<TaskStatus | null>(null);
  const [createTaskError, setCreateTaskError] = useState<string | null>(null);
  const [moveError, setMoveError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const { filters, setFilter, clearFilters, filteredTasks, hasActiveFilters } = useBoardFilters(tasks);

  const handleCreateTask = (status: TaskStatus) => {
    setCreateTaskError(null);
    setCreateColumnId(status);
    setIsCreateModalOpen(true);
  };

  const handleCardClick = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId) || null;
    originalTaskRef.current = task;
    setSelectedTaskId(taskId);
  };

  const handleTaskUpdate = useCallback(
    (updatedTask: Task) => {
      if (!originalTaskRef.current || !selectedTaskId) return;

      setFieldError(null);

      const original = originalTaskRef.current;
      const diff = (a: unknown, b: unknown) => a !== b;

      // --- All other fields (single PATCH); comments are handled inside TaskComments via dedicated endpoints ---
      const updates: UpdateTaskRequestBody = {};
      if (diff(original.title, updatedTask.title)) updates.title = updatedTask.title;
      if (diff(original.description, updatedTask.description)) updates.description = updatedTask.description;
      if (diff(original.priority, updatedTask.priority)) updates.priority = updatedTask.priority;
      if (diff(original.assignee, updatedTask.assignee)) {
        updates.assignee_id = updatedTask.assignee || null;
      }
      if (diff(JSON.stringify(original.tags), JSON.stringify(updatedTask.tags))) updates.tags = updatedTask.tags;
      if (diff(JSON.stringify(original.location), JSON.stringify(updatedTask.location))) {
        updates.location = updatedTask.location || undefined;
      }
      if (diff(JSON.stringify(original.images), JSON.stringify(updatedTask.images))) {
        Object.assign(updates, taskImagesToUpdateBody(updatedTask.images));
      }

      if (Object.keys(updates).length > 0) {
        updateFieldMutation.mutate(
          { taskId: selectedTaskId, updates },
          {
            onError: (err) => setFieldError(formatTaskMutationError(err)),
          },
        );
      }
    },
    [selectedTaskId, updateFieldMutation],
  );

  const handleTaskMove = useCallback(
    (args: TaskBoardMoveArgs) => {
      setMoveError(null);
      updateTaskMutation.mutate(
        { boardId, ...args },
        {
          onError: (err) => {
            setMoveError(formatTaskMutationError(err));
          },
        },
      );
    },
    [boardId, updateTaskMutation],
  );

  const handleTaskCreate = (values: CreateTaskFormValues) => {
    setCreateTaskError(null);
    const dueIso = dueDateInputToIso(values.dueDate);
    const body: CreateTaskRequestBody = {
      title: values.title,
      description: values.description,
      status: values.status,
      priority: values.priority,
      board_id: boardId,
      tags: values.tags,
    };
    if (values.assigneeUserId) body.assignee_id = values.assigneeUserId;
    if (dueIso) body.due_date = dueIso;
    if (
      values.location &&
      typeof values.location.lat === 'number' &&
      typeof values.location.lng === 'number'
    ) {
      body.location = values.location;
    }
    const attachmentIds = (values.images ?? [])
      .map((i) => i.attachmentId)
      .filter((id): id is string => Boolean(id));
    if (attachmentIds.length) {
      body.attachment_ids = attachmentIds;
    }
    createTaskMutation.mutate(body, {
      onSuccess: () => {
        setIsCreateModalOpen(false);
        setCreateColumnId(null);
      },
      onError: (err) => {
        setCreateTaskError(formatTaskMutationError(err));
      },
    });
  };

  const groupedTasks = groupTasksByStatus(filteredTasks);
  const selectedTask = selectedTaskId ? tasks.find(t => t.id === selectedTaskId) || null : null;
  const availableTags = Array.from(new Set(tasks.flatMap(t => t.tags))).sort();

  /** Keep comment/activity baseline in sync with server when the query refetches so we do not re-POST existing comments. */
  useEffect(() => {
    if (!selectedTaskId || !selectedTask || !originalTaskRef.current) return;
    if (originalTaskRef.current.id !== selectedTask.id) return;
    originalTaskRef.current = {
      ...originalTaskRef.current,
      comments: selectedTask.comments ?? [],
      activity: selectedTask.activity ?? [],
      images: selectedTask.images ?? [],
    };
  }, [selectedTaskId, selectedTask]);

  if (boardLoading || tasksLoading) {
    return (
      <div className="h-full w-full overflow-hidden flex flex-col bg-gradient-to-br from-bone via-bone to-sage/20">
        <WorkManagementNavBar
          title="Loading..."
          showBackButton
          backHref="/work-management/boards"
          backLabel="Boards"
        />
        <div className="flex-1 min-h-0 overflow-hidden flex items-stretch justify-center p-4 md:p-6">
          <BoardLoadingState />
        </div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="h-full w-full overflow-hidden flex flex-col bg-gradient-to-br from-bone via-bone to-sage/20">
        <WorkManagementNavBar
          title="Board not found"
          showBackButton
          backHref="/work-management/boards"
          backLabel="Boards"
        />
        <div className="flex-1 min-h-0 overflow-hidden flex items-center justify-center">
          <div className="text-forest/60">Board not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-hidden flex flex-col bg-gradient-to-br from-bone via-bone to-sage/20">
      <WorkManagementNavBar
        title={board.name}
        showBackButton
        backHref="/work-management/boards"
        backLabel="Boards"
        actions={[
          {
            label: '+ New Task',
            onClick: () => handleCreateTask('todo'),
            variant: 'primary',
          },
        ]}
      >
        <FilterBar
          filters={filters}
          setFilter={setFilter}
          clearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
          availableTags={availableTags}
          size="sm"
        />
      </WorkManagementNavBar>

      {moveError || fieldError ? (
        <div
          className="shrink-0 mx-4 md:mx-6 mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {moveError || fieldError}
          <button
            type="button"
            className="ml-2 underline font-medium"
            onClick={() => {
              setMoveError(null);
              setFieldError(null);
            }}
          >
            Dismiss
          </button>
        </div>
      ) : null}

      <BoardDndContext tasks={tasks} onTaskMove={handleTaskMove}>
        <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden flex items-stretch gap-4 p-4 md:p-6 scrollbar-thin">
          {BOARD_COLUMNS.map(column => (
            <BoardColumn
              key={column.id}
              status={column.id}
              title={column.title}
              tasks={groupedTasks[column.id]}
              onCreateTask={handleCreateTask}
              onCardClick={handleCardClick}
            />
          ))}
        </div>
      </BoardDndContext>

      <TaskDetailModal
        isOpen={!!selectedTaskId}
        onClose={() => {
          setSelectedTaskId(null);
          originalTaskRef.current = null;
        }}
        task={selectedTask}
        onUpdate={handleTaskUpdate}
        onAssetUploadError={(msg) => setFieldError(msg)}
      />

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setCreateTaskError(null);
        }}
        defaultStatus={createColumnId}
        onSubmit={handleTaskCreate}
        isSubmitting={createTaskMutation.isPending}
        submitError={createTaskError}
      />
    </div>
  );
}
