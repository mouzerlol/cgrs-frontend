import type { Task, TaskPriority, TaskStatus, BoardColumn } from '@/types';

export const BOARD_COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: 'backlog', title: 'Backlog' },
  { id: 'todo', title: 'To Do' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'review', title: 'Review' },
  { id: 'done', title: 'Done' },
];

export const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string }> = {
  urgent: { label: 'Urgent', color: '#DC2626' },
  high: { label: 'High', color: '#EA580C' },
  medium: { label: 'Medium', color: '#CA8A04' },
  low: { label: 'Low', color: '#16A34A' },
};

export const TAG_CONFIG: Record<string, { label: string; color: string }> = {
  maintenance: { label: 'Maintenance', color: '#6366F1' },
  landscaping: { label: 'Landscaping', color: '#10B981' },
  community: { label: 'Community', color: '#8B5CF6' },
  admin: { label: 'Admin', color: '#F59E0B' },
  safety: { label: 'Safety', color: '#EF4444' },
  infrastructure: { label: 'Infrastructure', color: '#64748B' },
  events: { label: 'Events', color: '#EC4899' },
  'urgent-repair': { label: 'Urgent Repair', color: '#DC2626' },
};

export function groupTasksByStatus(tasks: Task[]): Record<TaskStatus, Task[]> {
  const grouped: Record<TaskStatus, Task[]> = {
    'backlog': [],
    'todo': [],
    'in-progress': [],
    'review': [],
    'done': [],
  };

  for (const task of tasks) {
    if (grouped[task.status]) {
      grouped[task.status].push(task);
    }
  }

  return grouped;
}

export function getTasksForColumn(tasks: Task[], status: TaskStatus): Task[] {
  return tasks.filter((task) => task.status === status);
}

export function generateTaskId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `task-${timestamp}-${randomPart}`;
}

export function getColumnById(id: TaskStatus): { id: TaskStatus; title: string } | undefined {
  return BOARD_COLUMNS.find((col) => col.id === id);
}

export function getPriorityInfo(priority: TaskPriority): { label: string; color: string } {
  return PRIORITY_CONFIG[priority] || { label: priority, color: '#64748B' };
}

export function sortTasksByPriority(tasks: Task[]): Task[] {
  const priorityOrder: Record<TaskPriority, number> = {
    urgent: 0,
    high: 1,
    medium: 2,
    low: 3,
  };

  return [...tasks].sort((a, b) => {
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}
