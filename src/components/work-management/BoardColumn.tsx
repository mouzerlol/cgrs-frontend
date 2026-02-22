'use client';

import { TaskStatus, Task } from '@/types/work-management';
import Button from '@/components/ui/Button';
import DraggableCard from './DraggableCard';
import DroppableColumn from './DroppableColumn';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useMemo } from 'react';

interface BoardColumnProps {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  onCreateTask: (status: TaskStatus) => void;
  onCardClick: (taskId: string) => void;
}

export default function BoardColumn({ status, title, tasks, onCreateTask, onCardClick }: BoardColumnProps) {
  const taskIds = useMemo(() => tasks.map((task) => task.id), [tasks]);

  return (
    <div className="bg-sage-lite/60 backdrop-blur-xl border border-sage/30 shadow-sm rounded-[10px] w-[280px] min-w-[280px] flex flex-col max-h-full transition-shadow hover:shadow-md">
      <div className="p-3 flex items-center justify-between shrink-0 border-b border-sage/10">
        <h2 className="font-display text-[15px] font-semibold text-forest tracking-wide">{title}</h2>
        <span className="bg-forest/10 text-forest/90 text-[10px] px-2 py-0.5 rounded-full font-medium">
          {tasks.length}
        </span>
      </div>
      
      <DroppableColumn status={status}>
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <div className="overflow-y-auto flex-1 p-2 space-y-2 scrollbar-thin min-h-[2px]">
            {tasks.map(task => (
              <DraggableCard key={task.id} task={task} onClick={onCardClick} />
            ))}
          </div>
        </SortableContext>
      </DroppableColumn>

      <div className="p-2 shrink-0 border-t border-sage/10">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-forest/60 hover:text-forest text-sm bg-transparent border-transparent hover:bg-forest/5 font-medium transition-colors"
          onClick={() => onCreateTask(status)}
        >
          + Add a card
        </Button>
      </div>
    </div>
  );
}
