'use client';

import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import type { SidebarCategory } from './SidebarTabs';

interface SidebarDrawerNavProps {
  categories: SidebarCategory[];
  activeCategory: string | null;
  onCategoryChange: (id: string | null) => void;
  showAllOption?: boolean;
  allOptionLabel?: string;
  allOptionIcon?: string;
  /** Called after a selection so the host can close the drawer. */
  onSelect?: () => void;
}

/**
 * Category navigation body for the mobile DrawerShell. Renders account-style
 * rows (icon + name + optional count badge) with an active highlight. When
 * `showAllOption` is set, the "All" row renders first. Selecting a row reports
 * the change and asks the host to close the drawer.
 */
export default function SidebarDrawerNav({
  categories,
  activeCategory,
  onCategoryChange,
  showAllOption = false,
  allOptionLabel = 'All Categories',
  allOptionIcon = 'lucide:layout-grid',
  onSelect,
}: SidebarDrawerNavProps) {
  const handleSelect = (id: string | null) => {
    onCategoryChange(id);
    onSelect?.();
  };

  return (
    <nav className="flex flex-col gap-1" aria-label="Categories">
      {showAllOption && (
        <DrawerNavRow
          isActive={activeCategory === null}
          onClick={() => handleSelect(null)}
          icon={allOptionIcon}
          name={allOptionLabel}
        />
      )}

      {categories.map((category) => (
        <DrawerNavRow
          key={category.id}
          isActive={category.id === activeCategory}
          onClick={() => handleSelect(category.id)}
          icon={category.icon}
          name={category.name}
          count={category.count}
        />
      ))}
    </nav>
  );
}

interface DrawerNavRowProps {
  isActive: boolean;
  onClick: () => void;
  icon: string;
  name: string;
  count?: number;
}

function DrawerNavRow({ isActive, onClick, icon, name, count }: DrawerNavRowProps) {
  const showCount = count !== undefined && count > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={isActive ? 'true' : undefined}
      className={cn(
        'group flex items-center gap-sm w-full px-sm py-3 min-h-[52px] rounded-xl',
        'font-body font-medium text-bone text-left',
        'transition-colors duration-[250ms] ease-out-custom',
        isActive ? 'bg-terracotta/20' : 'hover:bg-bone/[0.1]'
      )}
    >
      <span
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
          'transition-colors duration-[250ms] ease-out-custom',
          isActive ? 'bg-terracotta text-bone' : 'bg-bone/[0.12] text-sage-light'
        )}
      >
        <Icon icon={icon} width={20} height={20} />
      </span>
      <span className="min-w-0 flex-1 leading-snug">{name}</span>
      {showCount && (
        <span
          className={cn(
            'inline-flex shrink-0 items-center justify-center px-2 py-0.5',
            'rounded-xl text-[0.6875rem] font-bold min-w-[26px] tracking-wide',
            isActive ? 'bg-terracotta text-bone' : 'bg-sage/20 border border-sage/30 text-sage-light'
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}
