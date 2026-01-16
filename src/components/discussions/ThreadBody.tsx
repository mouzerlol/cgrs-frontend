'use client';

import { forwardRef, HTMLAttributes, useState, useCallback } from 'react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import type { Thread } from '@/types';
import ImageGallery from './ImageGallery';
import PollDisplay from './PollDisplay';

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
    <div className="prose prose-forest prose-sm max-w-none">
      {body.split('\n').map((paragraph, index) => (
        <p key={index} className="text-forest/80 leading-relaxed">
          {paragraph}
        </p>
      ))}
    </div>
  );
};

/**
 * Thread body content - displays the main post, images, poll, and links.
 * Used in the thread detail page.
 *
 * Enhanced with poll voting functionality and voter name display.
 */
const ThreadBody = forwardRef<HTMLDivElement, ThreadBodyProps>(
  ({
    thread,
    voterNames,
    currentUserId,
    onPollVote,
    onPollClose,
    className,
    ...props
  }, ref) => {
    // Local state for demo - in production this would come from server/context
    const [hasVoted, setHasVoted] = useState(false);
    const [votedFor, setVotedFor] = useState<string[]>([]);

    const handleVote = useCallback((optionId: string) => {
      if (thread.poll?.allowMultiple) {
        setVotedFor((prev) => {
          if (prev.includes(optionId)) {
            return prev.filter((id) => id !== optionId);
          }
          return [...prev, optionId];
        });
      } else {
        setVotedFor([optionId]);
        setHasVoted(true);
      }

      onPollVote?.(optionId);
    }, [thread.poll?.allowMultiple, onPollVote]);

    const isCreator = currentUserId === thread.poll?.creatorId;

    // Generate a default voter names map from the poll data if not provided
    // This extracts display names from the thread data for demo purposes
    const effectiveVoterNames = voterNames || generateVoterNamesFromThread(thread);

    return (
      <div ref={ref} className={cn('space-y-6', className)} {...props}>
        {/* Main Body Text */}
        {thread.body && formatBody(thread.body)}

        {/* Images Gallery */}
        {thread.images && thread.images.length > 0 && (
          <ImageGallery images={thread.images} />
        )}

        {/* Poll */}
        {thread.poll && (
          <PollDisplay
            poll={thread.poll}
            hasVoted={hasVoted}
            votedFor={votedFor}
            voterNames={effectiveVoterNames}
            currentUserId={currentUserId}
            isCreator={isCreator}
            onVote={handleVote}
            onClose={onPollClose}
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
