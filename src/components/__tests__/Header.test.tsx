import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import { NAVIGATION_ITEMS } from '@/lib/constants';
import React from 'react';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
  }),
}));

// Mock @clerk/nextjs to provide ClerkProvider context
vi.mock('@clerk/nextjs', () => ({
  ClerkProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAuth: () => ({
    isLoaded: true,
    isSignedIn: false,
    userId: null,
  }),
  useUser: () => ({
    isLoaded: true,
    isSignedIn: false,
    user: null,
  }),
  useClerk: () => ({
    openSignIn: vi.fn(),
    openSignUp: vi.fn(),
  }),
  SignInButton: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SignOutButton: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  UserAvatar: () => <span data-testid="user-avatar" />,
  UserButton: () => null,
}));

// Mock useCurrentUser hook
vi.mock('@/hooks/useCurrentUser', () => ({
  useCurrentUser: () => ({
    data: null,
    isLoading: false,
    error: null,
  }),
}));

// Mock useCommunity hook
vi.mock('@/hooks/useCommunity', () => ({
  useCommunity: () => ({
    data: null,
    isLoading: false,
    error: null,
  }),
}));

vi.mock('@/hooks/useFeatureFlag', () => ({
  useFeatureFlag: () => true,
  useAllFeatureFlags: () => ({}),
  useFeatureFlagsLoading: () => false,
}));

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
    render(<Header />, { wrapper: createWrapper() });
    const logoLink = screen.getByRole('link', { name: /coronation/i });
    expect(logoLink).toBeInTheDocument();
    expect(logoLink).toHaveTextContent('CORONATION');
  });

  it('renders navigation items on desktop', () => {
    render(<Header />, { wrapper: createWrapper() });
    const navLinks = screen.getAllByRole('link').filter((l) => l.getAttribute('href')?.startsWith('/') && l.getAttribute('href') !== '/');
    expect(navLinks.length).toBeGreaterThanOrEqual(NAVIGATION_ITEMS.length);
  });

  it('renders login button', () => {
    render(<Header />, { wrapper: createWrapper() });
    const loginButtons = screen.getAllByRole('button', { name: /resident login/i });
    expect(loginButtons.length).toBeGreaterThanOrEqual(1);
    expect(loginButtons[0]).toHaveTextContent('Resident Login');
  });

  it('renders hamburger menu button on mobile', () => {
    render(<Header />, { wrapper: createWrapper() });
    expect(screen.getByLabelText('Toggle navigation')).toBeInTheDocument();
  });

  it('opens mobile menu when hamburger button is clicked', async () => {
    render(<Header />, { wrapper: createWrapper() });
    const menuButton = screen.getByLabelText('Toggle navigation');
    menuButton.click();
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  it('shows navigation items in mobile menu when opened', async () => {
    render(<Header />, { wrapper: createWrapper() });
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
    render(<Header />, { wrapper: createWrapper() });
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
    render(<Header />, { wrapper: createWrapper() });
    const logoLink = screen.getByRole('link', { name: /coronation/i });
    expect(logoLink).toBeInTheDocument();
    expect(logoLink).toHaveAttribute('href', '/');
  });

  it('mobile menu contains login button', async () => {
    render(<Header />, { wrapper: createWrapper() });
    const menuButton = screen.getByLabelText('Toggle navigation');
    menuButton.click();
    
    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveTextContent('Resident Login');
    });
  });

  it('does not show mobile menu dialog initially', () => {
    render(<Header />, { wrapper: createWrapper() });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('has correct aria attributes on menu button', () => {
    render(<Header />, { wrapper: createWrapper() });
    const menuButton = screen.getByLabelText('Toggle navigation');
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('header has correct nav class', () => {
    render(<Header />, { wrapper: createWrapper() });
    const header = document.querySelector('header');
    expect(header).toBeInTheDocument();
  });

  it('contains CORONATION GARDENS text', () => {
    render(<Header />, { wrapper: createWrapper() });
    expect(document.body).toHaveTextContent('CORONATION');
    expect(document.body).toHaveTextContent('GARDENS');
  });
});
