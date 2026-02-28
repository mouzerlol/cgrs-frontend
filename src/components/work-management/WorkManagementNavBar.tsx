'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import Button from '@/components/ui/Button';

interface NavButton {
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: 'primary' | 'outline' | 'ghost';
}

interface WorkManagementNavBarProps {
  title: string;
  showBackButton?: boolean;
  backHref?: string;
  actions?: NavButton[];
  children?: React.ReactNode;
}

/**
 * Secondary navigation bar for Work Management pages.
 * Sits below the master Header; provides breadcrumbs, title, and action buttons.
 */
export default function WorkManagementNavBar({
  title,
  showBackButton = false,
  backHref = '/work-management',
  actions = [],
  children,
}: WorkManagementNavBarProps) {
  return (
    <div className="py-2.5 bg-forest-light border-b border-forest/30 px-4 md:px-6 flex items-center justify-between shrink-0 text-bone z-10">
      <div className="flex items-center gap-3 md:gap-4">
        {showBackButton && (
          <Link
            href={backHref}
            className="flex items-center gap-1 text-bone/80 hover:text-bone transition-colors text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Boards</span>
          </Link>
        )}
        {showBackButton && <div className="h-4 w-px bg-bone/30" />}
        <h1 className="font-display text-sm font-medium text-bone tracking-wide">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        {children}
        {actions.map((action, index) => {
          const buttonClasses = "!px-3 !py-1.5 !text-xs font-bold";
          const variant = action.variant || 'primary';

          if (action.href) {
            return (
              <Button key={index} variant={variant} size="sm" className={buttonClasses} asChild>
                <Link
                  href={action.href}
                  className="inline-flex items-center justify-center no-underline text-inherit w-full h-full"
                >
                  {action.label}
                </Link>
              </Button>
            );
          }

          return (
            <Button
              key={index}
              variant={variant}
              size="sm"
              className={buttonClasses}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
