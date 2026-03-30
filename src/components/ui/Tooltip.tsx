'use client';

import { useState, useRef, useEffect, useId, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TooltipProps {
  content: string;
  children: ReactNode;
  className?: string;
}

/**
 * Lightweight tooltip wrapper. Shows a labeled tooltip above the trigger
 * after a 300ms hover/focus delay. Matches the forest/bone design system.
 */
export function Tooltip({ content, children, className }: TooltipProps) {
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
          'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50',
          'pointer-events-none whitespace-nowrap select-none',
          'bg-forest text-bone text-xs font-medium px-2 py-1 rounded-md',
          'transition-all duration-150 ease-out',
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
        )}
      >
        {content}
        <span
          className="absolute top-full left-1/2 -translate-x-1/2 border-[4px] border-transparent border-t-forest"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
