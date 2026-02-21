import { Task, BoardMember } from '@/types/work-management';
import { PRIORITY_CONFIG } from '@/lib/work-management';
import { cn, formatRelativeDate } from '@/lib/utils';
import mockData from '@/data/work-management.json';
import { MessageSquare, AlignLeft } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onClick: (taskId: string) => void;
  className?: string;
}

const getTagColorClass = (tag: string) => {
  const hash = tag.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
  const colors = [
    'bg-terracotta/15 text-terracotta font-medium',
    'bg-sage/30 text-forest font-medium',
    'bg-forest/10 text-forest font-medium',
    'bg-sage-light text-forest/70 border border-sage/20'
  ];
  return colors[hash % colors.length];
};

export default function TaskCard({ task, onClick, className }: TaskCardProps) {
  const priorityConfig = PRIORITY_CONFIG[task.priority];
  const assignee = mockData.members.find((m: any) => m.id === task.assignee) as BoardMember | undefined;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(task.id);
    }
  };

  const visibleTags = task.tags.slice(0, 3);
  const hiddenTagsCount = task.tags.length - 3;
  const hasDescription = !!task.description;
  const commentsCount = task.comments?.length || 0;

  return (
    <button 
      type="button"
      className={cn(
        "w-full text-left bg-white rounded-card shadow-sm hover:shadow-card-hover hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 ease-out-custom cursor-pointer overflow-hidden flex flex-col border border-transparent focus-visible:ring-2 focus-visible:ring-forest focus-visible:outline-none",
        className
      )}
      style={{ borderTopColor: priorityConfig.color, borderTopWidth: '3px' }}
      onClick={() => onClick(task.id)}
      aria-label={`Task: ${task.title}`}
    >
      <div className="p-3 flex-1 flex flex-col gap-3 min-w-0 w-full">
        {task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-1">
            {visibleTags.map(tag => (
              <span key={tag} className={cn("text-[10px] px-2 py-0.5 rounded-sm whitespace-nowrap", getTagColorClass(tag))}>
                {tag}
              </span>
            ))}
            {hiddenTagsCount > 0 && (
              <span className="bg-sage-light text-forest/70 text-[10px] px-2 py-0.5 rounded-sm whitespace-nowrap">
                +{hiddenTagsCount}
              </span>
            )}
          </div>
        )}
        
        <h3 className="font-display text-sm font-medium text-forest leading-snug line-clamp-2">
          {task.title}
        </h3>
        
        <div className="flex items-center justify-between mt-auto pt-2 w-full">
          <div className="flex items-center gap-3 text-forest/50">
            {hasDescription && (
              <AlignLeft className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            {commentsCount > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
                <span className="text-[11px] font-medium">{commentsCount}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] text-forest/40 font-medium">
              {task.dueDate ? formatRelativeDate(task.dueDate) : formatRelativeDate(task.createdAt)}
            </span>
            {assignee && (
              <img 
                src={assignee.avatar} 
                alt={assignee.name}
                width={24}
                height={24}
                loading="lazy"
                className="w-6 h-6 rounded-full object-cover border-2 border-white shadow-sm"
                title={`Assigned to ${assignee.name}`}
              />
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
