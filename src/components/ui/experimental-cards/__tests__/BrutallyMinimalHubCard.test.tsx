import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FileText } from 'lucide-react';
import { BrutallyMinimalHubCard } from '@/components/ui/experimental-cards/BrutallyMinimalWorkCards';

describe('BrutallyMinimalHubCard', () => {
  it('renders count badge when count and countLabel are provided', () => {
    render(
      <BrutallyMinimalHubCard
        name="Portfolios"
        description="Define scope"
        icon={FileText}
        href="/admin/portfolios"
        count={3}
        countLabel="portfolios"
      />
    );

    expect(screen.getByRole('link')).toHaveAttribute('href', '/admin/portfolios');
    expect(screen.getByText('3 portfolios')).toBeInTheDocument();
  });

  it('omits the count badge when count and countLabel are omitted', () => {
    render(
      <BrutallyMinimalHubCard
        name="Users"
        description="Manage members"
        icon={FileText}
        href="/admin/users"
      />
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/admin/users');
    expect(link.textContent).not.toMatch(/\d/);
  });
});
