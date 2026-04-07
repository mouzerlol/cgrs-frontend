import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { CurrentUserResponse } from '@/hooks/useCurrentUser';
import ProfileLayout from '../layout';

const mockPathname = vi.fn(() => '/profile/reported-issues');

const mockUserData: CurrentUserResponse = {
  user: {
    id: 'u1',
    clerk_user_id: 'clerk_1',
    email: 'a@example.com',
    first_name: 'A',
    last_name: 'B',
    avatar_url: null,
    created_at: '2020-01-01T00:00:00Z',
  },
  membership: null,
  is_superadmin: false,
  capabilities: [],
};

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
  useRouter: () => ({ prefetch: vi.fn(), push: vi.fn() }),
}));

vi.mock('@clerk/nextjs', () => ({
  useAuth: () => ({ isLoaded: true, isSignedIn: true }),
  useUser: () => ({ user: null }),
  SignInButton: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/hooks/useProfileData', () => ({
  useCurrentUserQuery: () => ({ data: mockUserData, isLoading: false, error: null }),
  useVerificationStatusQuery: () => ({ data: { has_pending_request: false } }),
}));

vi.mock('@iconify/react', () => ({
  Icon: () => <span data-testid="icon" />,
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useReducedMotion: () => true,
}));

vi.mock('@/components/profile/ProfileHero', () => ({
  default: () => <div data-testid="profile-hero" />,
}));
vi.mock('@/components/profile/ProfileSideNav', () => ({
  default: () => <nav data-testid="profile-sidenav" />,
}));
vi.mock('@/components/profile/ProfileSkeleton', () => ({
  default: () => <div data-testid="profile-skeleton" />,
}));
vi.mock('@/components/profile/sections/VerificationSection', () => ({
  default: () => <div data-testid="verification-section" />,
}));
vi.mock('@/components/profile/sections/ProfileDetailsSection', () => ({
  default: () => <div data-testid="details-section" />,
}));
vi.mock('@/components/profile/sections/ReportedIssuesSection', () => ({
  default: () => <div data-testid="reported-issues-list" />,
}));
vi.mock('@/components/profile/sections/MyPropertySection', () => ({
  default: () => <div data-testid="my-property-section" />,
}));

describe('ProfileLayout', () => {
  beforeEach(() => {
    mockPathname.mockReturnValue('/profile/reported-issues');
  });

  it('renders ReportedIssuesSection for /profile/reported-issues (list) and not nested route children', () => {
    render(
      <ProfileLayout>
        <div data-testid="nested-route-child">Issue detail</div>
      </ProfileLayout>
    );

    expect(screen.getByTestId('reported-issues-list')).toBeInTheDocument();
    expect(screen.queryByTestId('nested-route-child')).not.toBeInTheDocument();
  });

  it('renders nested route children for /profile/reported-issues/<id> instead of the list section', () => {
    mockPathname.mockReturnValue('/profile/reported-issues/28b81a2e-1d4d-4109-981d-d5ee4bba704d');

    render(
      <ProfileLayout>
        <div data-testid="nested-route-child">Issue detail</div>
      </ProfileLayout>
    );

    expect(screen.queryByTestId('reported-issues-list')).not.toBeInTheDocument();
    expect(screen.getByTestId('nested-route-child')).toHaveTextContent('Issue detail');
  });

  it('renders ProfileDetailsSection on /profile and does not mount reported-issues list or nested children', () => {
    mockPathname.mockReturnValue('/profile');

    render(
      <ProfileLayout>
        <div data-testid="nested-route-child">Should not show</div>
      </ProfileLayout>
    );

    expect(screen.getByTestId('details-section')).toBeInTheDocument();
    expect(screen.queryByTestId('reported-issues-list')).not.toBeInTheDocument();
    expect(screen.queryByTestId('nested-route-child')).not.toBeInTheDocument();
  });
});
