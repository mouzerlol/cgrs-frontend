import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Card from '@/components/ui/Card';

describe('Card', () => {
  it('renders children correctly', () => {
    render(<Card>Test Content</Card>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies default variant styles', () => {
    render(<Card data-testid="card" />);
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('bg-white');
  });

  it('applies sage variant styles', () => {
    render(<Card variant="sage" data-testid="card" />);
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('bg-sage-light');
  });

  it('applies accent variant styles', () => {
    render(<Card variant="accent" data-testid="card" />);
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('bg-terracotta');
  });

  it('applies hover styles when enabled', () => {
    render(<Card hover data-testid="card" />);
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('hover:-translate-y-2');
    expect(card).toHaveClass('cursor-pointer');
  });

  it('applies custom className', () => {
    render(<Card className="custom-class" data-testid="card" />);
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('custom-class');
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<Card ref={ref}>Ref Test</Card>);
    expect(ref.current).not.toBeNull();
  });

  it('applies all variant options', () => {
    const variants = ['news', 'event', 'committee', 'cta'] as const;
    variants.forEach((variant) => {
      render(<Card variant={variant} data-testid={`card-${variant}`} />);
      expect(screen.getByTestId(`card-${variant}`)).toBeInTheDocument();
    });
  });
});
