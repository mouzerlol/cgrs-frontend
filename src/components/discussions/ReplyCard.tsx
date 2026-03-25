'use client';

import { forwardRef, useState, type HTMLAttributes } from 'react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import type { Reply } from '@/types';
import UpvoteButton from './UpvoteButton';
import ReplyForm from './ReplyForm';
import ReportButton from './ReportButton';

interface ReplyCardProps extends HTMLAttributes<HTMLDivElement> {
  reply: Reply;
  isUpvoted?: boolean;
  onUpvote?: () => void;
  onReply?: (body: string, parentReplyId?: string) => void | Promise<void>;
  onReport?: () => void;
  onDelete?: () => void;
  showReplyForm?: boolean;
  isAuthor?: boolean;
}

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-NZ', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const formatRelativeTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateStr);
};

/**
 * Reply card displaying a single reply with author, content, and actions.
 * Supports soft delete display with placeholder text.
 */
const ReplyCard = forwardRef<HTMLDivElement, ReplyCardProps>(
  ({
    reply,
    isUpvoted = false,
    onUpvote,
    onReply,
    onReport,
    onDelete,
    showReplyForm = false,
    isAuthor = false,
    className,
    ...props
  }, ref) => {
    const [isReplying, setIsReplying] = useState(false);

    const handleSubmitReply = async (body: string) => {
      if (!onReply) return;
      try {
        await Promise.resolve(onReply(body, reply.id));
        setIsReplying(false);
      } catch {
        /* Parent rethrows on failure; keep nested form open */
      }
    };

    const handleDelete = () => {
      if (onDelete) {
        onDelete();
      }
    };

    // Soft delete display
    if (reply.isDeleted) {
      return (
        <div
          ref={ref}
          className={cn('min-w-0 flex-1 opacity-50', className)}
          {...props}
        >
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-forest/40 text-sm">
              [deleted]
            </span>
          </div>

          {/* Body - placeholder */}
          <div className="mt-1">
            <p className="text-forest/40 text-sm italic">
              This comment was deleted
            </p>
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn('min-w-0 flex-1', className)}
        {...props}
      >
        {/* Header */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-forest text-sm">
            {reply.author.displayName}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-terracotta/10 text-terracotta font-medium">
            {reply.author.title}
          </span>
          <span className="text-[11px] text-forest/40 ml-auto">
            {formatRelativeTime(reply.createdAt)}
          </span>
        </div>

        {/* Body */}
        <div className="mt-1">
          <p className="text-forest/80 text-sm leading-relaxed whitespace-pre-wrap">
            {reply.body}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-2">
          <UpvoteButton
            count={reply.upvotes}
            isUpvoted={isUpvoted}
            onUpvote={onUpvote}
            size="sm"
            direction="horizontal"
          />

          <button
            type="button"
            onClick={() => setIsReplying(!isReplying)}
            className="flex items-center gap-1.5 px-2 py-1 text-xs text-forest/60 hover:text-forest transition-colors rounded"
          >
            <Icon icon="lucide:reply" className="w-3.5 h-3.5" />
            <span>Reply</span>
          </button>

          <ReportButton
            onReport={onReport}
            className="text-xs text-forest/60 hover:text-terracotta"
          />

          {isAuthor && (
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-2 py-1 text-xs text-forest/60 hover:text-red-500 transition-colors rounded"
            >
              <Icon icon="lucide:trash-2" className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          )}
        </div>

        {/* Reply Form */}
        {showReplyForm && isReplying && (
          <div className="mt-3">
            <ReplyForm
              onSubmit={handleSubmitReply}
              onCancel={() => setIsReplying(false)}
              placeholder="Write a reply..."
              submitLabel="Reply"
            />
          </div>
        )}
      </div>
    );
  }
);

ReplyCard.displayName = 'ReplyCard';

export default ReplyCard;
