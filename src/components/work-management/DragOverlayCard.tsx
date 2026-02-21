import { Task } from '@/types/work-management';
import TaskCard from './TaskCard';

interface DragOverlayCardProps {
  task: Task;
}

export default function DragOverlayCard({ task }: DragOverlayCardProps) {
  return (
    <div className="shadow-2xl shadow-forest/20 pointer-events-none opacity-90 rounded-card">
      <TaskCard task={task} onClick={() => {}} />
    </div>
  );
}
