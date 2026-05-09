import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SignaturesTable from '../SignaturesTable';
import type { AdminSignatureResponse } from '@/types/admin';

const fixture: AdminSignatureResponse[] = [
  {
    id: 'sig-1',
    first_name: 'Ada',
    last_name: 'Lovelace',
    email: 'ada@example.com',
    resident_type: 'owner',
    address: '1 Analytical Engine Way',
    ip_address: '203.0.113.7',
    signed_at: '2026-05-05T12:00:00Z',
  },
  {
    id: 'sig-2',
    first_name: 'Grace',
    last_name: 'Hopper',
    email: 'grace@example.com',
    resident_type: 'tenant',
    address: null,
    ip_address: '198.51.100.42',
    signed_at: '2026-04-15T08:00:00Z',
  },
  {
    id: 'sig-3',
    first_name: 'Linus',
    last_name: 'Torvalds',
    email: 'linus@example.com',
    resident_type: 'tenant',
    address: '99 Kernel Street',
    ip_address: null,
    signed_at: '2026-04-01T08:00:00Z',
  },
];

describe('SignaturesTable', () => {
  it('renders one row per signature with Name, Email, Resident Type, Address, IP and Signed At', () => {
    render(<SignaturesTable signatures={fixture} />);

    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('Grace Hopper')).toBeInTheDocument();
    expect(screen.getByText('Linus Torvalds')).toBeInTheDocument();

    expect(screen.getByText('ada@example.com')).toBeInTheDocument();
    expect(screen.getByText('grace@example.com')).toBeInTheDocument();

    expect(screen.getByText('1 Analytical Engine Way')).toBeInTheDocument();
    expect(screen.getByText('99 Kernel Street')).toBeInTheDocument();

    // Resident type badges (case-insensitive — formatted text may be capitalised)
    const ownerBadges = screen.getAllByText(/owner/i);
    const tenantBadges = screen.getAllByText(/tenant/i);
    expect(ownerBadges.length).toBeGreaterThanOrEqual(1);
    expect(tenantBadges.length).toBeGreaterThanOrEqual(2);

    // IP defaults to masked — full value SHOULD NOT appear by default
    expect(screen.queryByText('203.0.113.7')).not.toBeInTheDocument();
    expect(screen.queryByText('198.51.100.42')).not.toBeInTheDocument();
  });

  it('renders an em-dash for null address', () => {
    render(<SignaturesTable signatures={[fixture[1]]} />);
    // Em-dash for the null address — at least one em-dash should appear in the row
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(1);
  });

  it('renders an empty state when signatures array is empty', () => {
    render(<SignaturesTable signatures={[]} />);
    expect(screen.getByText(/no signatures/i)).toBeInTheDocument();
  });

  it('reveals only the clicked row when the eye toggle is pressed', () => {
    render(<SignaturesTable signatures={fixture} />);

    const revealButtons = screen.getAllByRole('button', { name: /reveal ip address/i });
    // Three signatures; sig-3 has null IP (no button) → expect 2 reveal buttons
    expect(revealButtons).toHaveLength(2);

    fireEvent.click(revealButtons[0]);

    // The first IP becomes visible; the second remains masked
    expect(screen.getByText('203.0.113.7')).toBeInTheDocument();
    expect(screen.queryByText('198.51.100.42')).not.toBeInTheDocument();
  });

  it('hides a revealed IP when the toggle is pressed again', () => {
    render(<SignaturesTable signatures={fixture} />);

    const revealButton = screen.getAllByRole('button', { name: /reveal ip address/i })[0];
    fireEvent.click(revealButton);
    expect(screen.getByText('203.0.113.7')).toBeInTheDocument();

    const hideButton = screen.getByRole('button', { name: /hide ip address/i });
    fireEvent.click(hideButton);
    expect(screen.queryByText('203.0.113.7')).not.toBeInTheDocument();
  });

  it('renders an em-dash with no toggle when ip_address is null', () => {
    const onlyNullIp: AdminSignatureResponse = {
      ...fixture[2],
      address: '99 Kernel Street',
      ip_address: null,
    };
    render(<SignaturesTable signatures={[onlyNullIp]} />);

    // No reveal button should exist for a null-IP row
    expect(screen.queryByRole('button', { name: /reveal ip address/i })).not.toBeInTheDocument();
    // Em-dash should appear in the IP column
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(1);
  });

  it('toggles sort direction when a sortable header is clicked twice', () => {
    render(<SignaturesTable signatures={fixture} />);

    const nameHeader = screen.getByRole('button', { name: /name/i });
    fireEvent.click(nameHeader);

    let rows = screen.getAllByRole('row').slice(1); // skip thead
    let firstRowText = within(rows[0]).getByText(/Ada Lovelace|Grace Hopper|Linus Torvalds/);
    const firstAfterAsc = firstRowText.textContent;

    fireEvent.click(nameHeader);
    rows = screen.getAllByRole('row').slice(1);
    firstRowText = within(rows[0]).getByText(/Ada Lovelace|Grace Hopper|Linus Torvalds/);
    const firstAfterDesc = firstRowText.textContent;

    expect(firstAfterAsc).not.toBe(firstAfterDesc);
  });
});
