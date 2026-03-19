import { apiRequest } from '@/lib/api/client';
import type { Task, TaskActivity, TaskComment, TaskImage, TaskLocation } from '@/types/work-management';

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
  images: TaskImage[];
  comments: ApiTaskCommentResponse[];
  activity: ApiTaskActivityResponse[];
  location?: TaskLocation | null;
  created_at: string;
  updated_at: string;
  due_date?: string | null;
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
    images: task.images ?? [],
    comments: (task.comments ?? []).map(mapTaskComment),
    activity: (task.activity ?? []).map(mapTaskActivity),
    location: task.location ?? undefined,
    created_at: task.created_at,
    updated_at: task.updated_at,
    due_date: task.due_date ?? undefined,
  };
}

export async function getTask(taskId: string, getToken: () => Promise<string | null>): Promise<Task> {
  const response = await apiRequest<ApiTaskResponse>(`${API_PATH}/${taskId}`, getToken);
  return mapTaskResponse(response);
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
