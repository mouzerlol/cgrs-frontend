'use client';

import { useState, useRef, useEffect, useId, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TooltipProps {
  content: string;
  children: ReactNode;
  className?: string;
  position?: 'top' | 'bottom';
}

/**
 * Lightweight tooltip wrapper. Shows a labeled tooltip above/below the trigger
 * after a 300ms hover/focus delay. Matches the forest/bone design system.
 */
export function Tooltip({ content, children, className, position = 'top' }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const id = useId();

  const show = () => {
    timerRef.current = setTimeout(() => setVisible(true), 300);
  };

  const hide = () => {
    clearTimeout(timerRef.current);
    setVisible(false);
  };

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  return (
    <div
      className={cn('relative inline-flex', className)}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      <div
        id={id}
        role="tooltip"
        aria-hidden={!visible}
        className={cn(
          'absolute left-1/2 -translate-x-1/2 z-50',
          position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2',
          'pointer-events-none whitespace-nowrap select-none',
          'bg-forest text-bone text-xs font-medium px-2 py-1 rounded-md',
          'transition-all duration-150 ease-out',
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
        )}
      >
        {content}
        <span
          className={cn(
            'absolute left-1/2 -translate-x-1/2 border-[4px] border-transparent',
            position === 'top' ? 'top-full border-t-forest' : 'bottom-full border-b-forest'
          )}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
