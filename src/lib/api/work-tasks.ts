import { apiRequest } from '@/lib/api/client';
import type { Task, TaskActivity, TaskComment, TaskImage, TaskLocation, TaskPriority, TaskStatus } from '@/types/work-management';

const API_PATH = '/api/v1/tasks';

interface ApiUserSummary {
  id: string;
  name: string;
  avatar_url?: string | null;
}

interface ApiTaskCommentResponse {
  id: string;
  author_id: string;
  author_name: string;
  author_avatar_url?: string | null;
  content: string;
  created_at: string;
}

interface ApiTaskActivityResponse {
  id: string;
  actor_id?: string | null;
  actor_name: string;
  actor_avatar_url?: string | null;
  activity_type: TaskActivity['activity_type'];
  message: string;
  created_at: string;
}

interface ApiTaskImage {
  id: string;
  url: string;
  thumbnail: string;
  alt?: string | null;
  type?: TaskImage['type'];
  duration?: number | null;
  attachment_id?: string | null;
}

interface ApiTaskResponse {
  id: string;
  board_id?: string | null;
  source_request_id?: string | null;
  title: string;
  description: string;
  status: Task['status'];
  priority: Task['priority'];
  assignee_id?: string | null;
  assignee?: ApiUserSummary | null;
  reporter_id: string;
  reporter?: ApiUserSummary | null;
  tags: string[];
  images: ApiTaskImage[];
  comments: ApiTaskCommentResponse[];
  activity: ApiTaskActivityResponse[];
  location?: TaskLocation | null;
  created_at: string;
  updated_at: string;
  due_date?: string | null;
  lane_position?: number;
}

function mapApiTaskImage(img: ApiTaskImage): TaskImage {
  return {
    id: img.id,
    url: img.url ?? '',
    thumbnail: img.thumbnail ?? '',
    alt: img.alt ?? undefined,
    type: img.type ?? 'image',
    duration: img.duration ?? undefined,
    attachmentId: img.attachment_id ?? undefined,
  };
}

function mapTaskComment(comment: ApiTaskCommentResponse): TaskComment {
  return {
    id: comment.id,
    author_id: comment.author_id,
    author_name: comment.author_name,
    author_avatar_url: comment.author_avatar_url ?? null,
    content: comment.content,
    created_at: comment.created_at,
  };
}

function mapTaskActivity(activity: ApiTaskActivityResponse): TaskActivity {
  return {
    id: activity.id,
    actor_id: activity.actor_id ?? null,
    actor_name: activity.actor_name,
    actor_avatar_url: activity.actor_avatar_url ?? null,
    activity_type: activity.activity_type,
    message: activity.message,
    created_at: activity.created_at,
  };
}

export function mapTaskResponse(task: ApiTaskResponse): Task {
  return {
    id: task.id,
    board_id: task.board_id ?? null,
    source_request_id: task.source_request_id ?? null,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    assignee: task.assignee_id ?? undefined,
    assignee_name: task.assignee?.name,
    assignee_avatar_url: task.assignee?.avatar_url ?? null,
    reporter: task.reporter_id,
    reporter_name: task.reporter?.name,
    reporter_avatar_url: task.reporter?.avatar_url ?? null,
    tags: task.tags,
    images: (task.images ?? []).map(mapApiTaskImage),
    comments: (task.comments ?? []).map(mapTaskComment),
    activity: (task.activity ?? []).map(mapTaskActivity),
    location: task.location ?? undefined,
    created_at: task.created_at,
    updated_at: task.updated_at,
    due_date: task.due_date ?? undefined,
    lane_position: task.lane_position ?? 0,
  };
}

export async function getTask(taskId: string, getToken: () => Promise<string | null>): Promise<Task> {
  const response = await apiRequest<ApiTaskResponse>(`${API_PATH}/${taskId}`, getToken);
  return mapTaskResponse(response);
}

export interface TaskFilters {
  board_id?: string;
  assignee_id?: string;
  status_value?: string;
}

/** JSON body for PATCH /api/v1/tasks/{id} (optional fields, matches backend UpdateTaskRequest). */
export interface UpdateTaskRequestBody {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee_id?: string | null;
  tags?: string[];
  location?: TaskLocation;
  due_date?: string;
  images?: TaskImage[];
  /** When every image is R2-backed, send ordered ids (replaces linked attachments when set). */
  attachment_ids?: string[];
  /** Full ordered task ids for the task's status column after this update (board tasks only). */
  lane_task_ids?: string[];
}

/** JSON body for POST /api/v1/tasks (snake_case, matches backend CreateTaskRequest). */
export interface CreateTaskRequestBody {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  board_id: string;
  tags: string[];
  assignee_id?: string;
  location?: TaskLocation;
  due_date?: string;
  images?: TaskImage[];
  attachment_ids?: string[];
}

