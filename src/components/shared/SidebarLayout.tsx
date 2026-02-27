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
}: SidebarLayoutProps) {
  return (
    <div
      className={cn(
        'flex flex-col lg:flex-row min-h-[600px] items-stretch',
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
      />

      {/* Content area */}
      <div className="flex-1 min-w-0">
        {/* Mobile: Dropdown at top */}
        <SidebarDropdown
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={onCategoryChange}
          showAllOption={showAllOption}
          allOptionLabel={allOptionLabel}
          allOptionIcon={allOptionIcon}
        />

        {/* Main content panel */}
        <div
          className={cn(
            'flex-1 bg-sage-light p-lg min-w-0',
            'rounded-2xl lg:rounded-l-none lg:rounded-r-2xl',
            'sm:p-lg p-sm'
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
