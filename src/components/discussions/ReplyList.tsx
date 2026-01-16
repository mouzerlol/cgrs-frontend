'use client';

import { forwardRef, HTMLAttributes } from 'react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import type { Reply } from '@/types';
import ReplyCard from './ReplyCard';

interface ReplyListProps extends HTMLAttributes<HTMLDivElement> {
  replies: Reply[];
  onUpvote?: (replyId: string) => void;
  onReply?: (body: string, parentReplyId?: string) => void;
  onReport?: (replyId: string) => void;
  upvotedReplies?: Set<string>;
  currentUserId?: string;
}

const isNestedReply = (reply: Reply): boolean => {
  return reply.depth === 1;
};

/**
 * Reply list component that groups nested replies with their parents.
 * Displays replies in threaded format (max 2 levels).
 */
const ReplyList = forwardRef<HTMLDivElement, ReplyListProps>(
  ({
    replies,
    onUpvote,
    onReply,
    onReport,
    upvotedReplies = new Set(),
    currentUserId,
    className,
    ...props
  }, ref) => {
    // Group replies: parent reply followed by its nested replies
    const groupedReplies: { parent: Reply; nested: Reply[] }[] = [];

    for (const reply of replies) {
      if (!isNestedReply(reply)) {
        // This is a parent-level reply
        const nested = replies.filter(
          (r) => r.parentReplyId === reply.id && isNestedReply(r)
        );
        groupedReplies.push({ parent: reply, nested });
      }
    }

    if (replies.length === 0) {
      return (
        <div ref={ref} className={cn('py-8 text-center', className)} {...props}>
          <Icon icon="lucide:message-square" className="w-12 h-12 mx-auto text-sage mb-3" />
          <p className="text-forest/50">No replies yet. Be the first to respond!</p>
        </div>
      );
    }

    return (
      <div ref={ref} className={cn('space-y-6', className)} {...props}>
        {/* Reply Count */}
        <div className="flex items-center gap-2 pb-4 border-b border-sage/30">
          <Icon icon="lucide:message-circle" className="w-5 h-5 text-forest/40" />
          <span className="text-sm font-semibold text-forest">
            {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
          </span>
        </div>

        {/* Reply Groups */}
        {groupedReplies.map(({ parent, nested }) => (
          <div key={parent.id} className="space-y-4">
            {/* Parent Reply */}
            <ReplyCard
              reply={parent}
              isUpvoted={upvotedReplies.has(parent.id)}
              onUpvote={onUpvote ? () => onUpvote(parent.id) : undefined}
              onReply={onReply}
              onReport={onReport ? () => onReport(parent.id) : undefined}
            />

            {/* Nested Replies */}
            {nested.length > 0 && (
              <div className="space-y-3">
                {nested.map((reply) => (
                  <ReplyCard
                    key={reply.id}
                    reply={reply}
                    isUpvoted={upvotedReplies.has(reply.id)}
                    onUpvote={onUpvote ? () => onUpvote(reply.id) : undefined}
                    onReply={onReply}
                    onReport={onReport ? () => onReport(reply.id) : undefined}
                    isNested
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }
);

ReplyList.displayName = 'ReplyList';

export default ReplyList;
