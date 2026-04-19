import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const { capturedMenuItemsProps } = vi.hoisted(() => ({
  capturedMenuItemsProps: [] as { modal?: boolean }[],
}));

vi.mock('@headlessui/react', () => {
  return {
    Menu: ({ children, className }: { children: React.ReactNode; className?: string }) => (
      <div className={className}>{children}</div>
    ),
    MenuButton: ({
      children,
      className,
      'aria-label': ariaLabel,
      type,
    }: {
      children: React.ReactNode;
      className?: string;
      'aria-label'?: string;
      type?: string;
    }) => (
      <button type={type ?? 'button'} className={className} aria-label={ariaLabel}>
        {children}
      </button>
    ),
    MenuItems: (props: { modal?: boolean; children?: React.ReactNode; className?: string }) => {
      capturedMenuItemsProps.push({ modal: props.modal });
      return (
        <div data-testid="headless-menu-items" data-modal={String(props.modal)}>
          {props.children}
        </div>
      );
    },
    MenuItem: ({ children }: { children: (bag: { focus: boolean }) => React.ReactNode }) => (
      <>{children({ focus: false })}</>
    ),
    Transition: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

import ClerkAppUserButton from '@/components/layout/ClerkAppUserButton';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  Wrapper.displayName = 'QueryClientTestWrapper';
  return Wrapper;
}

vi.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    isLoaded: true,
    user: {
      firstName: 'Test',
      lastName: 'User',
      username: null,
      primaryEmailAddress: { emailAddress: 'test@example.com' },
    },
  }),
  useAuth: () => ({}),
  SignOutButton: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  UserAvatar: () => <span data-testid="user-avatar" />,
}));

vi.mock('@/hooks/useCurrentUser', () => ({
  useCurrentUser: () => ({
    data: { membership: { role: 'resident' }, is_superadmin: false },
    isLoading: false,
    error: null,
  }),
}));

vi.mock('@/lib/app-url', () => ({
  getAfterSignOutUrl: () => 'http://localhost/logout',
}));

vi.mock('next/link', () => ({
  default ({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  },
}));

describe('ClerkAppUserButton', () => {
  beforeEach(() => {
    capturedMenuItemsProps.length = 0;
  });

  it('passes modal=false to MenuItems so opening the menu does not lock body scroll', () => {
    render(<ClerkAppUserButton />, { wrapper: createWrapper() });

    expect(capturedMenuItemsProps.length).toBeGreaterThanOrEqual(1);
    expect(capturedMenuItemsProps.some((p) => p.modal === false)).toBe(true);
    const panel = screen.getByTestId('headless-menu-items');
    expect(panel).toHaveAttribute('data-modal', 'false');
  });

  it('renders account trigger when user is loaded', () => {
    render(<ClerkAppUserButton />, { wrapper: createWrapper() });
    expect(screen.getByTestId('user-avatar')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /account menu/i })).toBeInTheDocument();
  });

  it('uses a heavy-stroke chevron on the avatar menu trigger for visibility', () => {
    const { container } = render(<ClerkAppUserButton />, { wrapper: createWrapper() });
    const chevron = container.querySelector('button[aria-label*="Account menu"] svg');
    expect(chevron).toBeTruthy();
    expect(chevron).toHaveAttribute('stroke-width', '3.5');
  });
});
