'use client';

import { forwardRef, Fragment } from 'react';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions, Transition } from '@headlessui/react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import type { ThreadSortOption } from '@/types';

interface SortOption {
  value: ThreadSortOption;
  label: string;
  icon: string;
}

const SORT_OPTIONS: SortOption[] = [
  { value: 'newest', label: 'Newest', icon: 'lucide:clock' },
  { value: 'most-upvoted', label: 'Most Upvoted', icon: 'lucide:arrow-big-up' },
  { value: 'most-discussed', label: 'Most Discussed', icon: 'lucide:message-circle' },
];

interface SortDropdownProps {
  /** Current sort value */
  value: ThreadSortOption;
  /** Callback when sort changes */
  onChange: (value: ThreadSortOption) => void;
  /** Additional class names */
  className?: string;
}

/**
 * Dropdown for selecting thread sort order.
 * Uses Headless UI Listbox for accessibility.
 */
const SortDropdown = forwardRef<HTMLDivElement, SortDropdownProps>(
  ({ value, onChange, className }, ref) => {
    const selectedOption = SORT_OPTIONS.find((opt) => opt.value === value) || SORT_OPTIONS[0];

    return (
      <Listbox value={value} onChange={onChange}>
        <div ref={ref} className={cn('relative', className)}>
          <ListboxButton
            className={cn(
              'flex items-center gap-2 px-4 py-2.5',
              'bg-white rounded-xl border border-sage/30',
              'text-sm text-forest',
              'transition-all duration-200',
              'hover:border-sage focus:outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/10'
            )}
          >
            <Icon icon={selectedOption.icon} className="w-4 h-4 text-forest/60" />
            <span className="font-medium">{selectedOption.label}</span>
            <Icon icon="lucide:chevron-down" className="w-4 h-4 text-forest/40" />
          </ListboxButton>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <ListboxOptions
              className={cn(
                'absolute right-0 mt-2 w-48 origin-top-right z-50',
                'bg-white rounded-xl shadow-lg border border-sage',
                'ring-1 ring-black/5 focus:outline-none',
                'p-1'
              )}
            >
              {SORT_OPTIONS.map((option) => (
                <ListboxOption
                  key={option.value}
                  value={option.value}
                  className={({ focus, selected }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer',
                      'transition-colors duration-100',
                      focus && 'bg-sage-light',
                      selected ? 'text-terracotta font-medium' : 'text-forest/70'
                    )
                  }
                >
                  {({ selected }) => (
                    <>
                      <Icon icon={option.icon} className="w-4 h-4" />
                      <span className="flex-1">{option.label}</span>
                      {selected && (
                        <Icon icon="lucide:check" className="w-4 h-4" />
                      )}
                    </>
                  )}
                </ListboxOption>
              ))}
            </ListboxOptions>
          </Transition>
        </div>
      </Listbox>
    );
  }
);

SortDropdown.displayName = 'SortDropdown';

export default SortDropdown;
