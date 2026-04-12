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
  /** Current user's forum member id (matches `option.voters`) for highlighting "You" in voter list */
  currentMemberId?: string;
  /** Whether the current user is the poll creator (can close poll) */
  isCreator?: boolean;
  /** Whether a vote mutation is currently in-flight */
  isPending?: boolean;
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
  currentMemberId?: string
): VoterInfo[] => {
  if (!voterNames) return [];

  return voterIds
    .map((id) => ({
      id,
      displayName: id === currentMemberId ? 'You' : (voterNames[id] || 'Anonymous'),
    }))
    .sort((a, b) => {
      // Put "You" first
      if (a.displayName === 'You') return -1;
      if (b.displayName === 'You') return 1;
      return a.displayName.localeCompare(b.displayName);
    });
};

/** Full-width expandable chip list below the option row */
function VoterListPanel({
  voters,
  optionId,
  isExpanded,
}: {
  voters: VoterInfo[];
  optionId: string;
  isExpanded: boolean;
}) {
  return (
    <div
      id={`voters-${optionId}`}
      className={cn(
        'flex flex-wrap gap-2 overflow-hidden transition-all duration-500 w-full',
        isExpanded ? 'max-h-[200px] opacity-100 p-xs bg-sage/15 rounded-[10px]' : 'max-h-0 opacity-0'
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
    currentMemberId,
    isCreator = false,
    isPending = false,
    className,
    ...props
  }, ref) => {
    const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
    const [votersExpanded, setVotersExpanded] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    const handleOptionClick = (optionId: string) => {
      if (poll.isClosed || isPending) return;
      onVote?.(optionId);
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

    const getProgressWidth = (votes: number): string => {
      if (totalVotes === 0) return '0%';
      return `${(votes / totalVotes) * 100}%`;
    };

    const getPercentage = (votes: number): number => {
      if (totalVotes === 0) return 0;
      return Math.round((votes / totalVotes) * 100);
    };

    const canShowVoters = !!voterNames && Object.keys(voterNames).length > 0;
    const showVoterUi = canShowVoters && (hasVoted || poll.isClosed);
    const optionIdsWithVoters = poll.options
      .filter((opt) => formatVoterList(opt.voters, voterNames, currentMemberId).length > 0)
      .map((opt) => opt.id);
    const showVoterToggles = showVoterUi && optionIdsWithVoters.length > 0;
    const voterPanelIds = optionIdsWithVoters.map((id) => `voters-${id}`).join(' ');

    return (
      <div
        ref={ref}
        className={cn(
          'bg-gradient-to-br from-bone to-sage-light/50 rounded-2xl border border-sage p-5 relative overflow-hidden',
          'before:content-[\'\'] before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-terracotta before:to-sage',
          'max-sm:p-3',
          className
        )}
        {...props}
      >
        {/* Poll label, question, and status on one row (question wraps when narrow) */}
        <div className="flex flex-wrap items-center justify-between gap-x-sm gap-y-xs mb-sm">
          <div className="flex flex-wrap items-center min-w-0 flex-1 gap-y-1">
            <div className="flex items-center gap-sm shrink-0 pr-md max-sm:pr-sm">
              <div className="w-9 h-9 flex items-center justify-center bg-terracotta/10 rounded-[10px] text-terracotta">
                <Icon icon="lucide:bar-chart-2" className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold text-terracotta uppercase tracking-wide">Community Poll</span>
            </div>
            <h3 className="font-display text-xl font-semibold text-forest leading-snug max-sm:text-lg min-w-0 flex-1">
              {poll.question}
            </h3>
          </div>

          <div className="shrink-0 flex items-center gap-sm flex-wrap justify-end">
            {showVoterToggles && (
              <button
                type="button"
                onClick={() => setVotersExpanded((v) => !v)}
                className="inline-flex items-center gap-1.5 py-1 px-3 bg-transparent border-none rounded-lg text-xs text-forest/70 cursor-pointer transition-all duration-[250ms] ease-out-custom min-h-[32px] shrink-0 hover:opacity-100 hover:bg-sage-light"
                aria-expanded={votersExpanded}
                aria-controls={voterPanelIds || undefined}
              >
                <Icon icon="lucide:users" className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap font-medium">{votersExpanded ? 'Hide voters' : 'View voters'}</span>
                <Icon
                  icon={votersExpanded ? 'lucide:chevron-up' : 'lucide:chevron-down'}
                  className="w-3.5 h-3.5 shrink-0 transition-transform duration-200"
                />
              </button>
            )}
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

        {/* Multiple choice indicator */}
        {poll.allowMultiple && (
          <p className="flex items-center gap-xs text-sm text-forest/60 mb-sm">
            <Icon icon="lucide:check-square" className="w-4 h-4" />
            Select multiple options
          </p>
        )}

        {/* Options */}
        <div className="flex flex-col gap-xs">
          {poll.options.map((option) => {
            const isSelected = votedFor.includes(option.id);
            const progressWidth = getProgressWidth(option.votes);
            const percentage = getPercentage(option.votes);
            const voters = formatVoterList(option.voters, voterNames, currentMemberId);
            const isWinning = hasVoted && option.votes === Math.max(...poll.options.map(o => o.votes)) && option.votes > 0;

            return (
              <div key={option.id} className="flex flex-col gap-xs w-full min-w-0">
                <button
                  type="button"
                  onClick={() => handleOptionClick(option.id)}
                  disabled={poll.isClosed || isPending}
                  className={cn(
                    'relative w-full min-w-0 py-3 px-md rounded-xl border-2 border-sage bg-bone text-left cursor-pointer transition-all duration-[250ms] ease-out-custom min-h-[48px] overflow-hidden',
                      'max-sm:py-2 max-sm:px-md',
                      hasVoted || poll.isClosed
                        ? isSelected
                          ? 'bg-terracotta/[0.08] border-terracotta'
                          : 'bg-sage-light border-sage'
                        : 'hover:border-forest hover:bg-sage-light hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(26,34,24,0.08)]',
                      isWinning && 'border-terracotta shadow-[0_0_0_1px_theme(colors.terracotta.DEFAULT)]',
                      (poll.isClosed || isPending) && 'cursor-default',
                      isPending && 'opacity-70'
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

                {showVoterUi && voters.length > 0 && (
                  <VoterListPanel
                    voters={voters}
                    optionId={option.id}
                    isExpanded={votersExpanded}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Footer — summary / close actions (after options) */}
        <div className="flex items-end justify-between mt-4 flex-wrap gap-xs max-sm:flex-col max-sm:items-stretch">
          <div className="flex items-end gap-md flex-wrap">
            {showVoterToggles ? (
              <button
                type="button"
                onClick={() => setVotersExpanded((v) => !v)}
                className="flex items-center gap-1.5 text-sm text-forest/70 border-none bg-transparent p-0 cursor-pointer font-inherit text-left"
                aria-expanded={votersExpanded}
                aria-controls={voterPanelIds || undefined}
              >
                <Icon icon="lucide:users" className="w-4 h-4" />
                {totalVotes} total vote{totalVotes !== 1 ? 's' : ''}
              </button>
            ) : (
              <span className="flex items-center gap-1.5 text-sm text-forest/70">
                <Icon icon="lucide:users" className="w-4 h-4" />
                {totalVotes} total vote{totalVotes !== 1 ? 's' : ''}
              </span>
            )}
            {poll.closedAt && (
              <span className="text-xs text-forest/50">
                Closed {new Date(poll.closedAt).toLocaleDateString()}
              </span>
            )}
          </div>

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
