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
    <div className="poll-voters-section">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className="poll-voters-toggle"
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
          'poll-voters-list',
          isExpanded ? 'poll-voters-list-expanded' : 'poll-voters-list-collapsed'
        )}
        role="list"
        aria-label="Voters for this option"
      >
        {voters.map((voter, index) => (
          <span
            key={voter.id}
            className={cn(
              'poll-voter-chip',
              voter.displayName === 'You' && 'poll-voter-chip-you'
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
        className={cn('poll-display', className)}
        {...props}
      >
        {/* Poll Header */}
        <div className="poll-display-header">
          <div className="poll-display-title">
            <div className="poll-display-icon">
              <Icon icon="lucide:bar-chart-2" className="w-5 h-5" />
            </div>
            <span className="poll-display-label">Community Poll</span>
          </div>

          {/* Poll Status Badge */}
          <div className="poll-display-status">
            {poll.isClosed ? (
              <span className="poll-status-badge poll-status-closed">
                <Icon icon="lucide:lock" className="w-3.5 h-3.5" />
                Closed
              </span>
            ) : (
              <span className="poll-status-badge poll-status-open">
                <Icon icon="lucide:clock" className="w-3.5 h-3.5" />
                Open
              </span>
            )}
          </div>
        </div>

        {/* Question */}
        <h3 className="poll-display-question">
          {poll.question}
        </h3>

        {/* Multiple choice indicator */}
        {poll.allowMultiple && (
          <p className="poll-display-hint">
            <Icon icon="lucide:check-square" className="w-4 h-4" />
            Select multiple options
          </p>
        )}

        {/* Options */}
        <div className="poll-display-options">
          {poll.options.map((option) => {
            const isSelected = votedFor.includes(option.id);
            const progressWidth = getProgressWidth(option.votes);
            const percentage = getPercentage(option.votes);
            const voters = formatVoterList(option.voters, voterNames, currentUserId);
            const isVotersExpanded = expandedOptions.has(option.id);
            const isWinning = hasVoted && option.votes === Math.max(...poll.options.map(o => o.votes)) && option.votes > 0;

            return (
              <div key={option.id} className="poll-option-wrapper">
                <button
                  type="button"
                  onClick={() => handleOptionClick(option.id)}
                  disabled={hasVoted || poll.isClosed}
                  className={cn(
                    'poll-option-button',
                    hasVoted || poll.isClosed
                      ? isSelected
                        ? 'poll-option-selected'
                        : 'poll-option-voted'
                      : 'poll-option-voteable',
                    isWinning && 'poll-option-winning',
                    poll.isClosed && 'poll-option-closed'
                  )}
                  aria-pressed={isSelected}
                  aria-describedby={`option-stats-${option.id}`}
                >
                  {/* Progress Bar Background */}
                  {(hasVoted || poll.isClosed) && (
                    <div
                      className={cn(
                        'poll-option-progress',
                        isSelected && 'poll-option-progress-selected'
                      )}
                      style={{ width: progressWidth }}
                      aria-hidden="true"
                    />
                  )}

                  {/* Content */}
                  <div className="poll-option-content">
                    <div className="poll-option-left">
                      {/* Indicator */}
                      <div
                        className={cn(
                          'poll-option-indicator',
                          poll.allowMultiple ? 'poll-option-indicator-checkbox' : 'poll-option-indicator-radio',
                          isSelected && 'poll-option-indicator-selected'
                        )}
                        aria-hidden="true"
                      >
                        {isSelected && (
                          <Icon icon="lucide:check" className="w-3 h-3" />
                        )}
                      </div>

                      {/* Option Text */}
                      <span className={cn(
                        'poll-option-text',
                        isSelected && 'poll-option-text-selected'
                      )}>
                        {option.text}
                      </span>

                      {/* Winning badge */}
                      {isWinning && (
                        <span className="poll-option-winning-badge" aria-label="Leading option">
                          <Icon icon="lucide:trending-up" className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>

                    {/* Vote Stats */}
                    <div
                      className="poll-option-stats"
                      id={`option-stats-${option.id}`}
                    >
                      {(hasVoted || poll.isClosed) && (
                        <span className="poll-option-percentage">
                          {percentage}%
                        </span>
                      )}
                      <span className="poll-option-votes">
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
        <div className="poll-display-footer">
          <div className="poll-display-meta">
            <span className="poll-total-votes">
              <Icon icon="lucide:users" className="w-4 h-4" />
              {totalVotes} total vote{totalVotes !== 1 ? 's' : ''}
            </span>
            {poll.closedAt && (
              <span className="poll-closed-date">
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
              className="poll-close-button"
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
