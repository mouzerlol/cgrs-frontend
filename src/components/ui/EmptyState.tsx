import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  icon: React.ReactNode;
  title?: string;
  description: string;
  action?: React.ReactNode;
}

const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ icon, title, description, action, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex flex-col items-center justify-center py-16 text-center',
        className,
      )}
      {...props}
    >
      <div className="w-16 h-16 rounded-full bg-sage-light flex items-center justify-center mb-4">
        {icon}
      </div>
      {title && (
        <h3 className="font-display text-lg font-semibold text-forest mb-2">
          {title}
        </h3>
      )}
      <p className="text-forest/60 text-sm max-w-sm">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  ),
);

EmptyState.displayName = 'EmptyState';

export { EmptyState };
export type { EmptyStateProps };
export default EmptyState;
