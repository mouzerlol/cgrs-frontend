'use client';

import { forwardRef, useMemo, HTMLAttributes } from 'react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import type { Reply } from '@/types';
import CommentThread, { buildReplyTree } from './CommentThread';

interface ReplyListProps extends HTMLAttributes<HTMLDivElement> {
  replies: Reply[];
  onUpvote?: (replyId: string) => void;
  onReply?: (body: string, parentReplyId?: string) => void | Promise<void>;
  onDelete?: (replyId: string) => void;
  onEdit?: (replyId: string, body: string) => void | Promise<void>;
  upvotedReplies?: Set<string>;
  currentUserId?: string;
  /**
   * Fragment the composer lives at. When set, the count becomes a link to it —
   * the same jump the card's Reply button makes, on the one element that already
   * names the conversation. Left unset (embedded uses, a locked thread) the count
   * renders as plain text.
   */
  replyHref?: string;
  /**
   * Runs in place of the fragment jump: smooth scroll, then focus the composer,
   * which is what the card's Reply button does. The `href` stays on the element
   * regardless, so the jump still works before hydration.
   */
  onReplyClick?: () => void;
  /**
   * Head the section with the reply count. Off on a thread page, where the thread
   * toolbar states the count beside the vote and a second copy here only cost the
   * tree a row. On for embedded lists (event, petition), which have no toolbar.
   */
  showCount?: boolean;
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
    onDelete,
    onEdit,
    upvotedReplies = new Set(),
    currentUserId,
    replyHref,
    onReplyClick,
    showCount = true,
    className,
    ...props
  }, ref) => {
    // Build tree from flat list — memoized to avoid rebuilding on every render
    const tree = useMemo(() => buildReplyTree(replies), [replies]);

    const countLabel = `${replies.length} ${replies.length === 1 ? 'Reply' : 'Replies'}`;

    /* The plate's interior: icon on its bone tile, then the count. Shared by both
       renderings so the link and the plain heading are the same object. */
    const countContent = (
      <>
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-bone/10 text-bone sm:h-7 sm:w-7"
          aria-hidden="true"
        >
          <Icon icon="lucide:message-circle" className="w-4 h-4" />
        </span>
        {countLabel}
      </>
    );

    /* Padding lives on the inner element rather than the plate, so when the count
       is a link the whole plate is the target rather than the text inside it. */
    const countInner = 'inline-flex items-center gap-2 rounded-md py-1 pl-1 pr-3';

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
        {/* Reply count. The single home for this number — the thread toolbar used to
            carry a second copy. Forest surface with amber text and a bone icon plate,
            the palette the account civic footer uses. No rule beneath it: the count is
            already the first thing in the section, so a divider only adds furniture.

            With a composer to point at it is also the section's way in, so a reader
            who has just counted the replies can answer them without scrolling past
            every one. Same destination as the card's Reply button, said twice on
            purpose: the button is at the top of a thread that may run pages. */}
        {showCount && (
        <h2
          data-testid="reply-count-heading"
          className="inline-flex rounded-md bg-forest text-xs font-semibold text-amber"
        >
          {replyHref ? (
            <a
              href={replyHref}
              onClick={(event) => {
                if (!onReplyClick) return;
                event.preventDefault();
                onReplyClick();
              }}
              aria-label={`${countLabel} — jump to the reply box`}
              className={cn(
                countInner,
                'transition-colors duration-200 hover:bg-forest-light',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta',
              )}
            >
              {countContent}
            </a>
          ) : (
            <span className={countInner}>{countContent}</span>
          )}
        </h2>
        )}

        {/* Threaded Reply Tree */}
        <div className="space-y-1">
          {tree.map((rootNode, index) => (
            <CommentThread
              key={rootNode.reply.id}
              node={rootNode}
              depth={0}
              hasMoreSiblingsBelow={index < tree.length - 1}
              onUpvote={onUpvote}
              onReply={onReply}
              onDelete={onDelete}
              onEdit={onEdit}
              upvotedReplies={upvotedReplies}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      </div>
    );
  }
);

ReplyList.displayName = 'ReplyList';

export default ReplyList;
