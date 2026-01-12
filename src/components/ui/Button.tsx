import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'nav';
  size?: 'sm' | 'md' | 'lg';
  asChild?: boolean;
}

/**
 * Button component with terracotta/forest design system.
 * Variants: primary (terracotta), outline (forest border), ghost (transparent), nav (bone border)
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', asChild = false, ...props }, ref) => {
    const baseClasses = [
      'inline-flex items-center justify-center',
      'font-medium tracking-wide',
      'transition-all duration-300',
      'rounded cursor-pointer',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
    ].join(' ');

    const variants = {
      primary: [
        'bg-terracotta text-bone',
        'hover:bg-terracotta-dark hover:-translate-y-0.5',
        'active:translate-y-0',
        'focus:ring-terracotta',
        'shadow-[0_4px_14px_rgba(217,93,57,0.25)]',
        'hover:shadow-[0_6px_20px_rgba(217,93,57,0.35)]',
      ].join(' '),
      outline: [
        'border border-forest text-forest bg-transparent',
        'hover:bg-forest hover:text-bone',
        'focus:ring-forest',
      ].join(' '),
      ghost: [
        'text-forest bg-transparent',
        'hover:bg-sage-light',
        'focus:ring-sage',
      ].join(' '),
      nav: [
        'border border-bone text-bone bg-transparent',
        'hover:bg-bone hover:text-forest',
        'focus:ring-bone',
        'text-sm uppercase tracking-wider',
      ].join(' '),
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-5 py-2.5 text-base',
      lg: 'px-8 py-3.5 text-lg',
    };

    const classes = cn(
      baseClasses,
      variants[variant],
      sizes[size],
      className
    );

    if (asChild) {
      return <span className={classes} ref={ref as React.Ref<HTMLSpanElement>} {...props} />;
    }

    return (
      <button
        className={classes}
        ref={ref}
        suppressHydrationWarning
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export default Button;
