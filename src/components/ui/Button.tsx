"use client";

import { ButtonHTMLAttributes, Children, cloneElement, forwardRef, isValidElement, ReactElement, useState } from 'react';
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
  ({ className, variant = 'primary', size = 'md', asChild = false, onClick, disabled, children, ...props }, ref) => {
    const [isPressed, setIsPressed] = useState(false);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) return;
      setIsPressed(true);
      setTimeout(() => setIsPressed(false), 150);
      onClick?.(e);
    };

    const baseClasses = [
      'inline-flex items-center justify-center',
      'font-medium tracking-wide',
      'transition-colors, transition-transform, transition-opacity duration-300',
      'rounded cursor-pointer',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      isPressed ? 'scale-95 opacity-90' : '',
      disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '',
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

    // Merge the button styles onto the single child (e.g. a Link) rather than
    // wrapping it. A wrapper span keeps the padding, so the child anchor only
    // covers its text and the padding ring around it navigates nowhere.
    if (asChild && isValidElement(children)) {
      const child = Children.only(children) as ReactElement<any>;
      const childOnClick = child.props.onClick as ((e: React.MouseEvent) => void) | undefined;
      return cloneElement(child, {
        ...props,
        ref,
        className: cn(classes, child.props.className),
        onClick: (e: React.MouseEvent) => {
          childOnClick?.(e);
          onClick?.(e as React.MouseEvent<HTMLButtonElement>);
        },
      } as any);
    }

    return (
      <button
        className={classes}
        ref={ref}
        suppressHydrationWarning
        onClick={handleClick}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
