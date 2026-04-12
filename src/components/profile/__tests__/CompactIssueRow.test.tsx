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
    expect(link).toHaveAttribute('href', `/profile/reported-issues/${id}`);
    expect(screen.getByText('Maintenance')).toBeInTheDocument();
  });
});
