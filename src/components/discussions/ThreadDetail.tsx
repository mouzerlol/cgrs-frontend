'use client';

import { forwardRef, HTMLAttributes } from 'react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import type { Thread, Reply } from '@/types';
import ThreadHeader from './ThreadHeader';
import ThreadBody from './ThreadBody';
import ThreadActions from './ThreadActions';
import ReplyList from './ReplyList';
import ReplyForm from './ReplyForm';

interface ThreadDetailProps extends HTMLAttributes<HTMLDivElement> {
  thread: Thread;
  replies: Reply[];
  isUpvoted?: boolean;
  isBookmarked?: boolean;
  upvotedReplies?: Set<string>;
  onUpvote?: () => void;
  onBookmark?: () => void;
  onReply?: (body: string, parentReplyId?: string) => void;
  onReport?: () => void;
  onShare?: (platform: string) => void;
  isSubmittingReply?: boolean;
}

/**
 * Thread detail component - the main container for displaying a thread with its replies.
 * Combines ThreadHeader, ThreadBody, ThreadActions, and ReplyList.
 */
const ThreadDetail = forwardRef<HTMLDivElement, ThreadDetailProps>(
  ({
    thread,
    replies,
    isUpvoted = false,
    isBookmarked = false,
    upvotedReplies = new Set(),
    onUpvote,
    onBookmark,
    onReply,
    onReport,
    onShare,
    isSubmittingReply = false,
    className,
    ...props
  }, ref) => {
    return (
      <div ref={ref} className={cn('space-y-8', className)} {...props}>
        {/* Thread Content */}
        <article className="bg-white rounded-xl border border-sage/30 p-6 md:p-8 shadow-sm mt-6">
          {/* Header */}
          <ThreadHeader thread={thread} showBackLink={false} />

          {/* Body */}
          <div className="mt-6">
            <ThreadBody thread={thread} />
          </div>

          {/* Actions */}
          <div className="mt-8 pt-6 border-t border-sage/30">
            <ThreadActions
              thread={thread}
              isUpvoted={isUpvoted}
              isBookmarked={isBookmarked}
              onUpvote={onUpvote}
              onBookmark={onBookmark}
              onShare={onShare}
              onReport={onReport}
              replyCount={thread.replyCount}
            />
          </div>
        </article>

        {/* Replies Section */}
        <section>
          <ReplyList
            replies={replies}
            onUpvote={(replyId) => console.log('Upvote reply:', replyId)}
            onReply={onReply}
            onReport={(replyId) => console.log('Report reply:', replyId)}
            upvotedReplies={upvotedReplies}
          />
        </section>

        {/* Reply Form */}
        <section className="bg-bone rounded-xl border border-sage/30 p-6 md:p-8">
          <div className="flex items-center gap-2 mb-4">
            <Icon icon="lucide:reply" className="w-5 h-5 text-terracotta" />
            <h3 className="font-semibold text-forest">Post a Reply</h3>
          </div>
          <ReplyForm
            onSubmit={onReply || (() => {})}
            isSubmitting={isSubmittingReply}
            placeholder="Share your thoughts..."
          />
        </section>
      </div>
    );
  }
);

ThreadDetail.displayName = 'ThreadDetail';

export default ThreadDetail;
