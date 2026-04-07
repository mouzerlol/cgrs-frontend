import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SuccessConfirmation } from '../SuccessConfirmation';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@iconify/react', () => ({
  Icon: () => null,
}));

describe('SuccessConfirmation – scroll to top on mount', () => {
  beforeEach(() => {
    // Reset scroll position mock between tests
    vi.mocked(window.scrollTo).mockClear();
  });

  it('scrolls to the top of the page immediately when mounted', async () => {
    await act(async () => {
      render(
        <SuccessConfirmation
          issueId="REQ-001"
          categoryName="Maintenance & Repairs"
          onSubmitAnother={vi.fn()}
          viewRequestHref="/profile/reported-issues/REQ-001"
        />
      );
    });

    // window.scrollTo must have been called with top: 0 at least once
    expect(window.scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({ top: 0 })
    );
  });

  it('displays the success heading and reference ID', () => {
    render(
      <SuccessConfirmation
        issueId="REQ-042"
        categoryName="Noise Complaint"
        onSubmitAnother={vi.fn()}
        viewRequestHref={null}
      />
    );

    expect(screen.getByText('Request Received')).toBeInTheDocument();
    expect(screen.getByText('REQ-042')).toBeInTheDocument();
    expect(screen.getByText(/Noise Complaint/)).toBeInTheDocument();
  });

  it('does not show "View Request" button when viewRequestHref is null', () => {
    render(
      <SuccessConfirmation
        issueId="REQ-001"
        categoryName="Maintenance & Repairs"
        onSubmitAnother={vi.fn()}
        viewRequestHref={null}
      />
    );

    expect(screen.queryByText('View Request')).not.toBeInTheDocument();
  });
});
