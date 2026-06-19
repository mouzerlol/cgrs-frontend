import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusBadge from '@/components/ui/StatusBadge';

describe('StatusBadge', () => {
  it('renders the default status label', () => {
    render(<StatusBadge status="in_progress" />);
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('honours a custom label', () => {
    render(<StatusBadge status="closed" label="Request closed" />);
    expect(screen.getByText('Request closed')).toBeInTheDocument();
  });

  it('uses amber + a pulsing dot for open on the management surface', () => {
    const { container } = render(<StatusBadge status="open" />);
    const badge = screen.getByText('Open').closest('span');
    expect(badge?.className).toContain('bg-amber/15');
    // pulsing alarm dot present
    expect(container.querySelector('.animate-\\[poll-pulse_2s_infinite\\]')).not.toBeNull();
  });

  it('renders open calmly on the community surface (no amber alarm, no pulse)', () => {
    const { container } = render(<StatusBadge status="open" surface="community" />);
    const badge = screen.getByText('Open').closest('span');
    expect(badge?.className).toContain('bg-forest/5');
    expect(badge?.className).not.toContain('bg-amber/15');
    // calm: static dot, no pulse animation
    expect(container.querySelector('.animate-\\[poll-pulse_2s_infinite\\]')).toBeNull();
  });
});
