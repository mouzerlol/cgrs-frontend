/**
 * Tests for Navigation component.
 * Navigation items are server-filtered based on user role and feature flags.
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import Navigation from '../Navigation';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
  }),
}));

// Mock Clerk
vi.mock('@clerk/nextjs', () => ({
  useAuth: () => ({
    getToken: vi.fn().mockResolvedValue('test-token'),
    isLoaded: true,
    isSignedIn: false,
    userId: null,
  }),
  SignInButton: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock notifications
vi.mock('@/components/notifications/NotificationsBell', () => ({
  default: () => <div data-testid="notifications-bell">Bell</div>,
}));

// Mock ClerkAppUserButton
vi.mock('@/components/layout/ClerkAppUserButton', () => ({
  default: () => <div data-testid="user-button">User</div>,
}));

// Mock useNavItems hook
vi.mock('@/hooks/useNavItems', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks/useNavItems')>();
  return {
    ...actual,
    useNavItems: () => ({
      data: {
        items: [
          { name: 'About', href: '/about', icon: 'lucide:users' },
          { name: 'Map', href: '/map', icon: 'map' },
        ],
        flags: {
          'nav.about': true,
          'nav.map': true,
          'nav.discussion': false,
        },
      },
      isLoading: false,
      isError: false,
    }),
  };
});

// Mock prefetch
vi.mock('@/lib/discussion-prefetch', () => ({
  prefetchDiscussionCore: vi.fn(),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function QueryClientTestWrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('Navigation', () => {
  beforeEach(() => {
    vi.stubGlobal('ResizeObserver', class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    });
    vi.stubGlobal('matchMedia', () => ({ matches: true, addListener: () => {}, removeListener: () => {} }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Server-filtered navigation items', () => {
    it('renders navigation items returned from server', async () => {
      const Wrapper = createWrapper();
      render(<Navigation />, { wrapper: Wrapper });

      // Navigation should show links from server in the visible nav area
      await waitFor(() => {
        // Use getAllByRole to find link elements (not the hidden measurement spans)
        const aboutLinks = screen.getAllByRole('link', { name: 'About' });
        const mapLinks = screen.getAllByRole('link', { name: 'Map' });

        // Should have at least the visible links (the measurement spans are not links)
        expect(aboutLinks.length).toBeGreaterThanOrEqual(1);
        expect(mapLinks.length).toBeGreaterThanOrEqual(1);

        // Verify the actual href on visible links
        const visibleAboutLink = aboutLinks.find(link => !link.hasAttribute('aria-hidden'));
        const visibleMapLink = mapLinks.find(link => !link.hasAttribute('aria-hidden'));
        expect(visibleAboutLink).toHaveAttribute('href', '/about');
        expect(visibleMapLink).toHaveAttribute('href', '/map');
      });
    });

    it('renders links with correct hrefs', async () => {
      const Wrapper = createWrapper();
      render(<Navigation />, { wrapper: Wrapper });

      await waitFor(() => {
        // Get visible links only (exclude hidden measurement elements)
        const links = screen.getAllByRole('link').filter(link =>
          link.getAttribute('href')?.startsWith('/') &&
          !link.hasAttribute('aria-hidden')
        );

        const aboutLink = links.find(l => l.textContent === 'About');
        const mapLink = links.find(l => l.textContent === 'Map');

        expect(aboutLink).toHaveAttribute('href', '/about');
        expect(mapLink).toHaveAttribute('href', '/map');
      });
    });

    it('shows Resident Login when user is not signed in', async () => {
      const Wrapper = createWrapper();
      render(<Navigation />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText('Resident Login')).toBeInTheDocument();
      });
    });

    it('shows Resident Login button text correctly', async () => {
      const user = userEvent.setup();
      const Wrapper = createWrapper();
      render(<Navigation />, { wrapper: Wrapper });

      const loginButton = screen.getByRole('button', { name: 'Resident Login' });
      expect(loginButton).toBeInTheDocument();
    });
  });
});

describe('useNavItems hook', () => {
  it('useNavItems hook exports are functions', async () => {
    // Just verify the hook functions exist - they are exported from the module
    // The actual behavior is tested through Navigation component tests
    const module = await import('@/hooks/useNavItems');

    expect(typeof module.useNavItems).toBe('function');
  });
});