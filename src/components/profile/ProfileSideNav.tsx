'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { id: 'details', href: '/profile', label: 'Profile Details', icon: 'lucide:user' },
  { id: 'reported-issues', href: '/profile/reported-issues', label: 'Reported Issues', icon: 'lucide:message-square' },
  { id: 'my-property', href: '/profile/my-property', label: 'My Property', icon: 'lucide:house' },
] as const;

interface ProfileSideNavProps {
  onNavigate?: () => void;
  onCategoryChange?: (id: string | null) => void;
  activeCategory?: string | null;
  className?: string;
}

export default function ProfileSideNav({ onNavigate, onCategoryChange, activeCategory: controlledActive, className }: ProfileSideNavProps) {
  const pathname = usePathname();

  function isActive(id: string) {
    if (controlledActive !== undefined) {
      return controlledActive === id;
    }
    // Fallback to pathname-based active detection
    const item = NAV_ITEMS.find((item) => item.id === id);
    if (!item) return false;
    if (item.href === '/profile') return pathname === '/profile';
    return pathname.startsWith(item.href);
  }

  function handleNavClick(id: string, href: string) {
    if (onCategoryChange) {
      onCategoryChange(id);
    }
    // Use Link for navigation
    window.location.href = href;
    onNavigate?.();
  }

  return (
    <nav
      aria-label="Profile navigation"
      className={cn('hidden lg:flex flex-col w-64 flex-shrink-0 bg-forest-light rounded-l-2xl pr-0 p-md', className)}
    >
      <ul className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ id, href, label, icon }) => {
          const active = isActive(id);
          return (
            <li key={href}>
              <button
                type="button"
                onClick={() => handleNavClick(id, href)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'group flex items-center border border-bone/[0.12] border-r-0 rounded-l-xl w-full',
                  'gap-sm px-md py-3.5 min-h-[56px] text-[0.9375rem]',
                  'bg-bone/[0.08]',
                  'font-body font-medium text-bone text-left',
                  'cursor-pointer relative',
                  'transition-all duration-[250ms] ease-out-custom',
                  !active && 'hover:bg-bone/[0.15] hover:translate-x-1',
                  active && [
                    'bg-sage-light text-forest font-semibold z-10',
                    'after:content-[""] after:absolute after:right-[-1px] after:top-0 after:bottom-0 after:w-0.5 after:bg-sage-light',
                  ]
                )}
              >
                <span
                  className={cn(
                    'flex items-center justify-center rounded-lg shrink-0',
                    'transition-all duration-[250ms] ease-out-custom',
                    'w-8 h-8',
                    active
                      ? 'bg-terracotta text-bone'
                      : 'bg-bone/[0.12] text-sage-light'
                  )}
                >
                  <Icon icon={icon} width={20} height={20} />
                </span>
                <span className="flex-1 leading-snug">{label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
