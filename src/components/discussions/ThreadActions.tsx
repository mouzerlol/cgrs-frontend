'use client';

import { forwardRef, HTMLAttributes } from 'react';
import { Icon } from '@iconify/react';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { cn } from '@/lib/utils';
import type { Thread } from '@/types';
import UpvoteButton from './UpvoteButton';
import BookmarkButton from './BookmarkButton';
import ShareDropdown from './ShareDropdown';
import { Tooltip } from '@/components/ui/Tooltip';

interface ThreadActionsProps extends HTMLAttributes<HTMLDivElement> {
  thread: Thread;
  isUpvoted?: boolean;
  isBookmarked?: boolean;
  canDelete?: boolean;
  canEdit?: boolean;
  onUpvote?: () => void;
  onBookmark?: () => void;
  onShare?: (platform: string) => void;
  onDelete?: () => void;
  onEdit?: () => void;
  onReplyButtonClick?: () => void;
  replyCount?: number;
}

const formatReplyCount = (count: number): string => {
  if (count === 0) return 'No replies';
  if (count === 1) return '1 reply';
  return `${count} replies`;
};

/** Icon-only controls in the thread toolbar (aligned with compact upvote / reply count). */
const threadActionIconButtonClass =
  'flex items-center justify-center rounded-md border transition-all duration-200 bg-transparent text-forest/60 border-sage hover:bg-sage-light hover:text-forest hover:border-forest/20 min-w-[36px] min-h-[36px] p-1.5';

/**
 * Thread actions bar - upvote, bookmark, share, and optional delete (more menu).
 * Displays engagement metrics and action buttons.
 */
const ThreadActions = forwardRef<HTMLDivElement, ThreadActionsProps>(
  ({
    thread,
    isUpvoted = false,
    isBookmarked = false,
    canDelete = false,
    canEdit = false,
    onUpvote,
    onBookmark,
    onShare,
    onDelete,
    onEdit,
    onReplyButtonClick,
    replyCount = 0,
    className,
    ...props
  }, ref) => {
    const showOwnerActions = Boolean(
      (canEdit && onEdit) || (canDelete && onDelete),
    );

    return (
      <div
        ref={ref}
        className={cn(
          'flex w-full flex-wrap items-center gap-y-2 py-2',
          showOwnerActions ? 'gap-x-0' : 'gap-1.5',
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

          {/* Reply Count */}
          <Tooltip content="Jump to reply">
            <button
              type="button"
              onClick={onReplyButtonClick}
              className={cn(
                'flex items-center gap-1.5 px-2 py-1 min-h-[36px] rounded-md border border-sage',
                'text-xs text-forest/60 font-medium',
                'bg-transparent hover:bg-sage-light hover:text-forest hover:border-forest/20 transition-colors'
              )}
            >
              <Icon icon="lucide:message-circle" className="w-4 h-4 shrink-0" />
              <span>{formatReplyCount(replyCount)}</span>
            </button>
          </Tooltip>

          {/* Bookmark — extra left spacing from reply count cluster */}
          <BookmarkButton
            isBookmarked={isBookmarked}
            onBookmark={onBookmark}
            size="sm"
            className="pl-3"
          />

          {/* Share Dropdown */}
          <ShareDropdown threadId={thread.id} threadTitle={thread.title} size="sm" />
        </div>

        {showOwnerActions && (
          <div className="ml-auto flex shrink-0 items-center gap-1.5">
            {/* Edit Button (author only) */}
            {canEdit && onEdit && (
              <Tooltip content="Edit thread">
                <button
                  type="button"
                  onClick={onEdit}
                  className={threadActionIconButtonClass}
                  aria-label="Edit thread"
                >
                  <Icon icon="lucide:pencil" className="w-4 h-4" />
                </button>
              </Tooltip>
            )}

            {/* More menu: delete only when the author can delete (report hidden for now) */}
            {canDelete && onDelete && (
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
                  <Menu.Items className="absolute right-0 mt-2 w-48 bg-bone border border-sage/30 rounded-lg shadow-lg focus:outline-none z-10">
                    <div className="p-1">
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
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            )}
          </div>
        )}
      </div>
    );
  }
);

ThreadActions.displayName = 'ThreadActions';

export default ThreadActions;
