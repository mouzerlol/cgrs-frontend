'use client';

import { useState } from 'react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import { SidebarTabs } from './SidebarTabs';
import DrawerShell from './DrawerShell';
import SidebarDrawerNav from './SidebarDrawerNav';
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
  /** Drawer/header context label on mobile. */
  drawerTitle?: string;
  children: React.ReactNode;
  className?: string;
  /** Tighter chrome and no min-height — e.g. management request form */
  compact?: boolean;
}

/**
 * Unified sidebar+content layout wrapper.
 * Desktop: vertical folder-tab sidebar (forest-light) + content panel (sage-light).
 * Mobile: sticky header bar (hamburger + active category) opening a slide-in drawer.
 */
export function SidebarLayout({
  categories,
  activeCategory,
  onCategoryChange,
  showAllOption = false,
  allOptionLabel = 'All Categories',
  allOptionIcon = 'lucide:layout-grid',
  ariaLabel,
  drawerTitle = 'Menu',
  children,
  className,
  compact = false,
}: SidebarLayoutProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const activeItem = activeCategory
    ? categories.find((cat) => cat.id === activeCategory)
    : null;
  const activeLabel = activeItem ? activeItem.name : allOptionLabel;
  const activeIcon = activeItem ? activeItem.icon : allOptionIcon;

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
        {/* Mobile: sticky header bar opening the drawer */}
        <div
          className={cn(
            'lg:hidden sticky top-0 z-10 bg-sage-light rounded-t-2xl',
            compact ? 'p-sm' : 'p-md pb-sm'
          )}
        >
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className={cn(
              'flex w-full items-center gap-sm rounded-xl',
              'bg-forest-light text-bone font-body font-medium',
              compact ? 'px-sm py-2 min-h-[48px] text-sm' : 'px-md py-sm min-h-[56px] text-base',
              'transition-colors duration-[250ms] ease-out-custom hover:bg-forest',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50'
            )}
            aria-haspopup="dialog"
            aria-expanded={drawerOpen}
          >
            <Icon icon="lucide:menu" width={22} height={22} className="shrink-0 text-bone" />
            <Icon icon={activeIcon} width={20} height={20} className="shrink-0 text-sage-light" />
            <span className="min-w-0 flex-1 truncate text-left">{activeLabel}</span>
          </button>
        </div>

        <DrawerShell
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title={drawerTitle}
          ariaLabel={ariaLabel}
        >
          <SidebarDrawerNav
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={onCategoryChange}
            showAllOption={showAllOption}
            allOptionLabel={allOptionLabel}
            allOptionIcon={allOptionIcon}
            onSelect={() => setDrawerOpen(false)}
          />
        </DrawerShell>

        {/* Main content panel */}
        <div
          className={cn(
            'flex min-h-0 min-w-0 flex-1 flex-col bg-sage-light rounded-2xl lg:rounded-l-none lg:rounded-r-2xl',
            compact ? 'p-sm sm:p-md' : 'p-lg sm:p-lg p-sm'
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
