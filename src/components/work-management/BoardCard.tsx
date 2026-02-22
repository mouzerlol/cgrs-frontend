'use client';

import Link from 'next/link';
import { Board, BoardColor } from '@/types/work-management';
import { cn } from '@/lib/utils';

const colorStyles: Record<BoardColor, { bg: string; border: string; hover: string; text: string }> = {
  sage: {
    bg: 'bg-sage-light',
    border: 'border-sage/30',
    hover: 'hover:shadow-[0_20px_40px_rgba(168,181,160,0.3)] hover:-translate-y-1',
    text: 'text-forest',
  },
  terracotta: {
    bg: 'bg-[#FBEBE6]',
    border: 'border-terracotta/30',
    hover: 'hover:shadow-[0_20px_40px_rgba(217,93,57,0.2)] hover:-translate-y-1',
    text: 'text-terracotta-dark',
  },
  forest: {
    bg: 'bg-forest-light/20',
    border: 'border-forest/30',
    hover: 'hover:shadow-[0_20px_40px_rgba(26,34,24,0.2)] hover:-translate-y-1',
    text: 'text-forest',
  },
  amber: {
    bg: 'bg-amber/10',
    border: 'border-amber/30',
    hover: 'hover:shadow-[0_20px_40px_rgba(212,160,90,0.2)] hover:-translate-y-1',
    text: 'text-amber-dark',
  },
};

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

interface BoardCardProps {
  board: Board;
}

export default function BoardCard({ board }: BoardCardProps) {
  const styles = colorStyles[board.color];

  return (
    <Link href={`/work-management/${board.id}`}>
      <div
        className={cn(
          'relative rounded-[20px] p-6 border transition-all duration-400 cursor-pointer group',
          styles.bg,
          styles.border,
          styles.hover,
          'hover:border-sage'
        )}
      >
        <div className="flex items-start justify-between mb-4">
          <span className="text-4xl">{board.icon}</span>
          <span
            className={cn(
              'px-3 py-1 rounded-full text-sm font-medium',
              styles.bg,
              styles.text
            )}
          >
            {board.taskCount} {board.taskCount === 1 ? 'task' : 'tasks'}
          </span>
        </div>

        <h3
          className={cn(
            'font-display text-xl font-semibold mb-2 transition-colors',
            styles.text,
            'group-hover:text-terracotta'
          )}
        >
          {board.name}
        </h3>

        <p className="text-forest/70 text-sm mb-4 line-clamp-2">
          {board.description}
        </p>

        <div className="flex items-center text-xs text-forest/50">
          <span>Updated {formatRelativeTime(board.updatedAt)}</span>
        </div>
      </div>
    </Link>
  );
}
