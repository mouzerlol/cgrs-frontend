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
import ReportButton from './ReportButton';
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
  onReport?: () => void;
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

/** Matches ShareDropdown trigger: bordered 44×44 icon control. */
const threadActionIconButtonClass =
  'flex items-center justify-center rounded-lg border transition-all duration-200 bg-transparent text-forest/60 border-sage hover:bg-sage-light hover:text-forest hover:border-forest/20 min-w-[44px] min-h-[44px] p-2';

/**
 * Thread actions bar - upvote, bookmark, share, report.
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
    onReport,
    onDelete,
    onEdit,
    onReplyButtonClick,
    replyCount = 0,
    className,
    ...props
  }, ref) => {
    return (
      <div ref={ref} className={cn('flex items-center gap-2 flex-wrap', className)} {...props}>
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
            className="flex items-center gap-2 px-3 py-2 text-sm text-forest/60 hover:text-forest hover:bg-sage-light rounded-lg transition-colors min-h-[44px]"
          >
            <Icon icon="lucide:message-circle" className="w-5 h-5" />
            <span className="font-medium">{formatReplyCount(replyCount)}</span>
          </button>
        </Tooltip>

        {/* Bookmark Button */}
        <BookmarkButton
          isBookmarked={isBookmarked}
          onBookmark={onBookmark}
          size="md"
        />

        {/* Share Dropdown */}
        <ShareDropdown threadId={thread.id} threadTitle={thread.title} />

        {/* Edit Button (author only) */}
        {canEdit && onEdit && (
          <Tooltip content="Edit thread">
            <button
              type="button"
              onClick={onEdit}
              className={threadActionIconButtonClass}
              aria-label="Edit thread"
            >
              <Icon icon="lucide:pencil" className="w-5 h-5" />
            </button>
          </Tooltip>
        )}

        {/* More Options Menu (Report) */}
        <Menu as="div" className="relative">
          <Tooltip content="More">
            <Menu.Button className={threadActionIconButtonClass} aria-label="More options">
              <Icon icon="lucide:more-horizontal" className="w-5 h-5" />
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
                    <ReportButton
                      variant="menu"
                      menuLabel="Report thread"
                      onReport={onReport}
                      className={cn(
                        'w-full px-3 py-2 rounded-md',
                        active ? 'bg-sage-light text-forest' : 'text-forest/70'
                      )}
                    />
                  )}
                </Menu.Item>
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
      </div>
    );
  }
);

ThreadActions.displayName = 'ThreadActions';

export default ThreadActions;
