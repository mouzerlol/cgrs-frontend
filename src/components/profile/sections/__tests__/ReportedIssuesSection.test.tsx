import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ReportedIssuesSection from '@/components/profile/sections/ReportedIssuesSection';

vi.mock('@/hooks/useProfileData', () => ({
  useManagementRequestsQuery: vi.fn(() => ({
    data: [
      {
        request: {
          id: '123',
          category: 'maintenance',
          status: 'open',
          submitted_at: '2025-01-01T00:00:00Z',
        },
        task: {
          title: 'Leaking tap',
        },
      },
    ],
    isLoading: false,
    error: null,
  })),
}));

describe('ReportedIssuesSection', () => {
  it('renders a list of reported issues', () => {
    render(<ReportedIssuesSection />);
    
    expect(screen.getByRole('heading', { name: /reported issues/i })).toBeInTheDocument();
    expect(screen.getByText('Leaking tap')).toBeInTheDocument();
    expect(screen.getByText('Maintenance')).toBeInTheDocument();
  });
});
