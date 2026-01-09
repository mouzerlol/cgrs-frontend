import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Dropdown } from '@/components/ui/Dropdown';

const mockItems = [
  { label: 'Profile', href: '/profile' },
  { label: 'Settings', href: '/settings' },
  { label: 'Logout', onClick: vi.fn() },
];

const mockTrigger = <button>Menu</button>;

describe('Dropdown', () => {
  beforeEach(() => {
    vi.stubGlobal('ResizeObserver', class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    });
  });

  it('renders trigger button', () => {
    render(<Dropdown trigger={mockTrigger} items={mockItems} />);
    expect(screen.getByRole('button', { name: 'Menu' })).toBeInTheDocument();
  });

  it('renders dropdown container', () => {
    render(<Dropdown trigger={mockTrigger} items={mockItems} />);
    const dropdown = document.querySelector('[class*="relative"]');
    expect(dropdown).toBeInTheDocument();
  });

  it('has menu button', () => {
    render(<Dropdown trigger={mockTrigger} items={mockItems} />);
    const button = document.querySelector('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Menu');
  });

  it('renders with correct structure', () => {
    const { container } = render(<Dropdown trigger={mockTrigger} items={mockItems} />);
    expect(container.firstChild).toHaveClass('relative');
  });
});
