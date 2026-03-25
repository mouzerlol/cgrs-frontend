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
  author_id: string;
  author_name?: string;
  author_avatar_url?: string | null;
  content: string;
  created_at: string;
}

export interface TaskActivity {
  id: string;
  actor_id?: string | null;
  actor_name: string;
  actor_avatar_url?: string | null;
  activity_type: 'task_created' | 'comment_added' | 'status_changed' | 'request_withdrawn' | 'request_closed';
  message: string;
  created_at: string;
}

export interface Task {
  id: string;
  board_id?: string | null;
  source_request_id?: string | null;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: string;
  assignee_name?: string;
  assignee_avatar_url?: string | null;
  reporter: string;
  reporter_name?: string;
  reporter_avatar_url?: string | null;
  tags: string[];
  images: TaskImage[];
  comments?: TaskComment[];
  activity?: TaskActivity[];
  location?: TaskLocation;
  created_at: string;
  updated_at?: string;
  due_date?: string;
  /** Order within a board column (status lane); lower is higher on the board. */
  lane_position?: number;
}

/** Values collected in CreateTaskModal for POST /api/v1/tasks (parent maps to API body). */
export interface CreateTaskFormValues {
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  /** Backend `users.id`; empty string when unassigned. */
  assigneeUserId: string;
  tags: string[];
  /** Raw value from `<input type="date">` (YYYY-MM-DD) or empty. */
  dueDate: string;
  location?: TaskLocation;
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
  is_system: boolean;
  task_count: number;
  created_at: string;
  updated_at: string;
}
