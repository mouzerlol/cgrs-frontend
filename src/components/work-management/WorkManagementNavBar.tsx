'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

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
 * Reusable navigation bar for Work Management pages.
 * Provides consistent header with title, optional back button, and configurable action buttons.
 */
export default function WorkManagementNavBar({
  title,
  showBackButton = false,
  backHref = '/work-management',
  actions = [],
  children,
}: WorkManagementNavBarProps) {
  return (
    <div className="h-14 bg-forest/95 backdrop-blur-md border-b border-white/10 px-4 md:px-6 flex items-center justify-between shrink-0 text-bone z-10">
      <div className="flex items-center gap-4 md:gap-6">
        <Link
          href="/"
          className="nav-logo hover:opacity-80 transition-opacity text-bone"
        >
          <span className="flex flex-col leading-tight">
            <span className="block whitespace-nowrap">CORONATION</span>
            <span className="block whitespace-nowrap text-[1.15em] tracking-wider">GARDENS</span>
          </span>
        </Link>
        
        <div className="h-6 w-px bg-white/20 hidden sm:block" />
        
        {showBackButton && (
          <Link
            href={backHref}
            className="flex items-center gap-1 text-bone/70 hover:text-bone transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm">Boards</span>
          </Link>
        )}
        
        <h1 className="font-display text-sm font-medium text-bone/90 tracking-wide">
          {title}
        </h1>
      </div>
      
      <div className="flex items-center gap-3">
        {children}
        {actions.map((action, index) => {
          const buttonContent = (
            <span key={index} className={cn(action.href && 'flex items-center gap-2')}>
              {action.label}
            </span>
          );
          
          const baseClasses = "text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200";
          const variantClasses = {
            primary: "bg-bone text-forest hover:bg-bone/90 shadow-sm hover:-translate-y-0.5",
            outline: "border border-bone/30 text-bone hover:bg-white/10",
            ghost: "text-bone/70 hover:text-bone hover:bg-white/10",
          };
          
          const classes = cn(baseClasses, variantClasses[action.variant || 'ghost']);
          
          if (action.href) {
            return (
              <Link key={index} href={action.href} className={classes}>
                {buttonContent}
              </Link>
            );
          }
          
          return (
            <button
              key={index}
              onClick={action.onClick}
              className={classes}
            >
              {buttonContent}
            </button>
          );
        })}
      </div>
    </div>
  );
}
