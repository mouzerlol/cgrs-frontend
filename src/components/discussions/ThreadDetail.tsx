'use client';

import { forwardRef, HTMLAttributes, useRef } from 'react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import type { Thread, Reply } from '@/types';
import ThreadHeader from './ThreadHeader';
import ThreadBody from './ThreadBody';
import ThreadActions from './ThreadActions';
import ReplyList from './ReplyList';
import ReplyForm, { type ReplyFormHandle } from './ReplyForm';

interface ThreadDetailProps extends HTMLAttributes<HTMLDivElement> {
  thread: Thread;
  replies: Reply[];
  isUpvoted?: boolean;
  isBookmarked?: boolean;
  upvotedReplies?: Set<string>;
  currentUserId?: string;
  canDeleteThread?: boolean;
  onUpvote?: () => void;
  onBookmark?: () => void;
  onReply?: (body: string, parentReplyId?: string) => void | Promise<void>;
  onReport?: () => void;
  onShare?: (platform: string) => void;
  onDeleteThread?: () => void;
  onDeleteReply?: (replyId: string) => void;
  onUpvoteReply?: (replyId: string) => void;
  onReportReply?: (replyId: string) => void;
  isSubmittingReply?: boolean;
  onPollVote?: (optionId: string) => void | Promise<void>;
  onPollClose?: () => void | Promise<void>;
  isPollVotePending?: boolean;
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
    currentUserId,
    canDeleteThread = false,
    onUpvote,
    onBookmark,
    onReply,
    onReport,
    onShare,
    onDeleteThread,
    onDeleteReply,
    onUpvoteReply,
    onReportReply,
    isSubmittingReply = false,
    onPollVote,
    onPollClose,
    isPollVotePending = false,
    className,
    ...props
  }, ref) => {
    const isLocked = Boolean((thread as Thread & { isLocked?: boolean }).isLocked);

    const replyFormRef = useRef<ReplyFormHandle>(null);
    const replyFormSectionRef = useRef<HTMLElement>(null);

    const handleReplyButtonClick = () => {
      replyFormSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      setTimeout(() => replyFormRef.current?.focus(), 300);
    };

    return (
      <div ref={ref} className={cn('space-y-8', className)} {...props}>
        {/* Thread Content */}
        <article className="bg-white rounded-xl border border-sage/30 p-6 md:p-8 shadow-sm mt-6">
          {/* Header */}
          <ThreadHeader thread={thread} showBackLink={false} />

          {/* Body */}
          <div className="mt-6">
            <ThreadBody
              thread={thread}
              currentUserId={currentUserId}
              onPollVote={onPollVote}
              onPollClose={onPollClose}
              isPollVotePending={isPollVotePending}
            />
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
              onDelete={onDeleteThread}
              canDelete={canDeleteThread}
              replyCount={thread.replyCount}
              onReplyButtonClick={handleReplyButtonClick}
            />
          </div>
        </article>

        {/* Replies Section */}
        <section>
          <ReplyList
            replies={replies}
            currentUserId={currentUserId}
            onUpvote={onUpvoteReply}
            onReply={onReply}
            onReport={onReportReply}
            onDelete={onDeleteReply}
            upvotedReplies={upvotedReplies}
          />
        </section>

        {/* Reply Form */}
        {!isLocked && (
          <section ref={replyFormSectionRef} className="bg-sage-light rounded-xl border border-sage/30 p-6 md:p-8">
            <div className="flex items-center gap-2 mb-4">
              <Icon icon="lucide:reply" className="w-5 h-5 text-terracotta" />
              <h3 className="font-semibold text-forest">Post a Reply</h3>
            </div>
            <ReplyForm
              ref={replyFormRef}
              onSubmit={onReply || (() => {})}
              isSubmitting={isSubmittingReply}
              placeholder="Share your thoughts..."
            />
          </section>
        )}

        {/* Locked Thread Notice */}
        {isLocked && (
          <section className="bg-sage/10 rounded-xl border border-sage/30 p-6 md:p-8 text-center">
            <Icon icon="lucide:lock" className="w-8 h-8 text-forest/50 mx-auto mb-2" />
            <p className="text-forest/60">
              This thread has been locked and no longer accepts replies.
            </p>
          </section>
        )}
      </div>
    );
  }
);

ThreadDetail.displayName = 'ThreadDetail';

export default ThreadDetail;
