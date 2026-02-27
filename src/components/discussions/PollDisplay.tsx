'use client';

import { forwardRef, HTMLAttributes, useState } from 'react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import type { Poll } from '@/types';

interface VoterInfo {
  id: string;
  displayName: string;
}

interface PollDisplayProps extends HTMLAttributes<HTMLDivElement> {
  poll: Poll;
  onVote?: (optionId: string) => void;
  onClose?: () => void;
  hasVoted?: boolean;
  votedFor?: string[];
  /** Optional mapping of user IDs to display names for showing voter list */
  voterNames?: Record<string, string>;
  /** Current user ID for showing "You" in voter list */
  currentUserId?: string;
  /** Whether the current user is the poll creator (can close poll) */
  isCreator?: boolean;
}

const formatVoteCount = (count: number): string => {
  if (count === 0) return 'No votes';
  if (count === 1) return '1 vote';
  return `${count} votes`;
};

/**
 * Formats voter display names into a readable list
 */
const formatVoterList = (
  voterIds: string[],
  voterNames?: Record<string, string>,
  currentUserId?: string
): VoterInfo[] => {
  if (!voterNames) return [];

  return voterIds
    .map((id) => ({
      id,
      displayName: id === currentUserId ? 'You' : (voterNames[id] || 'Anonymous'),
    }))
    .sort((a, b) => {
      // Put "You" first
      if (a.displayName === 'You') return -1;
      if (b.displayName === 'You') return 1;
      return a.displayName.localeCompare(b.displayName);
    });
};

/**
 * Expandable voter list component
 */
