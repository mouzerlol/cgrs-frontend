'use client';

import { TaskStatus, Task } from '@/types/work-management';
import Button from '@/components/ui/Button';
import DraggableCard from './DraggableCard';
import DroppableColumn from './DroppableColumn';
import { motion, AnimatePresence } from 'framer-motion';

interface BoardColumnProps {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  onCreateTask: (status: TaskStatus) => void;
  onCardClick: (taskId: string) => void;
}

export default function BoardColumn({ status, title, tasks, onCreateTask, onCardClick }: BoardColumnProps) {
  return (
    <div className="bg-white/60 backdrop-blur-xl border border-white/20 shadow-sm rounded-dock w-[280px] min-w-[280px] flex flex-col max-h-full transition-shadow hover:shadow-md">
      <div className="p-3 flex items-center justify-between shrink-0 border-b border-sage/10">
        <h2 className="font-display text-[15px] font-semibold text-forest tracking-wide">{title}</h2>
        <span className="bg-forest/10 text-forest/90 text-[10px] px-2 py-0.5 rounded-full font-medium">
          {tasks.length}
        </span>
      </div>
      
      <DroppableColumn status={status}>
        <div className="overflow-y-auto flex-1 p-2 space-y-2 scrollbar-thin">
          <AnimatePresence>
            {tasks.map(task => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <DraggableCard task={task} onClick={onCardClick} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
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
