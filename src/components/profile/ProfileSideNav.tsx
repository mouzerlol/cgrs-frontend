'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/profile', label: 'Profile Details', icon: 'lucide:user' },
  { href: '/profile/reported-issues', label: 'Reported Issues', icon: 'lucide:message-square' },
  { href: '/profile/my-property', label: 'My Property', icon: 'lucide:house' },
] as const;

interface ProfileSideNavProps {
  onNavigate?: () => void;
  className?: string;
}

export default function ProfileSideNav({ onNavigate, className }: ProfileSideNavProps) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === '/profile') return pathname === '/profile';
    return pathname.startsWith(href);
  }

  return (
    <nav aria-label="Profile navigation" className={cn('bg-bone border-r border-sage/20', className)}>
      <ul className="py-2">
        {NAV_ITEMS.map(({ href, label, icon }) => {
          const active = isActive(href);
          return (
            <li key={href}>
              <Link
                href={href}
                onClick={onNavigate}
                aria-current={active ? 'page' : undefined}
                prefetch={true}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 text-sm transition-colors',
                  active
                    ? 'border-l-4 border-terracotta bg-sage-light/50 font-semibold text-forest'
                    : 'border-l-4 border-transparent text-forest/70 hover:bg-sage-light/30'
                )}
              >
                <Icon icon={icon} className="h-5 w-5 shrink-0" aria-hidden="true" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
