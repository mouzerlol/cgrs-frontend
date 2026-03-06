'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Board, Task } from '@/types/work-management';
import SectionWrapper from './SectionWrapper';

interface WorkInFlightSectionProps {
  linkedBoardIds: string[];
  boards: Board[];
  tasks: Task[];
  portfolioTag: string;
  isEditingLayout: boolean;
}

function StatusBadge({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className={`flex flex-col items-center px-3 py-2 rounded-xl ${color}`}>
      <span className="text-lg font-display font-semibold text-forest">{count}</span>
      <span className="text-[10px] text-forest/60 uppercase tracking-wide font-medium">{label}</span>
    </div>
  );
}

export default function WorkInFlightSection({ linkedBoardIds, boards, tasks, portfolioTag, isEditingLayout }: WorkInFlightSectionProps) {
  const linkedBoards = boards.filter(b => linkedBoardIds.includes(b.id));

  // Filter tasks by portfolio tag
  const taggedTasks = tasks.filter(t => t.tags.includes(portfolioTag));

  const statusCounts = {
    todo: taggedTasks.filter(t => t.status === 'todo').length,
    in_progress: taggedTasks.filter(t => t.status === 'in_progress').length,
    review: taggedTasks.filter(t => t.status === 'review').length,
    done: taggedTasks.filter(t => t.status === 'done').length,
    backlog: taggedTasks.filter(t => t.status === 'backlog').length,
  };

  const totalActive = statusCounts.todo + statusCounts.in_progress + statusCounts.review;

  return (
    <SectionWrapper title="Work in Flight" isEditingLayout={isEditingLayout}>
      {linkedBoards.length === 0 ? (
        <p className="text-xs text-forest/40 italic">Link boards to see work in flight.</p>
      ) : (
        <div className="space-y-4">
          {/* Summary stats */}
          <div className="flex items-center gap-2">
            <StatusBadge label="Backlog" count={statusCounts.backlog} color="bg-sage-light/50" />
            <StatusBadge label="To Do" count={statusCounts.todo} color="bg-blue-50" />
            <StatusBadge label="In Progress" count={statusCounts.in_progress} color="bg-amber/10" />
            <StatusBadge label="Review" count={statusCounts.review} color="bg-purple-50" />
            <StatusBadge label="Done" count={statusCounts.done} color="bg-green-50" />
          </div>

          {totalActive > 0 && (
            <p className="text-xs text-forest/50">
              {totalActive} active {totalActive === 1 ? 'task' : 'tasks'} across {linkedBoards.length} {linkedBoards.length === 1 ? 'board' : 'boards'}
            </p>
          )}

          {/* Board links */}
          <div className="flex flex-wrap gap-2">
            {linkedBoards.map((board) => (
              <Link
                key={board.id}
                href={`/work-management/boards/${board.id}?tag=${portfolioTag}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sage-light/30 hover:bg-sage-light/60 text-xs font-medium text-forest hover:text-terracotta transition-colors"
              >
                {board.name}
                <ArrowRight className="w-3 h-3" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </SectionWrapper>
  );
}
