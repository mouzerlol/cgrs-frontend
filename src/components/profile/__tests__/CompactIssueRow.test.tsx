import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CompactIssueRow from '@/components/profile/CompactIssueRow';

describe('CompactIssueRow', () => {
  it('links to the profile reported-issue detail route using the request id', () => {
    const id = '28b81a2e-1d4d-4109-981d-d5ee4bba704d';
    render(
      <CompactIssueRow
        id={id}
        title="Leaking tap"
        category="maintenance"
        status="open"
        submittedAt="2025-01-01T00:00:00Z"
      />
    );

    const link = screen.getByRole('link', { name: /leaking tap/i });
    expect(link).toHaveAttribute('href', `/account/reported-issues/${id}`);
    expect(screen.getByText('Maintenance')).toBeInTheDocument();
  });

  it('shows the status as a visible inline label (not hover-gated)', () => {
    render(
      <CompactIssueRow
        id="1"
        title="Broken gate"
        category="safety"
        status="in_progress"
        submittedAt="2025-01-01T00:00:00Z"
      />
    );

    // The status word renders directly in the row, readable on touch with no tooltip.
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Safety')).toBeInTheDocument();
  });

  it('maps an unknown category to a friendly fallback label', () => {
    render(
      <CompactIssueRow
        id="2"
        title="Mystery"
        category="something_unmapped"
        status="closed"
        submittedAt="2025-01-01T00:00:00Z"
      />
    );

    expect(screen.getByText('Other')).toBeInTheDocument();
    expect(screen.getByText('Closed')).toBeInTheDocument();
  });
});
