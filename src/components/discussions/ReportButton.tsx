'use client';

import { forwardRef, ButtonHTMLAttributes, useState } from 'react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/Tooltip';

interface ReportButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Callback when report is submitted */
  onReport?: () => void;
  /** Size variant */
  size?: 'sm' | 'md';
  /** Show label text */
  showLabel?: boolean;
  /** Toolbar icon button vs full-width menu row (icon + label, matches other menu items). */
  variant?: 'toolbar' | 'menu';
  /** Label when `variant` is menu (e.g. "Report thread" to match "Delete thread"). */
  menuLabel?: string;
}

/**
 * Report inappropriate content button.
 * Shows confirmation toast when clicked.
 * Future: Will integrate with backend moderation system.
 */
const ReportButton = forwardRef<HTMLButtonElement, ReportButtonProps>(
  ({
    onReport,
    size = 'md',
    showLabel = false,
    variant = 'toolbar',
    menuLabel = 'Report',
    className,
    disabled,
    ...props
  }, ref) => {
    const [reported, setReported] = useState(false);
    const [showToast, setShowToast] = useState(false);

    const sizeClasses = {
      sm: {
        button: 'min-h-[26px] min-w-[26px] p-1',
        icon: 'w-3 h-3',
        text: 'text-[11px]',
      },
      md: {
        button: 'min-w-[44px] min-h-[44px] p-2',
        icon: 'w-5 h-5',
        text: 'text-sm',
      },
    };

    const sizes = sizeClasses[size];
    const isMenu = variant === 'menu';
    const showToolbarLabel = showLabel || isMenu;

    const handleReport = () => {
      if (reported) return;

      setReported(true);
      setShowToast(true);
      onReport?.();

      // Hide toast after 3 seconds
      setTimeout(() => setShowToast(false), 3000);
    };

    const button = (
      <button
        ref={ref}
        type="button"
        onClick={handleReport}
        disabled={disabled || reported}
        className={cn(
          isMenu
            ? 'flex w-full items-center gap-3 text-left font-normal text-sm'
            : 'flex items-center justify-center gap-1 rounded-md border transition-all duration-200',
          !isMenu && sizes.button,
          isMenu && reported && 'text-forest/40 cursor-not-allowed',
          !isMenu &&
            (reported
              ? 'bg-sage-light/60 text-forest/40 border-forest/10 cursor-not-allowed'
              : 'bg-transparent text-forest/50 border-forest/10 hover:text-terracotta hover:bg-terracotta/5 hover:border-forest/18'),
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        aria-label={reported ? 'Already reported' : 'Report content'}
        {...props}
      >
        <Icon
          icon={reported ? 'lucide:flag-off' : 'lucide:flag'}
          className={isMenu ? 'w-4 h-4 shrink-0' : sizes.icon}
        />
        {showToolbarLabel && (
          <span className={cn(!isMenu && 'font-medium', !isMenu && sizes.text)}>
            {reported ? 'Reported' : isMenu ? menuLabel : 'Report'}
          </span>
        )}
      </button>
    );

    return (
      <div className="relative">
        {isMenu ? button : <Tooltip content={reported ? 'Reported' : 'Report'}>{button}</Tooltip>}

        {/* Toast notification */}
        {showToast && (
          <div
            className={cn(
              'absolute bottom-full right-0 mb-2 px-3 py-2 rounded-lg',
              'bg-forest text-bone text-sm whitespace-nowrap shadow-lg',
              'animate-fade-up'
            )}
          >
            <div className="flex items-center gap-2">
              <Icon icon="lucide:check-circle" className="w-4 h-4" />
              <span>Thank you for reporting</span>
            </div>
          </div>
        )}
      </div>
    );
  }
);

ReportButton.displayName = 'ReportButton';

export default ReportButton;
