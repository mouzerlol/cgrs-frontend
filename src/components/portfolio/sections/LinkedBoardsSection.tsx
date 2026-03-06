'use client';

import Link from 'next/link';
import { LayoutGrid, ArrowRight } from 'lucide-react';
import { Board } from '@/types/work-management';
import SectionWrapper from './SectionWrapper';

interface LinkedBoardsSectionProps {
  linkedBoardIds: string[];
  boards: Board[];
  portfolioTag: string;
  isEditingLayout: boolean;
}

export default function LinkedBoardsSection({ linkedBoardIds, boards, portfolioTag, isEditingLayout }: LinkedBoardsSectionProps) {
  const linkedBoards = boards.filter(b => linkedBoardIds.includes(b.id));

  return (
    <SectionWrapper title="Linked Boards" isEditingLayout={isEditingLayout}>
      {linkedBoards.length === 0 ? (
        <p className="text-xs text-forest/40 italic">No boards linked yet.</p>
      ) : (
        <div className="space-y-2">
          {linkedBoards.map((board) => (
            <Link
              key={board.id}
              href={`/work-management/boards/${board.id}?tag=${portfolioTag}`}
              className="flex items-center gap-3 p-2.5 rounded-xl bg-sage-light/30 hover:bg-sage-light/60 transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                <LayoutGrid className="w-4 h-4 text-forest/50" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-forest group-hover:text-terracotta transition-colors block truncate">
                  {board.name}
                </span>
                <span className="text-xs text-forest/40">{board.taskCount} tasks</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-forest/20 group-hover:text-terracotta transition-colors" />
            </Link>
          ))}
        </div>
      )}
    </SectionWrapper>
  );
}
