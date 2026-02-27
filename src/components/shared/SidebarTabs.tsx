'use client';

import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';

export interface SidebarCategory {
  id: string;
  name: string;
  icon: string;
  count?: number;
}

interface SidebarTabsProps {
  categories: SidebarCategory[];
  activeCategory: string | null;
  onCategoryChange: (id: string | null) => void;
  showAllOption?: boolean;
  allOptionLabel?: string;
  allOptionIcon?: string;
  ariaLabel?: string;
}

/**
 * Desktop vertical folder-tab navigation.
 * Forest-light sidebar with bone text, sage-light active tab connecting to content panel.
 * Hidden on mobile (< lg breakpoint).
 */
export function SidebarTabs({
  categories,
  activeCategory,
  onCategoryChange,
  showAllOption = false,
  allOptionLabel = 'All Categories',
  allOptionIcon = 'lucide:layout-grid',
  ariaLabel = 'Categories',
}: SidebarTabsProps) {
  return (
    <nav
      className="hidden lg:flex flex-col w-64 flex-shrink-0 bg-forest-light rounded-l-2xl p-md pr-0"
      aria-label={ariaLabel}
    >
      <div className="flex flex-col gap-1" role="tablist">
        {showAllOption && (
          <TabButton
            isActive={activeCategory === null}
            onClick={() => onCategoryChange(null)}
            icon={allOptionIcon}
            name={allOptionLabel}
          />
        )}

        {categories.map((category) => {
          const isActive = category.id === activeCategory;

          return (
            <TabButton
              key={category.id}
              isActive={isActive}
              onClick={() => onCategoryChange(category.id)}
              icon={category.icon}
              name={category.name}
              count={category.count}
            />
          );
        })}
      </div>
    </nav>
  );
}

interface TabButtonProps {
  isActive: boolean;
  onClick: () => void;
  icon: string;
  name: string;
  count?: number;
}

function TabButton({ isActive, onClick, icon, name, count }: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex items-center gap-sm px-md py-3.5 min-h-[56px]',
        'bg-bone/[0.08] border border-bone/[0.12] border-r-0 rounded-l-xl',
        'font-body text-[0.9375rem] font-medium text-bone text-left',
        'cursor-pointer relative',
        'transition-all duration-[250ms] ease-out-custom',
        !isActive && 'hover:bg-bone/[0.15] hover:translate-x-1',
        isActive && [
          'bg-sage-light text-forest font-semibold z-10',
          // Pseudo-element bridge handled via after:
          'after:content-[""] after:absolute after:right-[-1px] after:top-0 after:bottom-0 after:w-0.5 after:bg-sage-light',
        ]
      )}
      aria-selected={isActive}
      role="tab"
    >
      <span
        className={cn(
          'flex items-center justify-center w-8 h-8 rounded-lg shrink-0',
          'transition-all duration-[250ms] ease-out-custom',
          isActive
            ? 'bg-terracotta text-bone'
            : 'bg-bone/[0.12] text-sage-light'
        )}
      >
        <Icon icon={icon} width={20} height={20} />
      </span>
      <span className="flex-1 leading-snug">
        {name}
        {count !== undefined && count > 0 && (
          <span
            className={cn(
              'inline-flex items-center justify-center ml-xs px-2 py-0.5',
              'rounded-xl text-[0.6875rem] font-bold min-w-[26px] tracking-wide',
              'transition-all duration-[250ms] ease-out-custom',
              isActive
                ? 'bg-terracotta text-bone'
                : 'bg-sage/20 border border-sage/30 text-sage-light'
            )}
          >
            {count}
          </span>
        )}
      </span>
    </button>
  );
}
