'use client';

import { Icon } from '@iconify/react';

interface PinIndicatorProps {
  className?: string;
}

/**
 * Pin indicator badge for pinned threads.
 * Displays a visual indicator with pin icon.
 */
export default function PinIndicator({ className }: PinIndicatorProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 bg-terracotta/10 text-terracotta text-sm font-semibold rounded-full ${className || ''}`}
    >
      <Icon icon="lucide:pin" className="w-4 h-4" />
      Pinned
    </span>
  );
}
