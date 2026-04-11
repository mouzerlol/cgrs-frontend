import { Task } from '@/types/work-management';
import TaskCard from './TaskCard';

interface DragOverlayCardProps {
  task: Task;
}

export default function DragOverlayCard({ task }: DragOverlayCardProps) {
  return (
    <div className="shadow-[0_20px_40px_rgba(26,34,24,0.18)] pointer-events-none opacity-95 scale-[1.02] transition-transform duration-200">
      <TaskCard task={task} onClick={() => {}} />
    </div>
  );
}
