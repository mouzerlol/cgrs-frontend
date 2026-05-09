import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { CurrentUserResponse } from '@/hooks/useCurrentUser';
import WorkManagementHub from '../page';

const mockUseCurrentUser = vi.fn();

vi.mock('@/hooks/useCurrentUser', () => ({
  useCurrentUser: () => mockUseCurrentUser(),
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...rest }: { children?: React.ReactNode }) => <div {...rest}>{children}</div>,
  },
}));

const superadminUser: CurrentUserResponse = {
  user: {
    id: 'u1',
    clerk_user_id: 'clerk_1',
    email: 'admin@example.com',
    first_name: 'Admin',
    last_name: 'User',
    avatar_url: null,
    created_at: '2020-01-01T00:00:00Z',
  },
  membership: null,
  is_superadmin: true,
  capabilities: [],
};

const residentUser: CurrentUserResponse = {
  ...superadminUser,
  is_superadmin: false,
};

describe('WorkManagementHub', () => {
  beforeEach(() => {
    mockUseCurrentUser.mockReset();
  });

  it('shows the Signatures card for a superadmin', () => {
    mockUseCurrentUser.mockReturnValue({ data: superadminUser, isLoading: false });
    render(<WorkManagementHub />);

    const link = screen.getByRole('link', { name: /signatures/i });
    expect(link).toHaveAttribute('href', '/work-management/signatures');
  });

  it('omits the Signatures card for a non-superadmin', () => {
    mockUseCurrentUser.mockReturnValue({ data: residentUser, isLoading: false });
    render(<WorkManagementHub />);

    expect(screen.queryByRole('link', { name: /signatures/i })).not.toBeInTheDocument();
  });
});
