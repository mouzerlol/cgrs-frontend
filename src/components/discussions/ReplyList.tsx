'use client';

import { forwardRef, useMemo, HTMLAttributes } from 'react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import type { Reply } from '@/types';
import CommentThread, { buildReplyTree } from './CommentThread';

interface ReplyListProps extends HTMLAttributes<HTMLDivElement> {
  replies: Reply[];
  onUpvote?: (replyId: string) => void;
  onReply?: (body: string, parentReplyId?: string) => void;
  onReport?: (replyId: string) => void;
  upvotedReplies?: Set<string>;
  currentUserId?: string;
}

/**
 * Reply list component that displays replies in a Reddit-inspired tree structure.
 * Builds a tree from the flat reply list and renders recursive CommentThread nodes.
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
    // Build tree from flat list — memoized to avoid rebuilding on every render
    const tree = useMemo(() => buildReplyTree(replies), [replies]);

    if (replies.length === 0) {
      return (
        <div ref={ref} className={cn('py-8 text-center', className)} {...props}>
          <Icon icon="lucide:message-square" className="w-12 h-12 mx-auto text-sage mb-3" />
          <p className="text-forest/50">No replies yet. Be the first to respond!</p>
        </div>
      );
    }

    return (
      <div ref={ref} className={cn('space-y-4', className)} {...props}>
        {/* Reply Count */}
        <div className="flex items-center gap-2 pb-4 border-b border-sage/30">
          <Icon icon="lucide:message-circle" className="w-5 h-5 text-forest/40" />
          <span className="text-sm font-semibold text-forest">
            {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
          </span>
        </div>

        {/* Threaded Reply Tree */}
        <div className="space-y-4">
          {tree.map((rootNode) => (
            <CommentThread
              key={rootNode.reply.id}
              node={rootNode}
              depth={0}
              onUpvote={onUpvote}
              onReply={onReply}
              onReport={onReport}
              upvotedReplies={upvotedReplies}
            />
          ))}
        </div>
      </div>
    );
  }
);

ReplyList.displayName = 'ReplyList';

export default ReplyList;
