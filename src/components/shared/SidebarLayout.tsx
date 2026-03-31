'use client';

import { cn } from '@/lib/utils';
import { SidebarTabs } from './SidebarTabs';
import { SidebarDropdown } from './SidebarDropdown';
import type { SidebarCategory } from './SidebarTabs';

export type { SidebarCategory };

interface SidebarLayoutProps {
  categories: SidebarCategory[];
  activeCategory: string | null;
  onCategoryChange: (id: string | null) => void;
  showAllOption?: boolean;
  allOptionLabel?: string;
  allOptionIcon?: string;
  ariaLabel?: string;
  children: React.ReactNode;
  className?: string;
  /** Tighter chrome and no min-height — e.g. management request form */
  compact?: boolean;
}

/**
 * Unified sidebar+content layout wrapper.
 * Desktop: vertical folder-tab sidebar (forest-light) + content panel (sage-light).
 * Mobile: dropdown at top of content panel.
 */
export function SidebarLayout({
  categories,
  activeCategory,
  onCategoryChange,
  showAllOption = false,
  allOptionLabel,
  allOptionIcon,
  ariaLabel,
  children,
  className,
  compact = false,
}: SidebarLayoutProps) {
  return (
    <div
      className={cn(
        'flex flex-col lg:flex-row items-stretch',
        compact ? 'min-h-0' : 'min-h-[600px]',
        className
      )}
    >
      {/* Desktop: Vertical folder-tab sidebar */}
      <SidebarTabs
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={onCategoryChange}
        showAllOption={showAllOption}
        allOptionLabel={allOptionLabel}
        allOptionIcon={allOptionIcon}
        ariaLabel={ariaLabel}
        compact={compact}
      />

      {/* Content area: column flex so the panel (flex-1) fills stretched row height beside SidebarTabs */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {/* Mobile: Dropdown at top */}
        <SidebarDropdown
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={onCategoryChange}
          showAllOption={showAllOption}
          allOptionLabel={allOptionLabel}
          allOptionIcon={allOptionIcon}
          compact={compact}
        />

        {/* Main content panel */}
        <div
          className={cn(
            'min-h-0 min-w-0 flex-1 bg-sage-light rounded-2xl lg:rounded-l-none lg:rounded-r-2xl',
            compact ? 'p-sm sm:p-md' : 'p-lg sm:p-lg p-sm'
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
