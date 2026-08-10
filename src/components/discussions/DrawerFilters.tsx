'use client';

import { Bookmark, LayoutGrid, List } from 'lucide-react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import type { ThreadSortOption } from '@/types';

type ViewMode = 'card' | 'compact';

const SORT_OPTIONS: { value: ThreadSortOption; label: string; icon: string }[] = [
  { value: 'newest', label: 'Newest', icon: 'lucide:clock' },
  { value: 'oldest', label: 'Oldest', icon: 'lucide:clock' },
  { value: 'most-upvoted', label: 'Most Upvoted', icon: 'lucide:arrow-big-up' },
  { value: 'most-discussed', label: 'Most Discussed', icon: 'lucide:message-circle' },
  { value: 'recent-activity', label: 'Recent Activity', icon: 'lucide:activity' },
];

interface DrawerFiltersProps {
  sort: ThreadSortOption;
  onSortChange: (next: ThreadSortOption) => void;
  viewMode: ViewMode;
  onViewModeChange: (next: ViewMode) => void;
  bookmarksOnly: boolean;
  onBookmarksOnlyChange: (next: boolean) => void;
  /** When false the bookmark filter is inert — nothing to filter by, signed out. */
  bookmarksEnabled: boolean;
}

/**
 * Sort, view and bookmark controls for the discussion's mobile drawer.
 *
 * The hero row these mirror is desktop-only: four floating controls will not
 * share a line with a heading card at 390px without shrinking to icons nobody
 * can name. In the drawer they get the width to stay labelled, next to the
 * category list they modify.
 *
 * Deliberately not the desktop components. Those carry white and sage-light
 * fills tuned for the bone page; on the drawer's forest panel they would read
 * as cut-out patches. Same options, same state, surface-appropriate skin.
 */
export default function DrawerFilters({
  sort,
  onSortChange,
  viewMode,
  onViewModeChange,
  bookmarksOnly,
  onBookmarksOnlyChange,
  bookmarksEnabled,
}: DrawerFiltersProps) {
  return (
    <div className="flex flex-col gap-md">
      <FilterGroup label="Show">
        <Chip
          isActive={bookmarksOnly}
          disabled={!bookmarksEnabled}
          onClick={() => onBookmarksOnlyChange(!bookmarksOnly)}
          title={bookmarksEnabled ? undefined : 'Sign in to filter by bookmarks'}
        >
          <Bookmark className="size-4 shrink-0" aria-hidden />
          Bookmarked
        </Chip>
      </FilterGroup>

      <FilterGroup label="Sort">
        {SORT_OPTIONS.map((option) => (
          <Chip
            key={option.value}
            isActive={option.value === sort}
            onClick={() => onSortChange(option.value)}
          >
            <Icon icon={option.icon} className="size-4 shrink-0" aria-hidden />
            {option.label}
          </Chip>
        ))}
      </FilterGroup>

      <FilterGroup label="View">
        <Chip isActive={viewMode === 'card'} onClick={() => onViewModeChange('card')}>
          <LayoutGrid className="size-4 shrink-0" aria-hidden />
          Cards
        </Chip>
        <Chip isActive={viewMode === 'compact'} onClick={() => onViewModeChange('compact')}>
          <List className="size-4 shrink-0" aria-hidden />
          List
        </Chip>
      </FilterGroup>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div role="group" aria-label={label}>
      {/* Same eyebrow treatment as the drawer's own header, so the sections
          below the rule read as part of the same panel. */}
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-bone/70">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({
  isActive,
  disabled,
  onClick,
  title,
  children,
}: {
  isActive: boolean;
  disabled?: boolean;
  onClick: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={isActive}
      aria-disabled={disabled}
      disabled={disabled}
      title={title}
      onClick={onClick}
      className={cn(
        'inline-flex min-h-[44px] items-center gap-2 rounded-xl border px-3',
        'font-body text-sm font-medium text-bone',
        'transition-colors duration-[250ms] ease-out-custom',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50',
        disabled && 'cursor-not-allowed opacity-50',
        isActive
          ? 'border-terracotta bg-terracotta'
          : 'border-bone/[0.18] bg-bone/[0.08] hover:bg-bone/[0.15]'
      )}
    >
      {children}
    </button>
  );
}
