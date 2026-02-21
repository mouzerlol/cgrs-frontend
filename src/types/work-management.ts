export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';

export type TaskStatus = 'backlog' | 'todo' | 'in-progress' | 'review' | 'done';

export interface BoardMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  email?: string;
}

export type TaskTag =
  | 'maintenance'
  | 'landscaping'
  | 'community'
  | 'admin'
  | 'safety'
  | 'infrastructure'
  | 'events'
  | 'urgent-repair';

export interface TaskLocation {
  block?: string;
  area?: string;
  description?: string;
}

export interface TaskImage {
  id: string;
  url: string;
  thumbnail: string;
  alt?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: BoardMember;
  tags: TaskTag[];
  location?: TaskLocation;
  dueDate?: string;
  images?: TaskImage[];
  createdAt: string;
  updatedAt?: string;
  commentCount: number;
  attachments: number;
}

export interface BoardColumn {
  id: TaskStatus;
  title: string;
  taskIds: string[];
}
