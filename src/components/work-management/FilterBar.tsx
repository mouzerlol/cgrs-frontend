import FilterDropdown from './FilterDropdown';
import { cn } from '@/lib/utils';
import { BoardFilters } from '@/hooks/useBoardFilters';
import { PRIORITY_CONFIG } from '@/lib/work-management';
import mockData from '@/data/work-management.json';

interface FilterBarProps {
  filters: BoardFilters;
  setFilter: (category: keyof BoardFilters, values: string[]) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  availableTags: string[];
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md';
}

export default function FilterBar({
  filters,
  setFilter,
  clearFilters,
  hasActiveFilters,
  availableTags,
  variant = 'dark',
  size = 'md',
}: FilterBarProps) {
  const memberOptions = mockData.members.map((m: any) => ({ label: m.name, value: m.id }));
  const priorityOptions = Object.entries(PRIORITY_CONFIG).map(([k, v]) => ({ label: v.label, value: k }));
  const tagOptions = availableTags.map(t => ({ label: t, value: t }));

  return (
    <div className="flex items-center gap-2">
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className={cn(
            "text-terracotta hover:underline mr-1 font-medium hidden sm:block",
            size === 'sm' ? 'text-[11px]' : 'text-xs'
          )}
        >
          Clear filters
        </button>
      )}
      <FilterDropdown
        label="Assignee"
        options={memberOptions}
        selectedValues={filters.assignees}
        onChange={v => setFilter('assignees', v)}
        variant={variant}
        size={size}
      />
      <FilterDropdown
        label="Priority"
        options={priorityOptions}
        selectedValues={filters.priorities}
        onChange={v => setFilter('priorities', v as any)}
        variant={variant}
        size={size}
      />
      <div className="hidden md:block">
        <FilterDropdown
          label="Tags"
          options={tagOptions}
          selectedValues={filters.tags}
          onChange={v => setFilter('tags', v)}
          variant={variant}
          size={size}
        />
      </div>
    </div>
  );
}
