import { useState, useMemo } from 'react';
import { Task, TaskPriority } from '@/types/work-management';

export interface BoardFilters {
  assignees: string[];
  priorities: TaskPriority[];
  tags: string[];
}

export function useBoardFilters(tasks: Task[]) {
  const [filters, setFilters] = useState<BoardFilters>({
    assignees: [],
    priorities: [],
    tags: []
  });

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const assigneeMatch = filters.assignees.length === 0 || (task.assignee && filters.assignees.includes(task.assignee));
      const priorityMatch = filters.priorities.length === 0 || filters.priorities.includes(task.priority);
      const tagMatch = filters.tags.length === 0 || task.tags.some(tag => filters.tags.includes(tag));

      return assigneeMatch && priorityMatch && tagMatch;
    });
  }, [tasks, filters]);

  const setFilter = (category: keyof BoardFilters, values: string[]) => {
    setFilters(prev => ({ ...prev, [category]: values }));
  };

  const clearFilters = () => {
    setFilters({ assignees: [], priorities: [], tags: [] });
  };

  const hasActiveFilters = filters.assignees.length > 0 || filters.priorities.length > 0 || filters.tags.length > 0;

  return {
    filters,
    setFilter,
    clearFilters,
    filteredTasks,
    hasActiveFilters
  };
}
