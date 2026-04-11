'use client';

import { forwardRef, useState, type HTMLAttributes } from 'react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import type { Reply } from '@/types';
import UpvoteButton from './UpvoteButton';
import ReplyForm from './ReplyForm';
import { Tooltip } from '@/components/ui/Tooltip';

interface ReplyCardProps extends HTMLAttributes<HTMLDivElement> {
  reply: Reply;
  isUpvoted?: boolean;
  onUpvote?: () => void;
  onReply?: (body: string, parentReplyId?: string) => void | Promise<void>;
  onDelete?: () => void;
  onEdit?: (body: string) => void | Promise<void>;
  isSavingEdit?: boolean;
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

/** Compact reply row actions: faint outline, aligned with horizontal `UpvoteButton` size="sm". */
const replyToolbarBtn =
  'inline-flex items-center justify-center min-h-[26px] gap-1 px-1.5 py-0.5 rounded-md border border-forest/10 text-[11px] leading-tight text-forest/60 transition-colors hover:text-forest hover:border-forest/18 hover:bg-forest/[0.03]';

/** Author name chip: sage/20 fill matches border; -m-3 aligns to card corner. */
const replyAuthorBadgeClass =
  'relative z-10 -mt-3 -ml-3 inline-block font-semibold text-sm shrink-0 mr-8 rounded-tl-md rounded-br-sm border border-sage/20 bg-sage/20 px-2.5 py-1.5 text-black';

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
    onDelete,
    onEdit,
    isSavingEdit = false,
    showReplyForm = false,
    isAuthor = false,
    className,
    ...props
  }, ref) => {
    const [isReplying, setIsReplying] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

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

    const handleEditSubmit = async (body: string) => {
      if (!onEdit) return;
      try {
        await Promise.resolve(onEdit(body));
        setIsEditing(false);
      } catch {
        /* Parent rethrows on failure; keep form open */
      }
    };

    // Soft delete display
    if (reply.isDeleted) {
      return (
        <div
          ref={ref}
          className={cn(
            'min-w-0 flex-1 rounded-md border border-sage/20 bg-bone p-3 opacity-50',
            className
          )}
          {...props}
        >
          <div className="flex items-start gap-2">
            <span className="font-semibold text-forest/40 text-sm shrink-0 mr-8">
              [deleted]
            </span>
            <p className="text-forest/40 text-sm italic flex-1 min-w-0">
              This comment was deleted
            </p>
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          'min-w-0 flex-1 overflow-hidden rounded-md border border-sage/20 bg-bone p-3',
          className
        )}
        {...props}
      >
        {/* Name + body + time: min-w-0 / flex-wrap prevent overlap on narrow viewports */}
        <div className="flex min-w-0 flex-wrap items-start gap-x-3 gap-y-1">
          <div className="min-w-0 flex-1">
            {isEditing ? (
              <div className="flex min-w-0 items-start gap-2">
                <span className={replyAuthorBadgeClass}>{reply.author.displayName}</span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <ReplyForm
                    key={`${reply.id}-edit`}
                    initialValue={reply.body ?? ''}
                    onSubmit={handleEditSubmit}
                    onCancel={() => setIsEditing(false)}
                    placeholder="Edit your comment..."
                    submitLabel="Save"
                    isSubmitting={isSavingEdit}
                  />
                </div>
              </div>
            ) : (
              <div className="flex min-w-0 items-start gap-2">
                <span className={replyAuthorBadgeClass}>{reply.author.displayName}</span>
                <p className="min-w-0 flex-1 text-sm leading-relaxed text-forest/80 whitespace-pre-wrap break-words">
                  {reply.body}
                </p>
              </div>
            )}
          </div>

          <div className="ml-auto shrink-0 text-right sm:ml-0" aria-label="Comment meta">
            <span className="text-[11px] text-forest/40 whitespace-nowrap">
              {formatRelativeTime(reply.createdAt)}
              {reply.isEdited && (
                <span className="ml-2 inline-flex items-center gap-1">
                  <Icon icon="lucide:pencil" className="w-3 h-3" />
                  <span>Edited</span>
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center gap-1.5">
          <UpvoteButton
            count={reply.upvotes}
            isUpvoted={isUpvoted}
            onUpvote={onUpvote}
            size="sm"
            direction="horizontal"
          />

          <Tooltip content="Reply">
            <button
              type="button"
              onClick={() => setIsReplying(!isReplying)}
              className={replyToolbarBtn}
            >
              <Icon icon="lucide:reply" className="w-3 h-3 shrink-0" />
              <span>Reply</span>
            </button>
          </Tooltip>

          {isAuthor && (
            <div className="ml-auto flex items-center gap-1.5">
              <Tooltip content="Edit">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className={replyToolbarBtn}
                >
                  <Icon icon="lucide:pencil" className="w-3 h-3 shrink-0" />
                  <span>Edit</span>
                </button>
              </Tooltip>

              <Tooltip content="Delete">
                <button
                  type="button"
                  onClick={handleDelete}
                  className={cn(
                    replyToolbarBtn,
                    'hover:text-red-500 hover:border-red-400/30 hover:bg-red-500/[0.04]'
                  )}
                >
                  <Icon icon="lucide:trash-2" className="w-3 h-3 shrink-0" />
                  <span>Delete</span>
                </button>
              </Tooltip>
            </div>
          )}
        </div>

        {/* Reply Form */}
        {showReplyForm && isReplying && (
          <div className="mt-4">
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
