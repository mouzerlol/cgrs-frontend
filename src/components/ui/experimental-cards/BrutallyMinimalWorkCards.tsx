import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { isNonOptimizableImageSrc } from '@/lib/image';
import { LucideIcon, Trash2, Link as LinkIcon, MessageSquare, AlignLeft, MoreHorizontal, Pencil } from 'lucide-react';
import { Icon } from '@iconify/react';
import { cn, formatRelativeDate } from '@/lib/utils';
import { Portfolio } from '@/types/portfolio';
import { Board, Task } from '@/types/work-management';
import { PRIORITY_CONFIG } from '@/lib/work-management';

const lucideIconMap: Record<string, string> = {
  wallet: 'lucide:wallet',
  wrench: 'lucide:wrench',
  trees: 'lucide:trees',
  shield: 'lucide:shield',
  'party-popper': 'lucide:party-popper',
  megaphone: 'lucide:megaphone',
  settings: 'lucide:settings',
};

// ----------------------------------------------------------------------
// Hub Card (Portfolios, Boards, Decisions)
// ----------------------------------------------------------------------
interface BrutallyMinimalHubCardProps {
  name: string;
  description: string;
  icon: LucideIcon;
  href: string;
  /** When omitted, the count badge is hidden (e.g. hub links without a static tally). */
  count?: number;
  countLabel?: string;
}

