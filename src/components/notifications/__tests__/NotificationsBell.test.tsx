import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useUnreadCount, useNotifications } from '@/hooks/useNotifications';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import NotificationsBell from '@/components/notifications/NotificationsBell';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return Wrapper;
}

const signedOutAuth = {
  isLoaded: true,
  isSignedIn: false,
  userId: null,
  getToken: vi.fn(),
};

const signedInAuth = {
  isLoaded: true,
  isSignedIn: true,
  userId: 'user_123',
  getToken: vi.fn().mockResolvedValue('token'),
};

const signedInUser = {
  isLoaded: true,
  isSignedIn: true,
  user: { id: 'user_123', primaryEmailAddress: { emailAddress: 'test@example.com' } },
};

const signedOutUser = {
  isLoaded: true,
  isSignedIn: false,
  user: null,
};

vi.mock('@clerk/nextjs');

vi.mock('@/hooks/useNotifications', () => ({
  useUnreadCount: vi.fn(() => ({ data: null })),
  useNotifications: vi.fn(() => ({ data: null, isLoading: false })),
  useMarkRead: vi.fn(),
}));

vi.mock('@/hooks/useMediaQuery', () => ({
  useMediaQuery: vi.fn(() => false),
}));

vi.mock('@headlessui/react', async (importOriginal) => {
  const React = await import('react');
  const actual = await importOriginal<typeof import('@headlessui/react')>();
  const MockPopoverPanel = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  return {
    ...actual,
    Dialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DialogPanel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Popover: ({ children }: { children: React.ReactNode }) => <div data-testid="popover">{children}</div>,
    PopoverButton: ({ children, 'aria-label': ariaLabel }: { children: React.ReactNode; 'aria-label'?: string }) => (
      <button type="button" aria-label={ariaLabel} data-testid="popover-button">{children}</button>
    ),
    PopoverPanel: MockPopoverPanel,
    Transition: ({ children, show }: { children: React.ReactNode; show?: boolean }) =>
      show ? <>{children}</> : null,
    TransitionChild: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

describe('NotificationsBell', () => {
  beforeEach(() => {
    vi.stubGlobal('ResizeObserver', class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    });
    vi.clearAllMocks();
  });

  it('does not render bell when user is signed out', () => {
    vi.mocked(useAuth).mockReturnValue(signedOutAuth);
    vi.mocked(useUser).mockReturnValue(signedOutUser);
    render(<NotificationsBell />, { wrapper: createWrapper() });
    expect(screen.queryByRole('button', { name: /notifications/i })).not.toBeInTheDocument();
  });

  it('renders bell button when user is signed in', () => {
    vi.mocked(useAuth).mockReturnValue(signedInAuth);
    vi.mocked(useUser).mockReturnValue(signedInUser);
    vi.mocked(useUnreadCount).mockReturnValue({ data: null } as never);
    vi.mocked(useNotifications).mockReturnValue({ data: null, isLoading: false } as never);
    render(<NotificationsBell />, { wrapper: createWrapper() });
    expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument();
  });

  it('does not render badge when unread count is zero', () => {
    vi.mocked(useAuth).mockReturnValue(signedInAuth);
    vi.mocked(useUser).mockReturnValue(signedInUser);
    vi.mocked(useUnreadCount).mockReturnValue({ data: { total: 0, by_section: [] } } as never);
    vi.mocked(useNotifications).mockReturnValue({ data: null, isLoading: false } as never);
    render(<NotificationsBell />, { wrapper: createWrapper() });
    expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument();
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('displays badge with count when unread count > 0', () => {
    vi.mocked(useAuth).mockReturnValue(signedInAuth);
    vi.mocked(useUser).mockReturnValue(signedInUser);
    vi.mocked(useUnreadCount).mockReturnValue({ data: { total: 5, by_section: [] } } as never);
    vi.mocked(useNotifications).mockReturnValue({ data: null, isLoading: false } as never);
    render(<NotificationsBell />, { wrapper: createWrapper() });
    expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument();
    const badge = screen.getByText('5', { selector: '.bg-terracotta' });
    expect(badge).toBeInTheDocument();
  });

  it('displays 9+ when unread count exceeds 9', () => {
    vi.mocked(useAuth).mockReturnValue(signedInAuth);
    vi.mocked(useUser).mockReturnValue(signedInUser);
    vi.mocked(useUnreadCount).mockReturnValue({ data: { total: 15, by_section: [] } } as never);
    vi.mocked(useNotifications).mockReturnValue({ data: null, isLoading: false } as never);
    render(<NotificationsBell />, { wrapper: createWrapper() });
    const badge = screen.getByText('9+', { selector: '.bg-terracotta' });
    expect(badge).toBeInTheDocument();
  });
});
