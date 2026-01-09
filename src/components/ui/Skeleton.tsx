import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  'data-testid'?: string;
}

/**
 * Base skeleton loader component with pulse animation.
 */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-sage-light rounded',
        className
      )}
      {...props}
    />
  );
}

interface SkeletonTextProps {
  lines?: number;
  className?: string;
  'data-testid'?: string;
}

/**
 * Skeleton text with variable width.
 */
export function SkeletonText({ lines = 1, className, ...props }: SkeletonTextProps) {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'}
        />
      ))}
    </div>
  );
}
