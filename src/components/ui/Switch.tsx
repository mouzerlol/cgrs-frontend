'use client';

import { Switch as HeadlessSwitch } from '@headlessui/react';
import { cn } from '@/lib/utils';

interface SwitchProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Toggle switch component using Headless UI Switch.
 * Provides accessible toggle controls with smooth animations.
 */
export function Switch({
  label,
  description,
  checked,
  onChange,
  disabled = false,
  className
}: SwitchProps) {
  return (
    <HeadlessSwitch.Group as="div" className={cn('flex items-center justify-between', className)}>
      <span className="flex flex-col flex-grow">
        <HeadlessSwitch.Label
          as="span"
          className={cn(
            'text-sm font-medium text-forest',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          passive
        >
          {label}
        </HeadlessSwitch.Label>
        {description && (
          <HeadlessSwitch.Description
            as="span"
            className={cn(
              'text-sm text-forest/60',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {description}
          </HeadlessSwitch.Description>
        )}
      </span>
      <HeadlessSwitch
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className={cn(
          'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full',
          'border-2 border-transparent transition-colors duration-200 ease-in-out',
          'focus:outline-none focus:ring-2 focus:ring-terracotta/50 focus:ring-offset-2',
          checked ? 'bg-terracotta' : 'bg-sage',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none inline-block h-5 w-5 transform rounded-full',
            'bg-white shadow ring-0 transition duration-200 ease-in-out',
            checked ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </HeadlessSwitch>
    </HeadlessSwitch.Group>
  );
}

export default Switch;
