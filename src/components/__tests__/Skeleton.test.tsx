import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Skeleton, SkeletonText } from '@/components/ui/Skeleton';

describe('Skeleton', () => {
  it('renders with default classes', () => {
    render(<Skeleton data-testid="skeleton" />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('animate-pulse');
    expect(skeleton).toHaveClass('bg-sage-light');
    expect(skeleton).toHaveClass('rounded');
  });

  it('applies custom className', () => {
    render(<Skeleton className="custom-skeleton" data-testid="skeleton" />);
    expect(screen.getByTestId('skeleton')).toHaveClass('custom-skeleton');
  });
});

describe('SkeletonText', () => {
  it('renders single line by default', () => {
    render(<SkeletonText data-testid="skeleton-text" />);
    expect(screen.getByTestId('skeleton-text').children.length).toBe(1);
  });

  it('renders multiple lines', () => {
    render(<SkeletonText lines={3} data-testid="skeleton-text" />);
    expect(screen.getByTestId('skeleton-text').children.length).toBe(3);
  });

  it('applies custom className', () => {
    render(<SkeletonText className="custom-text" data-testid="skeleton-text" />);
    expect(screen.getByTestId('skeleton-text')).toHaveClass('custom-text');
  });
});
