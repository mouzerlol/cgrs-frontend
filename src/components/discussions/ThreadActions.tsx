'use client';

import { forwardRef, HTMLAttributes } from 'react';
import { Icon } from '@iconify/react';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { cn } from '@/lib/utils';
import type { Thread } from '@/types';
import UpvoteButton from './UpvoteButton';
import Button from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';

interface ThreadActionsProps extends HTMLAttributes<HTMLDivElement> {
  thread: Thread;
  isUpvoted?: boolean;
  canDelete?: boolean;
  canEdit?: boolean;
  onUpvote?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  /** Scrolls to and focuses the reply composer. */
  onReplyButtonClick?: () => void;
  /**
   * Number of replies on the thread. When set, the toolbar states it beside the
   * vote — the two numbers a reader weighs a thread by, on one row. Left unset
   * (embedded uses) the toolbar carries votes only.
   */
  replyCount?: number;
  /**
   * Fragment the reply section lives at. When set, the count becomes a link to it,
   * so the count doubles as the way into the conversation.
   */
  replyCountHref?: string;
  /**
   * Runs in place of the fragment jump: smooth scroll to the replies. The `href`
   * stays on the element regardless, so the jump still works before hydration.
   */
  onReplyCountClick?: () => void;
}

/** Icon-only controls in the thread toolbar. 44px touch target on mobile, compact from sm+. */
const threadActionIconButtonClass =
  'flex items-center justify-center rounded-md border transition-all duration-200 bg-transparent text-forest/60 border-sage hover:bg-sage-light hover:text-forest hover:border-forest/20 min-w-[44px] min-h-[44px] sm:min-w-[36px] sm:min-h-[36px] p-1.5';

/**
 * Thread footer toolbar — conversation actions only: vote, the reply count, the
 * Reply primary, and an author-only overflow menu.
 *
 * The count sits beside the vote rather than heading the reply list: as a section
 * heading it cost a full row above the tree, and the two numbers belong together.
 *
 * Document actions (bookmark, share) deliberately live in {@link ThreadHeader}.
 */
const ThreadActions = forwardRef<HTMLDivElement, ThreadActionsProps>(
  ({
    thread,
    isUpvoted = false,
    canDelete = false,
    canEdit = false,
    onUpvote,
    onDelete,
    onEdit,
    onReplyButtonClick,
    replyCount,
    replyCountHref,
    onReplyCountClick,
    className,
    ...props
  }, ref) => {
    const showOwnerActions = Boolean(
      (canEdit && onEdit) || (canDelete && onDelete),
    );

    const countLabel =
      replyCount === undefined
        ? null
        : `${replyCount} ${replyCount === 1 ? 'Reply' : 'Replies'}`;

    /* Forest surface with amber text and a bone icon plate — the palette the reply
       count carried as a section heading, kept so the element is recognisable in
       its new home. Height matches the md horizontal UpvoteButton beside it. */
    const countClass =
      'inline-flex items-center gap-1.5 rounded-md bg-forest px-2.5 text-xs font-semibold text-amber min-h-[44px] sm:h-9 sm:min-h-[36px] sm:px-2';

    const countContent = (
      <>
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-bone/10 text-bone"
          aria-hidden="true"
        >
          <Icon icon="lucide:message-circle" className="w-4 h-4" />
        </span>
        {countLabel}
      </>
    );

    return (
      <div
        ref={ref}
        className={cn(
          'flex w-full flex-wrap items-center gap-x-1.5 gap-y-2 border-t border-sage/25 pt-3',
          className,
        )}
        {...props}
      >
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
          {/* Upvote Button */}
          <UpvoteButton
            count={thread.upvotes}
            isUpvoted={isUpvoted}
            onUpvote={onUpvote}
            size="md"
            direction="horizontal"
          />

          {/* Reply count — beside the vote, and the way into the reply tree. */}
          {countLabel !== null && (
            replyCountHref ? (
              <a
                data-testid="reply-count"
                href={replyCountHref}
                onClick={(event) => {
                  if (!onReplyCountClick) return;
                  event.preventDefault();
                  onReplyCountClick();
                }}
                aria-label={`${countLabel} — jump to the replies`}
                className={cn(
                  countClass,
                  'transition-colors duration-200 hover:bg-forest-light',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta',
                )}
              >
                {countContent}
              </a>
            ) : (
              <span data-testid="reply-count" className={countClass}>
                {countContent}
              </span>
            )
          )}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          {/* Primary action. The composer sits below every reply, so without this the
              only way to answer a long thread is to scroll the whole tree. */}
          {onReplyButtonClick && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={onReplyButtonClick}
              className="min-h-[44px] gap-2 sm:min-h-[36px]"
            >
              <Icon icon="lucide:reply" className="w-4 h-4" aria-hidden />
              <span>Reply</span>
            </Button>
          )}

          {/* Overflow: author-only edit and delete. */}
          {showOwnerActions && (
            <Menu as="div" className="relative">
              <Tooltip content="More">
                <Menu.Button className={threadActionIconButtonClass} aria-label="More options">
                  <Icon icon="lucide:more-horizontal" className="w-4 h-4" />
                </Menu.Button>
              </Tooltip>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 bottom-full mb-2 w-48 bg-bone border border-sage/30 rounded-lg shadow-lg focus:outline-none z-10">
                  <div className="p-1">
                    {canEdit && onEdit && (
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            type="button"
                            onClick={onEdit}
                            className={cn(
                              'w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md',
                              active ? 'bg-sage-light text-forest' : 'text-forest/70'
                            )}
                          >
                            <Icon icon="lucide:pencil" className="w-4 h-4" />
                            <span>Edit thread</span>
                          </button>
                        )}
                      </Menu.Item>
                    )}

                    {canDelete && onDelete && (
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            type="button"
                            onClick={onDelete}
                            className={cn(
                              'w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md',
                              active ? 'bg-sage-light text-red-600' : 'text-red-600'
                            )}
                          >
                            <Icon icon="lucide:trash-2" className="w-4 h-4" />
                            <span>Delete thread</span>
                          </button>
                        )}
                      </Menu.Item>
                    )}
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          )}
        </div>
      </div>
    );
  }
);

ThreadActions.displayName = 'ThreadActions';

export default ThreadActions;
