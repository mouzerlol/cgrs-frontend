'use client';

import { useState, useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import type { SidebarCategory } from './SidebarTabs';

interface SidebarDropdownProps {
  categories: SidebarCategory[];
  activeCategory: string | null;
  onCategoryChange: (id: string | null) => void;
  showAllOption?: boolean;
  allOptionLabel?: string;
  allOptionIcon?: string;
}

/**
 * Mobile dropdown selector for sidebar categories.
 * Forest-light background with bone text.
 * Displayed only on mobile (< lg breakpoint).
 */
export function SidebarDropdown({
  categories,
  activeCategory,
  onCategoryChange,
  showAllOption = false,
  allOptionLabel = 'All Categories',
  allOptionIcon = 'lucide:layout-grid',
}: SidebarDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeItem = activeCategory
    ? categories.find((cat) => cat.id === activeCategory)
    : null;

  // Close on click-outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleSelect = (id: string | null) => {
    onCategoryChange(id);
    setIsOpen(false);
  };

  return (
    <div
      ref={dropdownRef}
      className="lg:hidden relative bg-forest-light p-md rounded-2xl"
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center justify-between w-full',
          'px-md py-sm min-h-[56px]',
          'bg-bone/[0.08] border border-bone/[0.12]',
          'rounded-xl font-body text-base font-medium text-bone',
          'cursor-pointer transition-all duration-[250ms] ease-out-custom',
          'hover:bg-bone/[0.12] hover:border-terracotta'
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="flex items-center gap-sm text-bone">
          {activeItem ? (
            <>
              <Icon icon={activeItem.icon} width={20} height={20} />
              <span>{activeItem.name}</span>
            </>
          ) : (
            <>
              <Icon icon={allOptionIcon} width={20} height={20} />
              <span>{allOptionLabel}</span>
            </>
          )}
        </span>
        <Icon
          icon="lucide:chevron-down"
          width={20}
          height={20}
          className={cn(
            'text-sage-light transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <ul
          className={cn(
            'absolute top-full left-0 right-0 mt-1 z-[1000]',
            'bg-forest-light border border-terracotta/30',
            'rounded-xl shadow-[0_12px_32px_rgba(0,0,0,0.4)]',
            'max-h-[50vh] overflow-y-auto overflow-x-hidden',
            'list-none'
          )}
          role="listbox"
          aria-activedescendant={activeCategory ?? 'all-categories'}
        >
          {showAllOption && (
            <li>
              <DropdownOption
                isActive={activeCategory === null}
                onClick={() => handleSelect(null)}
                icon={allOptionIcon}
                name={allOptionLabel}
              />
            </li>
          )}

          {categories.map((category) => {
            const isActive = category.id === activeCategory;

            return (
              <li key={category.id}>
                <DropdownOption
                  isActive={isActive}
                  onClick={() => handleSelect(category.id)}
                  icon={category.icon}
                  name={category.name}
                  count={category.count}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

interface DropdownOptionProps {
  isActive: boolean;
  onClick: () => void;
  icon: string;
  name: string;
  count?: number;
}

function DropdownOption({
  isActive,
  onClick,
  icon,
  name,
  count,
}: DropdownOptionProps) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={isActive}
      onClick={onClick}
      className={cn(
        'flex items-center gap-sm w-full px-md py-sm min-h-[52px]',
        'bg-transparent border-none',
        'font-body text-[0.9375rem] font-medium text-bone text-left',
        'cursor-pointer transition-colors duration-[250ms] ease-out-custom',
        'hover:bg-bone/[0.1]',
        isActive && 'bg-terracotta/20 border-l-[3px] border-l-terracotta'
      )}
    >
      <Icon icon={icon} width={20} height={20} />
      <span>
        {name}
        {count !== undefined && count > 0 && (
          <span className="text-xs text-bone/50 ml-2">({count})</span>
        )}
      </span>
      {isActive && (
        <Icon
          icon="lucide:check"
          width={18}
          height={18}
          className="ml-auto text-terracotta"
        />
      )}
    </button>
  );
}