/**
 * Build PATCH fields for task media: prefer `attachment_ids` when all items are R2-backed (or empty).
 * Otherwise keep legacy inline `images` (e.g. data URLs) for older rows.
 */
export function taskImagesToUpdateBody(
  images: TaskImage[],
): Pick<UpdateTaskRequestBody, 'attachment_ids' | 'images'> {
  if (images.length === 0) {
    return { attachment_ids: [] };
  }
  const allR2 = images.every((i) => Boolean(i.attachmentId));
  if (allR2) {
    return { attachment_ids: images.map((i) => i.attachmentId!) };
  }
  return { images };
}

/**
 * Convert a value from `<input type="date">` (YYYY-MM-DD) to an ISO-8601 instant for the API.
 * Uses end-of-day UTC so the chosen calendar day is unambiguous.
 */
export function dueDateInputToIso(dateInput: string): string | undefined {
  const trimmed = dateInput.trim();
  if (!trimmed) return undefined;
  return `${trimmed}T23:59:59.999Z`;
}

/** Create a work task; reporter is taken from the authenticated principal on the server. */
export async function createTask(
  body: CreateTaskRequestBody,
  getToken: () => Promise<string | null>,
): Promise<Task> {
  const attachmentIds = body.attachment_ids?.filter(Boolean) ?? [];
  const payload: Record<string, unknown> = {
    title: body.title.trim(),
    description: body.description.trim(),
    status: body.status,
    priority: body.priority,
    board_id: body.board_id,
    tags: body.tags,
    images: attachmentIds.length ? [] : body.images ?? [],
  };
  if (attachmentIds.length) {
    payload.attachment_ids = attachmentIds;
  }
  if (body.assignee_id) payload.assignee_id = body.assignee_id;
  if (body.location) payload.location = body.location;
  if (body.due_date) payload.due_date = body.due_date;

  const response = await apiRequest<ApiTaskResponse>(API_PATH, getToken, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return mapTaskResponse(response);
}

/** Partially update a work task. */
export async function updateTask(
  taskId: string,
  body: UpdateTaskRequestBody,
  getToken: () => Promise<string | null>,
): Promise<Task> {
  const payload: Record<string, unknown> = {};
  if (body.title !== undefined) payload.title = body.title;
  if (body.description !== undefined) payload.description = body.description;
  if (body.status !== undefined) payload.status = body.status;
  if (body.priority !== undefined) payload.priority = body.priority;
  if (body.assignee_id !== undefined) payload.assignee_id = body.assignee_id;
  if (body.tags !== undefined) payload.tags = body.tags;
  if (body.location !== undefined) payload.location = body.location;
  if (body.due_date !== undefined) payload.due_date = body.due_date;
  if (body.attachment_ids !== undefined) {
    payload.attachment_ids = body.attachment_ids;
  } else if (body.images !== undefined) {
    payload.images = body.images;
  }
  if (body.lane_task_ids !== undefined) payload.lane_task_ids = body.lane_task_ids;

  const response = await apiRequest<ApiTaskResponse>(`${API_PATH}/${taskId}`, getToken, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return mapTaskResponse(response);
}

export async function listTasks(
  filters: TaskFilters,
  getToken: () => Promise<string | null>,
): Promise<Task[]> {
  const searchParams = new URLSearchParams();
  if (filters.board_id) searchParams.set('board_id', filters.board_id);
  if (filters.assignee_id) searchParams.set('assignee_id', filters.assignee_id);
  if (filters.status_value) searchParams.set('status_value', filters.status_value);

  const queryString = searchParams.toString();
  const url = queryString ? `${API_PATH}?${queryString}` : API_PATH;

  const response = await apiRequest<ApiTaskResponse[]>(url, getToken);
  return response.map(mapTaskResponse);
}

export async function addTaskComment(
  taskId: string,
  content: string,
  getToken: () => Promise<string | null>,
): Promise<TaskComment> {
  const response = await apiRequest<ApiTaskCommentResponse>(`${API_PATH}/${taskId}/comments`, getToken, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
  return mapTaskComment(response);
}

export async function updateTaskComment(
  taskId: string,
  commentId: string,
  content: string,
  getToken: () => Promise<string | null>,
): Promise<TaskComment> {
  const response = await apiRequest<ApiTaskCommentResponse>(
    `${API_PATH}/${taskId}/comments/${commentId}`,
    getToken,
    {
      method: 'PATCH',
      body: JSON.stringify({ content }),
    },
  );
  return mapTaskComment(response);
}

export async function deleteTaskComment(
  taskId: string,
  commentId: string,
  getToken: () => Promise<string | null>,
): Promise<void> {
  await apiRequest<void>(`${API_PATH}/${taskId}/comments/${commentId}`, getToken, {
    method: 'DELETE',
  });
}

export async function deleteTask(taskId: string, getToken: () => Promise<string | null>): Promise<void> {
  await apiRequest<void>(`${API_PATH}/${taskId}`, getToken, {
    method: 'DELETE',
  });
}