export function BrutallyMinimalHubCard({ name, description, icon: IconComponent, href, count, countLabel }: BrutallyMinimalHubCardProps) {
  const showCountBadge = count != null && countLabel != null;

  return (
    <Link href={href} className="block group">
      <div className="relative bg-sage-light border border-black rounded-none p-6 transition-all duration-200 hover:bg-black hover:text-sage-light min-h-[220px] flex flex-col">
        <div className="flex items-start justify-between mb-auto">
          <div className="w-12 h-12 border border-black group-hover:border-sage-light bg-sage-light group-hover:bg-black text-black group-hover:text-sage-light flex items-center justify-center transition-colors">
            <IconComponent className="w-6 h-6" strokeWidth={2.5} />
          </div>
          {showCountBadge ? (
            <div className="border border-black group-hover:border-sage-light px-2 py-1 bg-black group-hover:bg-sage-light text-sage-light group-hover:text-black font-mono text-xs font-bold uppercase transition-colors">
              {count} {countLabel}
            </div>
          ) : null}
        </div>
        <div className="mt-6">
          <h3 className="font-sans font-extrabold uppercase tracking-tight text-xl mb-2">
            {name}
          </h3>
          <p className="font-mono text-sm leading-snug">
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
}

// ----------------------------------------------------------------------
// Portfolio Card
// ----------------------------------------------------------------------
interface BrutallyMinimalPortfolioCardProps {
  portfolio: Portfolio;
  onDelete?: (id: string) => void;
}

export function BrutallyMinimalPortfolioCard({ portfolio, onDelete }: BrutallyMinimalPortfolioCardProps) {
  const iconName = lucideIconMap[portfolio.icon] || 'lucide:folder';

  return (
    <div className="relative group">
      <Link href={`/work-management/portfolios/${portfolio.id}`} className="block">
        <div className="relative bg-sage-light border border-black rounded-none p-5 transition-all duration-200 hover:bg-black hover:text-sage-light flex flex-col h-full">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 border border-black group-hover:border-sage-light flex items-center justify-center bg-sage-light group-hover:bg-black text-black group-hover:text-sage-light transition-colors">
              <Icon icon={iconName} className="w-5 h-5" />
            </div>
            {portfolio.linkedBoardIds.length > 0 && (
              <div className="border border-black group-hover:border-sage-light px-2 py-1 font-mono text-xs font-bold uppercase flex items-center gap-1">
                <LinkIcon className="w-3 h-3" />
                {portfolio.linkedBoardIds.length}
              </div>
            )}
          </div>

          <h3 className="font-sans font-extrabold uppercase tracking-tight text-lg mb-2">
            {portfolio.name}
          </h3>

          <p className="font-mono text-xs leading-relaxed mb-6 line-clamp-2">
            {portfolio.description}
          </p>

          <div className="mt-auto border-t-[3px] border-black group-hover:border-sage-light pt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 border border-black group-hover:border-sage-light flex items-center justify-center font-bold text-xs uppercase bg-sage-light group-hover:bg-black text-black group-hover:text-sage-light transition-colors overflow-hidden">
                {portfolio.lead.avatar ? (
                  <Image
                    src={portfolio.lead.avatar}
                    alt={portfolio.lead.name}
                    width={32}
                    height={32}
                    unoptimized={isNonOptimizableImageSrc(portfolio.lead.avatar)}
                    className="w-full h-full object-cover grayscale"
                  />
                ) : (
                  portfolio.lead.name.split(' ').map(n => n[0]).join('')
                )}
              </div>
              <span className="font-mono text-xs uppercase font-bold">
                LEAD: {portfolio.lead.name.split(' ')[0]}
              </span>
            </div>
          </div>
        </div>
      </Link>
      
      <div className="absolute bottom-5 right-5 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
         <button className="w-8 h-8 border border-sage-light bg-black text-sage-light flex items-center justify-center hover:bg-sage-light hover:text-black hover:border-black transition-colors">
           <MoreHorizontal className="w-4 h-4" />
         </button>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Board Card
// ----------------------------------------------------------------------
interface BrutallyMinimalBoardCardProps {
  board: Board;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
}

export function BrutallyMinimalBoardCard({ board, onDelete, isDeleting }: BrutallyMinimalBoardCardProps) {
  const showDelete = !board.is_system && onDelete;

  return (
    <div className="relative group">
      <Link href={`/work-management/boards/${board.id}`} className="block">
        <div className="relative bg-sage-light border border-black rounded-none p-5 transition-all duration-200 hover:bg-black hover:text-sage-light flex flex-col h-full min-h-[200px]">
          <div className="flex items-start justify-between mb-4">
            <div className="text-3xl font-black font-sans uppercase">
              {board.icon.length === 1 ? board.icon : board.icon.substring(0, 2)}
            </div>
            <div className="border border-black group-hover:border-sage-light bg-black group-hover:bg-sage-light text-sage-light group-hover:text-black px-2 py-1 font-mono text-xs font-bold uppercase transition-colors">
              {board.task_count} TASKS
            </div>
          </div>

          <h3 className="font-sans font-extrabold uppercase tracking-tight text-xl mb-2">
            {board.name}
          </h3>

          <p className="font-mono text-xs leading-relaxed mb-4 line-clamp-2">
            {board.description}
          </p>

          <div className="mt-auto flex justify-end">
            <span className="font-mono text-[10px] font-bold uppercase border-b-[2px] border-black group-hover:border-sage-light pb-0.5">
              UPDATED {new Date(board.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>
      </Link>

      {showDelete && onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(board.id);
          }}
          disabled={isDeleting}
          className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 w-10 h-10 border border-black bg-sage-light text-black hover:bg-black hover:text-sage-light flex items-center justify-center transition-colors z-10 opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="w-4 h-4" strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// Task Card
// ----------------------------------------------------------------------
interface BrutallyMinimalTaskCardProps {
  task: Task;
  onClick: (id: string) => void;
  assigneeName?: string;
  assigneeAvatar?: string;
  className?: string;
}

export function BrutallyMinimalTaskCard({ task, onClick, assigneeName, assigneeAvatar, className }: BrutallyMinimalTaskCardProps) {
  const priorityConfig = PRIORITY_CONFIG[task.priority];
  const commentsCount = task.comments?.length || 0;
  const hasDescription = !!task.description;
  const hasAssignee = Boolean(task.assignee);

  return (
    <button
      type="button"
      onClick={() => onClick(task.id)}
      className={cn("w-full text-left bg-sage-light border border-black rounded-none p-4 transition-all duration-200 hover:bg-black hover:text-sage-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black group", className)}
    >
      <div className="flex justify-between items-start gap-3 mb-3">
        <h4 className="font-sans font-extrabold uppercase tracking-tight text-sm leading-tight">
          {task.title}
        </h4>
        <div className="border border-black group-hover:border-sage-light px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase whitespace-nowrap bg-sage-light text-black transition-colors" title={priorityConfig.label}>
          {task.priority}
        </div>
      </div>

      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {task.tags.slice(0, 3).map(tag => (
            <span key={tag} className="border border-black group-hover:border-sage-light px-1 py-0.5 text-[9px] font-mono font-bold uppercase transition-colors">
              {tag}
            </span>
          ))}
          {task.tags.length > 3 && (
            <span className="border border-black group-hover:border-sage-light bg-black text-sage-light group-hover:bg-sage-light group-hover:text-black px-1 py-0.5 text-[9px] font-mono font-bold uppercase transition-colors">
              +{task.tags.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mt-4 pt-3 border-t-[2px] border-black group-hover:border-sage-light border-dashed transition-colors">
        <div className="flex items-center gap-3">
          {hasAssignee && (
            <div className="w-6 h-6 border border-black group-hover:border-sage-light flex items-center justify-center font-bold text-[10px] uppercase bg-sage-light group-hover:bg-black text-black group-hover:text-sage-light transition-colors overflow-hidden">
              {assigneeAvatar ? (
                <Image
                  src={assigneeAvatar}
                  alt={assigneeName || 'Assignee'}
                  width={24}
                  height={24}
                  unoptimized={isNonOptimizableImageSrc(assigneeAvatar)}
                  className="w-full h-full object-cover grayscale"
                />
              ) : (
                (assigneeName || 'A').charAt(0)
              )}
            </div>
          )}
          <div className="flex items-center gap-2">
            {hasDescription && (
              <AlignLeft className="w-3.5 h-3.5" strokeWidth={2.5} />
            )}
            {commentsCount > 0 && (
              <div className="flex items-center gap-1 font-mono text-xs font-bold">
                <MessageSquare className="w-3.5 h-3.5" strokeWidth={2.5} />
                <span>{commentsCount}</span>
              </div>
            )}
          </div>
        </div>

        <span className="font-mono text-[9px] font-bold uppercase">
          {formatRelativeDate(task.created_at)}
        </span>
      </div>
    </button>
  );
}
