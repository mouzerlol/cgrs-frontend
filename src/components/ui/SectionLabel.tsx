import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface SectionLabelProps {
  children: React.ReactNode;
  variant?: 'default' | 'muted';
  as?: 'p' | 'h3' | 'h4' | 'span';
  className?: string;
}

const variantStyles = {
  default: 'font-body text-xs font-semibold uppercase tracking-[0.15em] text-terracotta',
  muted: 'font-display text-[10px] font-bold text-forest/40 uppercase tracking-widest',
};

const SectionLabel = forwardRef<HTMLElement, SectionLabelProps>(
  ({ children, variant = 'default', as: Tag = 'p', className, ...props }, ref) => (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      className={cn(variantStyles[variant], className)}
      {...props}
    >
      {children}
    </Tag>
  ),
);

SectionLabel.displayName = 'SectionLabel';

export { SectionLabel };
export type { SectionLabelProps };
export default SectionLabel;
