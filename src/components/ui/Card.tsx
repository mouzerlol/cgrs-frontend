import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  variant?: 'default' | 'sage' | 'accent' | 'news' | 'event' | 'committee' | 'cta';
  image?: string;
  imageAlt?: string;
  date?: { day: string; month: string };
  category?: string;
}

/**
 * Card component with sage-light design system.
 * Variants: default (white), sage (sage-light bg), accent (terracotta bg), news, event, committee, cta
 */
const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = false, variant = 'default', ...props }, ref) => {
    const baseClasses = [
      'relative rounded-[20px] overflow-hidden',
      'transition-all duration-400',
      'border border-sage/20',
    ].join(' ');

    const variants: Record<string, string> = {
      default: 'bg-white',
      sage: 'bg-sage-light',
      accent: 'bg-terracotta text-bone border-terracotta',
      news: 'bg-white',
      event: 'bg-white',
      committee: 'bg-white',
      cta: 'bg-sage-light',
    };

    const hoverClasses = hover
      ? 'hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(26,34,24,0.12)] hover:border-sage cursor-pointer'
      : '';

    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          variants[variant] || variants.default,
          hoverClasses,
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';

export default Card;

/**
 * Card Image Wrapper - For news/feature cards with images.
 */
export const CardImageWrapper = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'relative h-[200px] md:h-[250px] overflow-hidden',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);

CardImageWrapper.displayName = 'CardImageWrapper';

/**
 * Card Content - Padding wrapper for card content.
 */
export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('p-6', className)}
      {...props}
    />
  )
);

CardContent.displayName = 'CardContent';
