import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PropertyBadge from '@/components/profile/verification/PropertyBadge';

describe('PropertyBadge', () => {
  it('renders the street address', () => {
    render(<PropertyBadge streetName="Huri Street" streetNumber="41" verificationType="owner" />);
    expect(screen.getByText('41 Huri Street')).toBeInTheDocument();
  });

  it('renders a role label for an owner', () => {
    render(<PropertyBadge streetName="Huri Street" streetNumber="41" verificationType="owner" />);
    expect(screen.getByText(/owner/i)).toBeInTheDocument();
  });

  it('renders a role label for a resident', () => {
    render(<PropertyBadge streetName="Huri Street" streetNumber="45" verificationType="resident" />);
    expect(screen.getByText(/resident/i)).toBeInTheDocument();
  });

  it('applies a distinct accent for owner vs resident', () => {
    const { rerender } = render(
      <PropertyBadge streetName="Huri Street" streetNumber="41" verificationType="owner" />,
    );
    expect(screen.getByTestId('property-badge')).toHaveAttribute('data-role', 'owner');

    rerender(<PropertyBadge streetName="Huri Street" streetNumber="45" verificationType="resident" />);
    expect(screen.getByTestId('property-badge')).toHaveAttribute('data-role', 'resident');
  });

  it('contains a decorative SVG house figure', () => {
    render(<PropertyBadge streetName="Huri Street" streetNumber="41" verificationType="owner" />);
    const badge = screen.getByTestId('property-badge');
    const svg = badge.querySelector('svg');
    expect(svg).toBeTruthy();
    // Decorative: hidden from assistive tech (address/role carry the meaning).
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('is a thin status emblem — no photo, map, or room stats', () => {
    render(<PropertyBadge streetName="Huri Street" streetNumber="41" verificationType="owner" />);
    expect(screen.queryByTestId('property-map')).not.toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.queryByText(/bedroom/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/bathroom/i)).not.toBeInTheDocument();
  });
});
