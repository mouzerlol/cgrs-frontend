'use client';

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { cn } from '@/lib/utils';

export interface DropdownItem {
  label: string;
  onClick?: () => void;
  href?: string;
  icon?: React.ReactNode;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  className?: string;
}

/**
 * Dropdown menu component using Headless UI Menu.
 * Provides accessible dropdown menus with keyboard navigation.
 */
export function Dropdown({ trigger, items, align = 'right', className }: DropdownProps) {
  return (
    <Menu as="div" className={cn('relative', className)}>
      <MenuButton as="div">
        {trigger}
      </MenuButton>

      <MenuItems
        className={cn(
          'absolute mt-2 w-56 origin-top-right',
          'bg-white rounded-xl shadow-lg ring-1 ring-black/5',
          'focus:outline-none overflow-hidden',
          align === 'right' ? 'right-0' : 'left-0'
        )}
      >
        <div className="py-1">
          {items.map((item, index) => (
            <MenuItem key={index}>
              {({ focus }) => (
                item.href ? (
                  <a
                    href={item.href}
                    onClick={item.onClick}
                    className={cn(
                      'flex items-center gap-3 px-4 py-2.5 text-sm',
                      focus ? 'bg-sage-light text-forest' : 'text-forest/70',
                      'transition-colors'
                    )}
                  >
                    {item.icon && <span className="w-5 h-5">{item.icon}</span>}
                    {item.label}
                  </a>
                ) : (
                  <button
                    onClick={item.onClick}
                    className={cn(
                      'flex items-center gap-3 w-full px-4 py-2.5 text-sm text-left',
                      focus ? 'bg-sage-light text-forest' : 'text-forest/70',
                      'transition-colors'
                    )}
                  >
                    {item.icon && <span className="w-5 h-5">{item.icon}</span>}
                    {item.label}
                  </button>
                )
              )}
            </MenuItem>
          ))}
        </div>
      </MenuItems>
    </Menu>
  );
}

export default Dropdown;
