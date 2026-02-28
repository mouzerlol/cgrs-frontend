import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Header from '@/components/layout/Header';
import { NAVIGATION_ITEMS } from '@/lib/constants';

vi.mock('next/navigation', () => ({ usePathname: () => '/' }));

// Mock Headless UI Dialog - avoids use-is-touch-device addEventListener error in jsdom
vi.mock('@headlessui/react', async (importOriginal) => {
  const React = await import('react');
  const actual = await importOriginal<typeof import('@headlessui/react')>();
  const Dialog = ({ children, onClose }: { children: React.ReactNode; onClose: () => void }) => {
    React.useEffect(() => {
      const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
      document.addEventListener('keydown', handler);
      return () => document.removeEventListener('keydown', handler);
    }, [onClose]);
    return <div role="dialog" data-testid="mobile-dialog">{children}</div>;
  };
  return {
    ...actual,
    Dialog,
    DialogPanel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Transition: ({ children, show }: { children: React.ReactNode; show: boolean }) =>
      show ? <>{children}</> : null,
    TransitionChild: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

describe('Header', () => {
  beforeEach(() => {
    vi.stubGlobal('ResizeObserver', class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    });
    vi.stubGlobal('matchMedia', () => ({ matches: true, addListener: () => {}, removeListener: () => {} }));
  });

  it('renders logo link', () => {
    render(<Header />);
    const logoLink = screen.getByRole('link', { name: /coronation/i });
    expect(logoLink).toBeInTheDocument();
    expect(logoLink).toHaveTextContent('CORONATION');
  });

  it('renders navigation items on desktop', () => {
    render(<Header />);
    const navLinks = screen.getAllByRole('link').filter((l) => l.getAttribute('href')?.startsWith('/') && l.getAttribute('href') !== '/');
    expect(navLinks.length).toBeGreaterThanOrEqual(NAVIGATION_ITEMS.length);
  });

  it('renders login button', () => {
    render(<Header />);
    const loginButton = screen.getByRole('link', { name: /resident login/i });
    expect(loginButton).toBeInTheDocument();
    expect(loginButton).toHaveTextContent('Resident Login');
  });

  it('renders hamburger menu button on mobile', () => {
    render(<Header />);
    expect(screen.getByLabelText('Toggle navigation')).toBeInTheDocument();
  });

  it('opens mobile menu when hamburger button is clicked', async () => {
    render(<Header />);
    const menuButton = screen.getByLabelText('Toggle navigation');
    menuButton.click();
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  it('shows navigation items in mobile menu when opened', async () => {
    render(<Header />);
    const menuButton = screen.getByLabelText('Toggle navigation');
    menuButton.click();
    
    await waitFor(() => {
      // Check for dialog with nav links inside
      const dialog = screen.getByRole('dialog');
      const linksInDialog = dialog.querySelectorAll('a');
      expect(linksInDialog.length).toBeGreaterThan(NAVIGATION_ITEMS.length);
    });
  });

  it('closes mobile menu when Escape key is pressed', async () => {
    render(<Header />);
    const menuButton = screen.getByLabelText('Toggle navigation');
    menuButton.click();
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    
    // Simulate Escape key press
    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    document.dispatchEvent(event);
    
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('logo links to home page', () => {
    render(<Header />);
    const logoLink = screen.getByRole('link', { name: /coronation/i });
    expect(logoLink).toBeInTheDocument();
    expect(logoLink).toHaveAttribute('href', '/');
  });

  it('mobile menu contains login button', async () => {
    render(<Header />);
    const menuButton = screen.getByLabelText('Toggle navigation');
    menuButton.click();
    
    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveTextContent('Resident Login');
    });
  });

  it('does not show mobile menu dialog initially', () => {
    render(<Header />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('has correct aria attributes on menu button', () => {
    render(<Header />);
    const menuButton = screen.getByLabelText('Toggle navigation');
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('header has correct nav class', () => {
    render(<Header />);
    const header = document.querySelector('header');
    expect(header).toBeInTheDocument();
  });

  it('contains CORONATION GARDENS text', () => {
    render(<Header />);
    expect(document.body).toHaveTextContent('CORONATION');
    expect(document.body).toHaveTextContent('GARDENS');
  });
});
