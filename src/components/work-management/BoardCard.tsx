'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { Globe, Trash2, Wrench } from 'lucide-react';
import { Board, BoardColor } from '@/types/work-management';
import { cn } from '@/lib/utils';

/** Maps API/board icon keys (short strings) to Lucide components; emoji and other values render as text. */
const BOARD_ICON_BY_KEY: Record<string, LucideIcon> = {
  globe: Globe,
  wrench: Wrench,
};

function BoardIcon({ icon, className }: { icon: string; className?: string }) {
  const key = icon.trim().toLowerCase();
  const Icon = BOARD_ICON_BY_KEY[key];
  if (Icon) {
    return <Icon className={cn('size-9 shrink-0', className)} strokeWidth={1.5} aria-hidden />;
  }
  return (
    <span className={cn('text-4xl leading-none shrink-0', className)} aria-hidden>
      {icon}
    </span>
  );
}

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
  onDelete?: (boardId: string) => void;
  isDeleting?: boolean;
}

export default function BoardCard({ board, onDelete, isDeleting }: BoardCardProps) {
  const styles = colorStyles[board.color];
  const deleteBoard = !board.is_system ? onDelete : undefined;
  const showDelete = deleteBoard != null;

  return (
    <div
      className={cn(
        'relative rounded-[20px] p-6 border transition-all duration-400 cursor-pointer group',
        styles.bg,
        styles.border,
        styles.hover,
        'hover:border-sage'
      )}
    >
      <Link href={`/work-management/boards/${board.id}`} className="block">
        <div className="flex items-start justify-between gap-3 mb-4">
          <BoardIcon icon={board.icon} className={styles.text} />
          <span
            className={cn(
              'px-3 py-1 rounded-full text-sm font-medium shrink-0',
              styles.bg,
              styles.text,
              showDelete && 'mr-11'
            )}
          >
            {board.task_count} {board.task_count === 1 ? 'task' : 'tasks'}
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
          <span>Updated {formatRelativeTime(board.updated_at)}</span>
        </div>
      </Link>

      {showDelete && deleteBoard && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            deleteBoard(board.id);
          }}
          disabled={isDeleting}
          className={cn(
            'absolute top-2 right-2 p-2 rounded-lg text-forest/40 hover:text-red-600 hover:bg-red-50 transition-all z-10',
            isDeleting && 'opacity-50 cursor-not-allowed'
          )}
          title="Delete board"
        >
          <Trash2 className="size-4" strokeWidth={2} aria-hidden />
        </button>
      )}
    </div>
  );
}
