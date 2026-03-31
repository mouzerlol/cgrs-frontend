import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface DateBadgeProps extends HTMLAttributes<HTMLDivElement> {
  day: string;
  month: string;
  size?: 'sm' | 'md';
}

const sizeStyles = {
  sm: { container: 'w-12 h-14', day: 'text-lg' },
  md: { container: 'w-14 h-16', day: 'text-xl' },
};

const DateBadge = forwardRef<HTMLDivElement, DateBadgeProps>(
  ({ day, month, size = 'sm', className, ...props }, ref) => {
    const styles = sizeStyles[size];

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center bg-terracotta text-bone rounded-lg shadow-sm',
          styles.container,
          className,
        )}
        {...props}
      >
        <span className={cn('font-display font-bold leading-none', styles.day)}>
          {day}
        </span>
        <span className="text-[0.65rem] uppercase tracking-wider leading-none mt-0.5">
          {month}
        </span>
      </div>
    );
  },
);

DateBadge.displayName = 'DateBadge';

export { DateBadge };
export type { DateBadgeProps };
export default DateBadge;
