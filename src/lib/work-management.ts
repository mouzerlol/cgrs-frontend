import { TaskStatus, BoardColumn, TaskPriority, Task } from '@/types/work-management';

export const BOARD_COLUMNS: BoardColumn[] = [
  { id: 'backlog', title: 'Backlog' },
  { id: 'todo', title: 'To Do' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'review', title: 'Review' },
  { id: 'done', title: 'Done' },
];

export const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string }> = {
  urgent: { label: 'Urgent', color: '#DC2626' },
  high: { label: 'High', color: '#EA580C' },
  medium: { label: 'Medium', color: '#CA8A04' },
  low: { label: 'Low', color: '#16A34A' },
};

export function groupTasksByStatus(tasks: Task[]): Record<TaskStatus, Task[]> {
  const grouped: Record<TaskStatus, Task[]> = {
    backlog: [],
    todo: [],
    in_progress: [],
    review: [],
    done: [],
  };

  tasks.forEach((task) => {
    if (grouped[task.status]) {
      grouped[task.status].push(task);
    }
  });

  return grouped;
}

export function getTasksForColumn(tasks: Task[], status: TaskStatus): Task[] {
  return tasks.filter((task) => task.status === status);
}

export function generateTaskId(): string {
  return Math.random().toString(36).substring(2, 11);
}
