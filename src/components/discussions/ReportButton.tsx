'use client';

import { forwardRef, ButtonHTMLAttributes, useState } from 'react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';

interface ReportButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Callback when report is submitted */
  onReport?: () => void;
  /** Size variant */
  size?: 'sm' | 'md';
  /** Show label text */
  showLabel?: boolean;
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
    className,
    disabled,
    ...props
  }, ref) => {
    const [reported, setReported] = useState(false);
    const [showToast, setShowToast] = useState(false);

    const sizeClasses = {
      sm: {
        button: 'min-w-[36px] min-h-[36px] p-1.5',
        icon: 'w-4 h-4',
        text: 'text-xs',
      },
      md: {
        button: 'min-w-[44px] min-h-[44px] p-2',
        icon: 'w-5 h-5',
        text: 'text-sm',
      },
    };

    const sizes = sizeClasses[size];

    const handleReport = () => {
      if (reported) return;

      setReported(true);
      setShowToast(true);
      onReport?.();

      // Hide toast after 3 seconds
      setTimeout(() => setShowToast(false), 3000);
    };

    return (
      <div className="relative">
        <button
          ref={ref}
          type="button"
          onClick={handleReport}
          disabled={disabled || reported}
          className={cn(
            'flex items-center justify-center gap-1.5 rounded-lg border transition-all duration-200',
            sizes.button,
            reported
              ? 'bg-sage-light text-forest/40 border-sage cursor-not-allowed'
              : 'bg-transparent text-forest/40 border-transparent hover:text-terracotta hover:bg-terracotta/5',
            disabled && 'opacity-50 cursor-not-allowed',
            className
          )}
          aria-label={reported ? 'Already reported' : 'Report content'}
          {...props}
        >
          <Icon
            icon={reported ? 'lucide:flag-off' : 'lucide:flag'}
            className={sizes.icon}
          />
          {showLabel && (
            <span className={cn('font-medium', sizes.text)}>
              {reported ? 'Reported' : 'Report'}
            </span>
          )}
        </button>

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
