import { cn } from '@/lib/utils';

type BadgeVariant =
  | 'default'
  | 'outline'
  | 'forest'
  | 'terracotta'
  | 'amber'
  | 'status-open'
  | 'status-in-progress'
  | 'status-closed'
  | 'status-withdrawn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  shape?: 'square' | 'pill';
  size?: 'xs' | 'sm';
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-sage/10 text-forest border-sage/20',
  outline: 'bg-transparent border-sage/20 text-forest/60',
  forest: 'bg-forest/5 text-forest border-forest/10',
  terracotta: 'bg-terracotta/5 text-terracotta border-terracotta/10',
  amber: 'bg-amber/15 text-amber-dark border-amber/20',
  'status-open': 'bg-amber/15 text-amber-700 border-transparent',
  'status-in-progress': 'bg-sage-light text-forest border-transparent',
  'status-closed': 'bg-forest-light/15 text-forest-light border-transparent',
  'status-withdrawn': 'bg-gray-100 text-gray-500 border-transparent',
};

const shapeStyles = {
  square: 'rounded',
  pill: 'rounded-full',
};

const sizeStyles = {
  xs: 'px-2 py-0.5 text-[10px]',
  sm: 'px-2.5 py-0.5 text-xs',
};

export const Badge = ({
  children,
  variant = 'default',
  shape = 'square',
  size = 'xs',
  className,
}: BadgeProps) => {
  const isStatus = variant.startsWith('status-');

  return (
    <span
      {...(isStatus ? { role: 'status' } : {})}
      className={cn(
        'inline-flex items-center font-semibold uppercase tracking-widest border',
        sizeStyles[size],
        shapeStyles[shape],
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
};

export type { BadgeProps, BadgeVariant };
export default Badge;
