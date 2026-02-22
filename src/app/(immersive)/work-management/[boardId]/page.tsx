'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import BoardColumn from '@/components/work-management/BoardColumn';
import BoardDndContext from '@/components/work-management/BoardDndContext';
import TaskDetailModal from '@/components/work-management/TaskDetailModal';
import CreateTaskModal from '@/components/work-management/CreateTaskModal';
import FilterBar from '@/components/work-management/FilterBar';
import WorkManagementNavBar from '@/components/work-management/WorkManagementNavBar';
import { BOARD_COLUMNS, groupTasksByStatus } from '@/lib/work-management';
import { useBoardFilters } from '@/hooks/useBoardFilters';
import mockData from '@/data/work-management.json';
import boardsData from '@/data/boards.json';
import { Task, TaskStatus, Board } from '@/types/work-management';

const boards = boardsData.boards as Board[];

export default function BoardPage() {
  const params = useParams();
  const boardId = params.boardId as string;
  const board = boards.find(b => b.id === boardId);
  
  const [tasks, setTasks] = useState<Task[]>(mockData.tasks as Task[]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createColumnId, setCreateColumnId] = useState<TaskStatus | null>(null);

  const { filters, setFilter, clearFilters, filteredTasks, hasActiveFilters } = useBoardFilters(tasks);

  const handleCreateTask = (status: TaskStatus) => {
    setCreateColumnId(status);
    setIsCreateModalOpen(true);
  };

  const handleCardClick = (taskId: string) => {
    setSelectedTaskId(taskId);
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === updatedTask.id ? { ...updatedTask, updatedAt: new Date().toISOString() } : task
      )
    );
  };

  const handleTaskCreate = (newTask: Task) => {
    setTasks(prev => [...prev, newTask]);
  };

  const groupedTasks = groupTasksByStatus(filteredTasks);
  const selectedTask = selectedTaskId ? tasks.find(t => t.id === selectedTaskId) || null : null;
  const availableTags = Array.from(new Set(tasks.flatMap(t => t.tags))).sort();

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-gradient-to-br from-bone via-bone to-sage/20">
      <WorkManagementNavBar
        title={board?.name || 'Board'}
        showBackButton
        backHref="/work-management"
        actions={[
          {
            label: '+ New Task',
            onClick: () => handleCreateTask('todo'),
            variant: 'primary',
          },
        ]}
      >
        <FilterBar 
          filters={filters} 
          setFilter={setFilter} 
          clearFilters={clearFilters} 
          hasActiveFilters={hasActiveFilters}
          availableTags={availableTags}
        />
      </WorkManagementNavBar>
      
      <BoardDndContext tasks={tasks} setTasks={setTasks}>
        <div className="flex-1 overflow-x-auto overflow-y-hidden flex items-start gap-4 p-4 md:p-6 scrollbar-thin">
          {BOARD_COLUMNS.map(column => (
            <BoardColumn
              key={column.id}
              status={column.id}
              title={column.title}
              tasks={groupedTasks[column.id]}
              onCreateTask={handleCreateTask}
              onCardClick={handleCardClick}
            />
          ))}
        </div>
      </BoardDndContext>

      <TaskDetailModal 
        isOpen={!!selectedTaskId} 
        onClose={() => setSelectedTaskId(null)} 
        task={selectedTask}
        onUpdate={handleTaskUpdate}
      />

      <CreateTaskModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        defaultStatus={createColumnId}
        onSubmit={handleTaskCreate}
      />
    </div>
  );
}
