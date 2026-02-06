'use client';

import { cn } from '@/lib/utils';
import { DiscussionCategorySidebar } from './DiscussionCategorySidebar';
import { DiscussionCategoryDropdown } from './DiscussionCategoryDropdown';
import type { DiscussionCategory, DiscussionCategorySlug } from '@/types';

interface CategoryStats {
  threadCount: number;
  replyCount: number;
}

interface DiscussionsSidebarLayoutProps {
  /** List of categories */
  categories: DiscussionCategory[];
  /** Category statistics */
  stats?: Record<DiscussionCategorySlug, CategoryStats>;
  /** Currently active category (null = "All Categories") */
  activeCategory: DiscussionCategorySlug | null;
  /** Callback when category changes */
  onCategoryChange: (slug: DiscussionCategorySlug | null) => void;
  /** Content to display in the main panel */
  children: React.ReactNode;
  /** Additional class names */
  className?: string;
}

/**
 * Sidebar layout wrapper for discussion pages.
 * Combines sidebar navigation (desktop) and dropdown (mobile) with content area.
 * Matches the management-request form layout pattern.
 */
export function DiscussionsSidebarLayout({
  categories,
  stats,
  activeCategory,
  onCategoryChange,
  children,
  className,
}: DiscussionsSidebarLayoutProps) {
  return (
    <div className={cn('discussions-sidebar-layout', className)}>
      {/* Desktop Sidebar */}
      <DiscussionCategorySidebar
        categories={categories}
        stats={stats}
        activeCategory={activeCategory}
        onCategoryChange={onCategoryChange}
      />

      {/* Content Panel */}
      <div className="discussions-content-wrapper">
        {/* Mobile Dropdown */}
        <DiscussionCategoryDropdown
          categories={categories}
          stats={stats}
          activeCategory={activeCategory}
          onCategoryChange={onCategoryChange}
        />

        {/* Main Content */}
        <div className="discussions-content-panel">
          {children}
        </div>
      </div>
    </div>
  );
}
