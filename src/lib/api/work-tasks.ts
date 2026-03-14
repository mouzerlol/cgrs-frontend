import { apiRequest } from '@/lib/api/client';
import type { Task, TaskActivity, TaskComment, TaskImage, TaskLocation } from '@/types/work-management';

const API_PATH = '/api/v1/tasks';

interface ApiUserSummary {
  id: string;
  name: string;
  avatarUrl?: string | null;
}

interface ApiTaskCommentResponse {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string | null;
  content: string;
  createdAt: string;
}

interface ApiTaskActivityResponse {
  id: string;
  actorId?: string | null;
  actorName: string;
  actorAvatarUrl?: string | null;
  activityType: TaskActivity['activityType'];
  message: string;
  createdAt: string;
}

interface ApiTaskResponse {
  id: string;
  boardId?: string | null;
  sourceRequestId?: string | null;
  title: string;
  description: string;
  status: Task['status'];
  priority: Task['priority'];
  assigneeId?: string | null;
  assignee?: ApiUserSummary | null;
  reporterId: string;
  reporter?: ApiUserSummary | null;
  tags: string[];
  images: TaskImage[];
  comments: ApiTaskCommentResponse[];
  activity: ApiTaskActivityResponse[];
  location?: TaskLocation | null;
  createdAt: string;
  updatedAt: string;
  dueDate?: string | null;
}

function mapTaskComment(comment: ApiTaskCommentResponse): TaskComment {
  return {
    id: comment.id,
    authorId: comment.authorId,
    authorName: comment.authorName,
    authorAvatarUrl: comment.authorAvatarUrl ?? null,
    content: comment.content,
    createdAt: comment.createdAt,
  };
}

function mapTaskActivity(activity: ApiTaskActivityResponse): TaskActivity {
  return {
    id: activity.id,
    actorId: activity.actorId ?? null,
    actorName: activity.actorName,
    actorAvatarUrl: activity.actorAvatarUrl ?? null,
    activityType: activity.activityType,
    message: activity.message,
    createdAt: activity.createdAt,
  };
}

export function mapTaskResponse(task: ApiTaskResponse): Task {
  return {
    id: task.id,
    boardId: task.boardId ?? null,
    sourceRequestId: task.sourceRequestId ?? null,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    assignee: task.assigneeId ?? undefined,
    assigneeName: task.assignee?.name,
    assigneeAvatarUrl: task.assignee?.avatarUrl ?? null,
    reporter: task.reporterId,
    reporterName: task.reporter?.name,
    reporterAvatarUrl: task.reporter?.avatarUrl ?? null,
    tags: task.tags,
    images: task.images ?? [],
    comments: (task.comments ?? []).map(mapTaskComment),
    activity: (task.activity ?? []).map(mapTaskActivity),
    location: task.location ?? undefined,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    dueDate: task.dueDate ?? undefined,
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
