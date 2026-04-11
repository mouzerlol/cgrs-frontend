import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BreadcrumbBar } from '@/components/ui/BreadcrumbBar';

describe('BreadcrumbBar', () => {
  it('renders children', () => {
    render(
      <BreadcrumbBar>
        <span>Trail</span>
      </BreadcrumbBar>
    );
    expect(screen.getByText('Trail')).toBeInTheDocument();
  });

  it('uses a borderless bone surface', () => {
    render(
      <BreadcrumbBar>
        <span data-testid="inner">x</span>
      </BreadcrumbBar>
    );
    const surface = screen.getByTestId('inner').closest('.relative');
    expect(surface).toBeTruthy();
    expect(surface).toHaveClass('bg-bone');
    expect(surface).toHaveClass('border-0');
    expect(surface?.className).not.toMatch(/border-t/);
  });
});
