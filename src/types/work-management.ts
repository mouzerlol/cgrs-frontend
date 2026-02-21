export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';
export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';

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
}

export interface TaskComment {
  id: string;
  authorId: string;
  content: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: string;
  reporter: string;
  tags: string[];
  images: TaskImage[];
  comments?: TaskComment[];
  location?: TaskLocation;
  createdAt: string;
  updatedAt?: string;
  dueDate?: string;
}

export interface BoardColumn {
  id: TaskStatus;
  title: string;
}