function VoterList({
  voters,
  optionId,
  isExpanded,
  onToggle,
}: {
  voters: VoterInfo[];
  optionId: string;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  if (voters.length === 0) return null;

  return (
    <div className="pl-[calc(1.5rem+22px+1rem)] mt-xs max-sm:pl-md">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className="inline-flex items-center gap-1.5 py-2 px-3 bg-transparent border-none rounded-lg text-xs text-forest/70 cursor-pointer transition-all duration-[250ms] ease-out-custom min-h-[36px] hover:opacity-100 hover:bg-sage-light"
        aria-expanded={isExpanded}
        aria-controls={`voters-${optionId}`}
      >
        <Icon
          icon="lucide:users"
          className="w-3.5 h-3.5"
        />
        <span>
          {isExpanded ? 'Hide voters' : `View ${voters.length} voter${voters.length !== 1 ? 's' : ''}`}
        </span>
        <Icon
          icon={isExpanded ? 'lucide:chevron-up' : 'lucide:chevron-down'}
          className="w-3.5 h-3.5 transition-transform duration-200"
        />
      </button>

      <div
        id={`voters-${optionId}`}
        className={cn(
          'flex flex-wrap gap-2 overflow-hidden transition-all duration-500',
          isExpanded
            ? 'max-h-[200px] opacity-100 mt-sm p-sm bg-sage/15 rounded-[10px]'
            : 'max-h-0 opacity-0 mt-0'
        )}
        role="list"
        aria-label="Voters for this option"
      >
        {voters.map((voter, index) => (
          <span
            key={voter.id}
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-bone border border-sage rounded-2xl text-xs text-forest animate-[poll-voter-appear_0.3s_ease-out_forwards] opacity-0 translate-y-2',
              voter.displayName === 'You' && 'bg-terracotta/10 border-terracotta text-terracotta font-semibold'
            )}
            role="listitem"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <Icon icon="lucide:user" className="w-3 h-3" />
            {voter.displayName}
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * Poll display component for showing poll results and voting UI.
 * Features expandable voter lists to show community participation transparency.
 *
 * Design: Organic/Garden community aesthetic with warm terracotta accents,
 * gentle reveal animations, and accessible touch targets (min 48px).
 */
const PollDisplay = forwardRef<HTMLDivElement, PollDisplayProps>(
  ({
    poll,
    onVote,
    onClose,
    hasVoted = false,
    votedFor = [],
    voterNames,
    currentUserId,
    isCreator = false,
    className,
    ...props
  }, ref) => {
    const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
    const [expandedOptions, setExpandedOptions] = useState<Set<string>>(new Set());
    const [isClosing, setIsClosing] = useState(false);

    const handleOptionClick = (optionId: string) => {
      if (!hasVoted && !poll.isClosed && onVote) {
        onVote(optionId);
      }
    };

    const handleClosePoll = async () => {
      if (onClose && !isClosing) {
        setIsClosing(true);
        try {
          await onClose();
        } finally {
          setIsClosing(false);
        }
      }
    };

    const toggleVoterList = (optionId: string) => {
      setExpandedOptions((prev) => {
        const next = new Set(prev);
        if (next.has(optionId)) {
          next.delete(optionId);
        } else {
          next.add(optionId);
        }
        return next;
      });
    };

    const getProgressWidth = (votes: number): string => {
      if (totalVotes === 0) return '0%';
      return `${(votes / totalVotes) * 100}%`;
    };

    const getPercentage = (votes: number): number => {
      if (totalVotes === 0) return 0;
      return Math.round((votes / totalVotes) * 100);
    };

    const canShowVoters = !!voterNames && Object.keys(voterNames).length > 0;

    return (
      <div
        ref={ref}
        className={cn(
          'bg-gradient-to-br from-bone to-sage-light/50 rounded-2xl border border-sage p-lg relative overflow-hidden',
          'before:content-[\'\'] before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-terracotta before:to-sage',
          'max-sm:p-md',
          className
        )}
        {...props}
      >
        {/* Poll Header */}
        <div className="flex items-center justify-between mb-md">
          <div className="flex items-center gap-sm">
            <div className="w-9 h-9 flex items-center justify-center bg-terracotta/10 rounded-[10px] text-terracotta">
              <Icon icon="lucide:bar-chart-2" className="w-5 h-5" />
            </div>
            <span className="text-sm font-semibold text-terracotta uppercase tracking-wide">Community Poll</span>
          </div>

          {/* Poll Status Badge */}
          <div>
            {poll.isClosed ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[20px] text-xs font-semibold bg-sage text-forest">
                <Icon icon="lucide:lock" className="w-3.5 h-3.5" />
                Closed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[20px] text-xs font-semibold bg-forest/10 text-forest">
                <Icon icon="lucide:clock" className="w-3.5 h-3.5" />
                Open
              </span>
            )}
          </div>
        </div>

        {/* Question */}
        <h3 className="font-display text-xl font-semibold text-forest leading-snug mb-sm max-sm:text-lg">
          {poll.question}
        </h3>

        {/* Multiple choice indicator */}
        {poll.allowMultiple && (
          <p className="flex items-center gap-xs text-sm text-forest/60 mb-md">
            <Icon icon="lucide:check-square" className="w-4 h-4" />
            Select multiple options
          </p>
        )}

        {/* Options */}
        <div className="flex flex-col gap-sm">
          {poll.options.map((option) => {
            const isSelected = votedFor.includes(option.id);
            const progressWidth = getProgressWidth(option.votes);
            const percentage = getPercentage(option.votes);
            const voters = formatVoterList(option.voters, voterNames, currentUserId);
            const isVotersExpanded = expandedOptions.has(option.id);
            const isWinning = hasVoted && option.votes === Math.max(...poll.options.map(o => o.votes)) && option.votes > 0;

            return (
              <div key={option.id} className="flex flex-col">
                <button
                  type="button"
                  onClick={() => handleOptionClick(option.id)}
                  disabled={hasVoted || poll.isClosed}
                  className={cn(
                    'relative w-full p-md rounded-xl border-2 border-sage bg-bone text-left cursor-pointer transition-all duration-[250ms] ease-out-custom min-h-[56px] overflow-hidden',
                    'max-sm:py-sm max-sm:px-md',
                    hasVoted || poll.isClosed
                      ? isSelected
                        ? 'bg-terracotta/[0.08] border-terracotta'
                        : 'bg-sage-light border-sage cursor-default'
                      : 'hover:border-forest hover:bg-sage-light hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(26,34,24,0.08)]',
                    isWinning && 'border-terracotta shadow-[0_0_0_1px_theme(colors.terracotta)]',
                    poll.isClosed && 'cursor-default'
                  )}
                  aria-pressed={isSelected}
                  aria-describedby={`option-stats-${option.id}`}
                >
                  {/* Progress Bar Background */}
                  {(hasVoted || poll.isClosed) && (
                    <div
                      className={cn(
                        'absolute top-0 left-0 bottom-0 bg-forest/[0.06] rounded-[10px] transition-[width] duration-600 ease-[cubic-bezier(0.4,0,0.2,1)]',
                        isSelected && 'bg-terracotta/[0.12]'
                      )}
                      style={{ width: progressWidth }}
                      aria-hidden="true"
                    />
                  )}

                  {/* Content */}
                  <div className="relative flex items-center justify-between gap-md z-[1]">
                    <div className="flex items-center gap-sm min-w-0 flex-1">
                      {/* Indicator */}
                      <div
                        className={cn(
                          'w-[22px] h-[22px] flex items-center justify-center border-2 border-sage bg-bone shrink-0 transition-all duration-[250ms] ease-out-custom',
                          poll.allowMultiple ? 'rounded-md' : 'rounded-full',
                          isSelected && 'bg-terracotta border-terracotta text-bone'
                        )}
                        aria-hidden="true"
                      >
                        {isSelected && (
                          <Icon icon="lucide:check" className="w-3 h-3" />
                        )}
                      </div>

                      {/* Option Text */}
                      <span className={cn(
                        'font-medium text-forest leading-snug',
                        isSelected && 'text-terracotta font-semibold'
                      )}>
                        {option.text}
                      </span>

                      {/* Winning badge */}
                      {isWinning && (
                        <span
                          className="flex items-center justify-center w-6 h-6 bg-terracotta text-bone rounded-full shrink-0 animate-[poll-pulse_2s_infinite]"
                          aria-label="Leading option"
                        >
                          <Icon icon="lucide:trending-up" className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>

                    {/* Vote Stats */}
                    <div
                      className="flex items-center gap-sm shrink-0 max-sm:flex-col max-sm:items-end max-sm:gap-0.5"
                      id={`option-stats-${option.id}`}
                    >
                      {(hasVoted || poll.isClosed) && (
                        <span className="text-lg font-bold text-forest min-w-[48px] text-right max-sm:text-base max-sm:min-w-0">
                          {percentage}%
                        </span>
                      )}
                      <span className="text-xs text-forest/60 whitespace-nowrap">
                        {formatVoteCount(option.votes)}
                      </span>
                    </div>
                  </div>
                </button>

                {/* Voter List (expandable) */}
                {canShowVoters && (hasVoted || poll.isClosed) && voters.length > 0 && (
                  <VoterList
                    voters={voters}
                    optionId={option.id}
                    isExpanded={isVotersExpanded}
                    onToggle={() => toggleVoterList(option.id)}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-lg pt-md border-t border-sage flex-wrap gap-sm max-sm:flex-col max-sm:items-stretch">
          <div className="flex items-center gap-md flex-wrap">
            <span className="flex items-center gap-1.5 text-sm text-forest/70">
              <Icon icon="lucide:users" className="w-4 h-4" />
              {totalVotes} total vote{totalVotes !== 1 ? 's' : ''}
            </span>
            {poll.closedAt && (
              <span className="text-xs text-forest/50">
                Closed {new Date(poll.closedAt).toLocaleDateString()}
              </span>
            )}
          </div>

          {/* Close Poll Button (for creator only) */}
          {isCreator && onClose && !poll.isClosed && (
            <button
              type="button"
              onClick={handleClosePoll}
              disabled={isClosing}
              className="inline-flex items-center gap-1.5 py-2.5 px-4 bg-transparent border border-sage rounded-lg text-sm font-medium text-forest cursor-pointer transition-all duration-[250ms] ease-out-custom min-h-[44px] hover:border-terracotta hover:text-terracotta hover:bg-terracotta/5 disabled:opacity-60 disabled:cursor-not-allowed max-sm:w-full max-sm:justify-center"
              aria-busy={isClosing}
            >
              {isClosing ? (
                <>
                  <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" />
                  Closing...
                </>
              ) : (
                <>
                  <Icon icon="lucide:lock" className="w-4 h-4" />
                  Close Poll
                </>
              )}
            </button>
          )}
        </div>
      </div>
    );
  }
);

PollDisplay.displayName = 'PollDisplay';

export default PollDisplay;
