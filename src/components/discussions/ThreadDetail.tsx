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
import BookmarkButton from './BookmarkButton';
import ShareDropdown from './ShareDropdown';
import ThreadBackdrop from './ThreadBackdrop';

interface ThreadDetailProps extends HTMLAttributes<HTMLDivElement> {
  thread: Thread;
  replies: Reply[];
  /**
   * Mount the thread card on the discussion photograph, full-bleed, with the replies
   * and composer below on bone. For the standalone thread page; embedded uses (e.g.
   * the event page) keep the plain flow layout.
   */
  mountOnBackdrop?: boolean;
  isUpvoted?: boolean;
  isBookmarked?: boolean;
  upvotedReplies?: Set<string>;
  currentUserId?: string;
  canDeleteThread?: boolean;
  canEditThread?: boolean;
  onUpvote?: () => void;
  onBookmark?: () => void;
  onReply?: (body: string, parentReplyId?: string) => void | Promise<void>;
  onShare?: (platform: string) => void;
  onDeleteThread?: () => void;
  onEditThread?: () => void;
  onDeleteReply?: (replyId: string) => void;
  onEditReply?: (replyId: string, body: string) => void | Promise<void>;
  onUpvoteReply?: (replyId: string) => void;
  isSubmittingReply?: boolean;
  onPollVote?: (optionId: string) => void | Promise<void>;
  onPollClose?: () => void | Promise<void>;
  isPollVotePending?: boolean;
}

/**
 * The composer's fragment. Everything that sends a reader to the reply box — the
 * card's Reply button, the reply count above the tree — points here, so the jump
 * survives a page without JavaScript and can be linked to from off the page.
 */
const REPLY_FORM_ID = 'reply-form';

/** The reply tree's fragment — where the toolbar's reply count sends a reader. */
const REPLIES_ID = 'replies';

/**
 * Thread detail component - the main container for displaying a thread with its replies.
 * Combines ThreadHeader, ThreadBody, ThreadActions, and ReplyList.
 */
const ThreadDetail = forwardRef<HTMLDivElement, ThreadDetailProps>(
  ({
    thread,
    replies,
    mountOnBackdrop = false,
    isUpvoted = false,
    isBookmarked = false,
    upvotedReplies = new Set(),
    currentUserId,
    canDeleteThread = false,
    canEditThread = false,
    onUpvote,
    onBookmark,
    onReply,
    onShare,
    onDeleteThread,
    onEditThread,
    onDeleteReply,
    onEditReply,
    onUpvoteReply,
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
    const repliesSectionRef = useRef<HTMLElement>(null);

    const handleReplyButtonClick = () => {
      replyFormSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      setTimeout(() => replyFormRef.current?.focus(), 300);
    };

    const handleReplyCountClick = () => {
      repliesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    /* Document actions: present only when the host page wired the handlers. */
    const documentActions = (onBookmark || onShare) ? (
      <>
        {onBookmark && (
          <BookmarkButton isBookmarked={isBookmarked} onBookmark={onBookmark} size="sm" />
        )}
        {onShare && (
          <ShareDropdown
            threadId={thread.id}
            threadTitle={thread.title}
            onShare={onShare}
            size="sm"
          />
        )}
      </>
    ) : null;

    /* Square corners: the thread card reads as a document, not a community tile.
       It sits on the photograph, so it carries a soft lift rather than the
       hairline shadow it used when it sat on flat bone. */
    const threadCard = (
      <article className="bg-white rounded-none border border-sage/30 px-5 pt-6 pb-4 shadow-[0_16px_40px_rgba(26,34,24,0.14)] sm:px-8 sm:pt-8 md:px-10 md:pt-10 md:pb-5">
        {/* Header. Owns the gutter itself from sm: the category plate is the left column
            and carries the rule on its right edge, so the rule exists only where it
            divides the emblem from the title. The byline picks up the same indent. */}
        <ThreadHeader thread={thread} showBackLink={false} documentActions={documentActions} />

        {/* Body — indented to the gutter so the prose starts on the title's edge. */}
        <div data-testid="thread-body-row" className="mt-6 sm:pl-[calc(8rem_+_1.25rem)]">
          <ThreadBody
            thread={thread}
            currentUserId={currentUserId}
            onPollVote={onPollVote}
            onPollClose={onPollClose}
            isPollVotePending={isPollVotePending}
          />
        </div>

        {/* Actions — deliberately outside the gutter. The toolbar closes the card, so its
            rule runs the full interior width and the vote sits on the card's own edge. */}
        <div data-testid="thread-actions-row" className="mt-4 md:mt-5">
          <ThreadActions
            thread={thread}
            isUpvoted={isUpvoted}
            onUpvote={onUpvote}
            onDelete={onDeleteThread}
            canDelete={canDeleteThread}
            canEdit={canEditThread}
            onEdit={onEditThread}
            onReplyButtonClick={isLocked ? undefined : handleReplyButtonClick}
            replyCount={replies.length}
            replyCountHref={replies.length > 0 ? `#${REPLIES_ID}` : undefined}
            onReplyCountClick={replies.length > 0 ? handleReplyCountClick : undefined}
          />
        </div>
      </article>
    );

    return (
      <div ref={ref} className={cn(!mountOnBackdrop && 'space-y-8', className)} {...props}>
        {mountOnBackdrop ? <ThreadBackdrop>{threadCard}</ThreadBackdrop> : threadCard}

        <div
          className={cn(
            'space-y-8',
            mountOnBackdrop && 'container mx-auto max-w-4xl px-4 py-8',
          )}
        >
        {/* Replies Section */}
        <section ref={repliesSectionRef} id={REPLIES_ID} className="scroll-mt-24">
          <ReplyList
            replies={replies}
            showCount={false}
            replyHref={isLocked ? undefined : `#${REPLY_FORM_ID}`}
            onReplyClick={isLocked ? undefined : handleReplyButtonClick}
            currentUserId={currentUserId}
            onUpvote={onUpvoteReply}
            onReply={onReply}
            onDelete={onDeleteReply}
            onEdit={onEditReply}
            upvotedReplies={upvotedReplies}
          />
        </section>

        {/* Reply Form */}
        {!isLocked && (
          <section
            ref={replyFormSectionRef}
            id={REPLY_FORM_ID}
            className="scroll-mt-24 bg-sage-light rounded-card border border-sage/30 p-6 md:p-8"
          >
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
          <section className="bg-sage/10 rounded-card border border-sage/30 p-6 md:p-8 text-center">
            <Icon icon="lucide:lock" className="w-8 h-8 text-forest/50 mx-auto mb-2" />
            <p className="text-forest/60">
              This thread has been locked and no longer accepts replies.
            </p>
          </section>
        )}
        </div>
      </div>
    );
  }
);

ThreadDetail.displayName = 'ThreadDetail';

export default ThreadDetail;
