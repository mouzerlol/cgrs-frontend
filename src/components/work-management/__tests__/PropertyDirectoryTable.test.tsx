import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PropertyDirectoryTable from '../PropertyDirectoryTable';
import type { PropertyDirectoryItem } from '@/lib/api/verification';

// Stub the data hooks so the table renders without Clerk / React Query providers.
const usePropertyMembersQuery = vi.fn();
const useRevokeRelationshipMutation = vi.fn(() => ({ mutateAsync: vi.fn() }));

vi.mock('@/hooks/useVerificationReview', () => ({
  usePropertyMembersQuery: (propertyId: string | null, enabled?: boolean) =>
    usePropertyMembersQuery(propertyId, enabled),
  useRevokeRelationshipMutation: () => useRevokeRelationshipMutation(),
}));

const properties: PropertyDirectoryItem[] = [
  {
    property_id: 'prop-1',
    street_name: 'Oak Street',
    street_number: '12',
    unit_number: null,
    resident_count: 2,
    owner_count: 1,
  },
  {
    property_id: 'prop-2',
    street_name: 'Elm Street',
    street_number: '40',
    unit_number: 'A',
    resident_count: 0,
    owner_count: 1,
  },
];

function renderTable(overrides: Partial<React.ComponentProps<typeof PropertyDirectoryTable>> = {}) {
  return render(
    <PropertyDirectoryTable
      properties={properties}
      reviewer
      sort="address"
      order="asc"
      onSort={vi.fn()}
      onRevoke={vi.fn()}
      {...overrides}
    />,
  );
}

beforeEach(() => {
  usePropertyMembersQuery.mockReset();
  usePropertyMembersQuery.mockReturnValue({ data: undefined, isLoading: false });
});

describe('PropertyDirectoryTable', () => {
  it('shows the empty state when there are no properties', () => {
    renderTable({ properties: [] });
    expect(screen.getByText('No properties with members')).toBeInTheDocument();
  });

  it('renders a row per property with address and per-type counts', () => {
    renderTable();
    expect(screen.getByText('12 Oak Street')).toBeInTheDocument();
    expect(screen.getByText('A/40 Elm Street')).toBeInTheDocument();
    expect(screen.getByText('2 residents')).toBeInTheDocument();
    // Both properties have exactly one owner.
    expect(screen.getAllByText('1 owner')).toHaveLength(2);
  });

  it('fires onSort when a sortable header is clicked', () => {
    const onSort = vi.fn();
    renderTable({ onSort });
    fireEvent.click(screen.getByRole('button', { name: /Owners/i }));
    expect(onSort).toHaveBeenCalledWith('owners');
  });

  it('lazy-loads and renders members when a row is expanded', () => {
    usePropertyMembersQuery.mockReturnValue({
      data: {
        members: [
          {
            relationship_id: 'rel-1',
            user_id: 'user-1',
            first_name: 'Ada',
            last_name: 'Lovelace',
            email: 'ada@example.com',
            relationship_type: 'owner',
            status: 'active',
            established_at: '2026-03-12T00:00:00Z',
          },
        ],
      },
      isLoading: false,
    });

    renderTable();
    // Before expansion, the member query is disabled (enabled=false) for every row.
    expect(usePropertyMembersQuery).toHaveBeenCalledWith('prop-1', false);

    fireEvent.click(screen.getByText('12 Oak Street'));

    // After expansion the row's query is enabled and the member is rendered.
    expect(usePropertyMembersQuery).toHaveBeenCalledWith('prop-1', true);
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
  });
});
