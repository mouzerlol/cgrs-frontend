export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';
export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done' | 'closed';

export interface BoardMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
}

export interface TaskTag {
  id: string;
  label: string;
}

export interface TaskLocation {
  lat: number;
  lng: number;
  label?: string;
}

export interface TaskImage {
  id: string;
  url: string;
  thumbnail: string;
  alt?: string;
  type?: 'image' | 'video';
  duration?: number;
}

export interface TaskComment {
  id: string;
  authorId: string;
  authorName?: string;
  authorAvatarUrl?: string | null;
  content: string;
  createdAt: string;
}

export interface TaskActivity {
  id: string;
  actorId?: string | null;
  actorName: string;
  actorAvatarUrl?: string | null;
  activityType: 'task_created' | 'comment_added' | 'status_changed' | 'request_withdrawn' | 'request_closed';
  message: string;
  createdAt: string;
}

export interface Task {
  id: string;
  boardId?: string | null;
  sourceRequestId?: string | null;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: string;
  assigneeName?: string;
  assigneeAvatarUrl?: string | null;
  reporter: string;
  reporterName?: string;
  reporterAvatarUrl?: string | null;
  tags: string[];
  images: TaskImage[];
  comments?: TaskComment[];
  activity?: TaskActivity[];
  location?: TaskLocation;
  createdAt: string;
  updatedAt?: string;
  dueDate?: string;
}

export interface BoardColumn {
  id: TaskStatus;
  title: string;
}

export type BoardColor = 'sage' | 'terracotta' | 'forest' | 'amber';

export interface Board {
  id: string;
  name: string;
  description: string;
  color: BoardColor;
  icon: string;
  taskCount: number;
  createdAt: string;
  updatedAt: string;
}
