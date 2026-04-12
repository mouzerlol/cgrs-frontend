'use client';

import { forwardRef, HTMLAttributes, useCallback, useMemo } from 'react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import type { Poll, Thread } from '@/types';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useThreadAttachmentImages } from '@/hooks/useThreadAttachmentImages';
import ImageGallery from './ImageGallery';
import PollDisplay from './PollDisplay';

/** Collect option ids the current member has voted for, using server-side voter member IDs. */
function deriveMyPollOptionIds(poll: Poll | undefined, memberId: string | undefined): string[] {
  if (!poll || !memberId) return [];
  const ids: string[] = [];
  for (const opt of poll.options) {
    if (opt.voters.includes(memberId)) ids.push(opt.id);
  }
  return ids;
}

interface ThreadBodyProps extends HTMLAttributes<HTMLDivElement> {
  thread: Thread;
  /** Optional mapping of user IDs to display names for poll voter list */
  voterNames?: Record<string, string>;
  /** Current user ID for poll display */
  currentUserId?: string;
  /** Callback when user votes on poll */
  onPollVote?: (optionId: string) => void;
  /** Callback when creator closes poll */
  onPollClose?: () => void;
  /** Whether a vote mutation is currently in-flight */
  isPollVotePending?: boolean;
}

const formatLinks = (links?: { url: string; title?: string; isInternal: boolean }[]) => {
  if (!links || links.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-sage/30">
      <span className="text-sm font-semibold text-forest/60">Links</span>
      {links.map((link, index) => (
        <a
          key={index}
          href={link.url}
          target={link.isInternal ? '_self' : '_blank'}
          rel={link.isInternal ? undefined : 'noopener noreferrer'}
          className="inline-flex items-center gap-2 text-sm text-terracotta hover:underline break-all"
        >
          <Icon icon={link.isInternal ? 'lucide:link' : 'lucide:external-link'} className="w-4 h-4 flex-shrink-0" />
          {link.title || link.url}
        </a>
      ))}
    </div>
  );
};

const formatBody = (body?: string) => {
  if (!body) return null;

  return (
    <div className="prose prose-forest prose-sm max-w-none mb-6">
      {body.split('\n').map((paragraph, index) => (
        <p key={index} className="text-forest/80 leading-relaxed">
          {paragraph}
        </p>
      ))}
    </div>
  );
};

/**
 * Thread body content - displays images, main post text, poll, and links (in that order).
 * Used in the thread detail page.
 *
 * Enhanced with poll voting functionality and voter name display.
 * Poll voting optimistic updates are handled by the React Query mutation hook.
 */
const ThreadBody = forwardRef<HTMLDivElement, ThreadBodyProps>(
  (
    {
      thread,
      voterNames,
      currentUserId,
      onPollVote,
      onPollClose,
      isPollVotePending = false,
      className,
      ...props
    },
    ref,
  ) => {
    const { data: me } = useCurrentUser();
    const memberId = me?.membership?.id;

    const votedFor = useMemo(
      () => deriveMyPollOptionIds(thread.poll, memberId),
      [thread.poll, memberId],
    );
    const hasVoted = votedFor.length > 0;

    const handleVote = useCallback(
      (optionId: string) => {
        onPollVote?.(optionId);
      },
      [onPollVote],
    );

    const isCreator = Boolean(
      currentUserId &&
        thread.poll?.creatorClerkUserId &&
        currentUserId === thread.poll.creatorClerkUserId,
    );

    const effectiveVoterNames =
      voterNames || thread.poll?.voterDisplayNames || generateVoterNamesFromThread(thread);

    const hasApiAttachments = Boolean(thread.attachments?.length);
    const { images: attachmentGalleryImages, isLoading: attachmentUrlsLoading } =
      useThreadAttachmentImages(thread.attachments);

    return (
      <div ref={ref} className={cn('space-y-6', className)} {...props}>
        {/* R2-backed opening post images (ADR 005) — lead with media, then narrative */}
        {hasApiAttachments && (
          <>
            {attachmentUrlsLoading && (
              <div className="flex flex-wrap gap-2 animate-pulse" aria-hidden>
                <div className="h-32 w-32 rounded-xl bg-sage/25" />
                <div className="h-32 w-32 rounded-xl bg-sage/25" />
              </div>
            )}
            {!attachmentUrlsLoading && attachmentGalleryImages.length > 0 && (
              <ImageGallery images={attachmentGalleryImages} />
            )}
          </>
        )}

        {/* Legacy / static thread.images */}
        {!hasApiAttachments && thread.images && thread.images.length > 0 && (
          <ImageGallery images={thread.images} />
        )}

        {/* Main Body Text */}
        {thread.body && formatBody(thread.body)}

        {/* Poll */}
        {thread.poll && (
          <PollDisplay
            poll={thread.poll}
            hasVoted={hasVoted}
            votedFor={votedFor}
            voterNames={effectiveVoterNames}
            currentMemberId={memberId}
            isCreator={isCreator}
            onVote={handleVote}
            onClose={onPollClose}
            isPending={isPollVotePending}
          />
        )}

        {/* Links */}
        {formatLinks(thread.links)}
      </div>
    );
  }
);

/**
 * Generates a voter names map for demo purposes.
 * In production, this would come from an API/context.
 */
function generateVoterNamesFromThread(thread: Thread): Record<string, string> {
  const voterNames: Record<string, string> = {};

  // Add author
  if (thread.author) {
    voterNames[thread.author.id] = thread.author.displayName;
  }

  // Known demo users mapping (from discussions.json)
  const knownUsers: Record<string, string> = {
    'user-001': 'CGRSCommittee',
    'user-002': 'BlockAResident',
    'user-003': 'GreenGardener42',
    'user-004': 'NewNeighbor2026',
    'user-005': 'WatchfulResident',
    'user-006': 'MangereLocal',
  };

  // Merge known users
  Object.assign(voterNames, knownUsers);

  return voterNames;
}

ThreadBody.displayName = 'ThreadBody';

export default ThreadBody;
