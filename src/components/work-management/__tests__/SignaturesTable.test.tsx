import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SignaturesTable from '../SignaturesTable';
import type { AdminSignatureResponse, SignatureSortField, SignatureSortOrder } from '@/types/admin';

const fixture: AdminSignatureResponse[] = [
  {
    id: 'sig-1',
    first_name: 'Ada',
    last_name: 'Lovelace',
    email: 'ada@example.com',
    resident_type: 'owner',
    address: '1 Analytical Engine Way',
    ip_address: '203.0.113.7',
    email_updates_consent: true,
    consent_recorded_at: '2026-05-05T12:00:00Z',
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
    email_updates_consent: false,
    consent_recorded_at: null,
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
    email_updates_consent: false,
    consent_recorded_at: null,
    signed_at: '2026-04-01T08:00:00Z',
  },
];

function setup(overrides: Partial<React.ComponentProps<typeof SignaturesTable>> = {}) {
  const props: React.ComponentProps<typeof SignaturesTable> = {
    signatures: fixture,
    sort: 'signed_at' as SignatureSortField,
    order: 'desc' as SignatureSortOrder,
    onSortChange: vi.fn(),
    onDelete: vi.fn(),
    deletingIds: new Set<string>(),
    ...overrides,
  };
  const utils = render(<SignaturesTable {...props} />);
  return { ...utils, props };
}

describe('SignaturesTable', () => {
  it('renders one row per signature with Name, Resident Type, Address and Signed At', () => {
    setup();
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('Grace Hopper')).toBeInTheDocument();
    expect(screen.getByText('Linus Torvalds')).toBeInTheDocument();
    expect(screen.getByText('1 Analytical Engine Way')).toBeInTheDocument();
    expect(screen.getByText('99 Kernel Street')).toBeInTheDocument();
  });

  it('masks every email by default', () => {
    setup();
    // Full emails should NOT appear by default.
    expect(screen.queryByText('ada@example.com')).not.toBeInTheDocument();
    expect(screen.queryByText('grace@example.com')).not.toBeInTheDocument();
    // Masked forms SHOULD appear.
    expect(screen.getByText('a*a@example.com')).toBeInTheDocument();
    expect(screen.getByText('g***e@example.com')).toBeInTheDocument();
  });

  it('reveals only the clicked row when the email eye toggle is pressed', () => {
    setup();
    const revealButtons = screen.getAllByRole('button', { name: /reveal email/i });
    expect(revealButtons.length).toBe(3);
    fireEvent.click(revealButtons[0]);
    expect(screen.getByText('ada@example.com')).toBeInTheDocument();
    expect(screen.queryByText('grace@example.com')).not.toBeInTheDocument();
  });

  it('re-masks every email when sort changes', () => {
    const { rerender, props } = setup();
    fireEvent.click(screen.getAllByRole('button', { name: /reveal email/i })[0]);
    expect(screen.getByText('ada@example.com')).toBeInTheDocument();

    rerender(<SignaturesTable {...props} sort="name" order="asc" />);
    expect(screen.queryByText('ada@example.com')).not.toBeInTheDocument();
    expect(screen.getByText('a*a@example.com')).toBeInTheDocument();
  });

  it('IP column hides full value behind the eye toggle', () => {
    setup();
    expect(screen.queryByText('203.0.113.7')).not.toBeInTheDocument();
    const revealIp = screen.getAllByRole('button', { name: /reveal ip address/i });
    // sig-3 has null IP → 2 reveal buttons
    expect(revealIp.length).toBe(2);
    fireEvent.click(revealIp[0]);
    expect(screen.getByText('203.0.113.7')).toBeInTheDocument();
  });

  it('renders the delete column with a trash icon button per row', () => {
    setup();
    const trashButtons = screen.getAllByRole('button', { name: /delete signature/i });
    expect(trashButtons).toHaveLength(3);
  });

  it('opens the inline confirm prompt on trash click', () => {
    setup();
    fireEvent.click(screen.getAllByRole('button', { name: /delete signature/i })[0]);
    expect(screen.getByText(/delete\?/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^confirm$/i })).toBeInTheDocument();
  });

  it('Cancel restores the trash icon', () => {
    setup();
    fireEvent.click(screen.getAllByRole('button', { name: /delete signature/i })[0]);
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(screen.queryByText(/delete\?/i)).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /delete signature/i })).toHaveLength(3);
  });

  it('Escape cancels the confirmation', () => {
    setup();
    fireEvent.click(screen.getAllByRole('button', { name: /delete signature/i })[0]);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByText(/delete\?/i)).not.toBeInTheDocument();
  });

  it('clicking another row’s trash transfers the confirmation state', () => {
    setup();
    const trashButtons = screen.getAllByRole('button', { name: /delete signature/i });
    fireEvent.click(trashButtons[0]);
    expect(screen.getAllByText(/delete\?/i)).toHaveLength(1);
    fireEvent.click(screen.getAllByRole('button', { name: /delete signature/i })[0]);
    // Only one row should still be confirming.
    expect(screen.getAllByText(/delete\?/i)).toHaveLength(1);
  });

  it('Confirm calls onDelete with the row id and clears the prompt', () => {
    const onDelete = vi.fn();
    setup({ onDelete });
    fireEvent.click(screen.getAllByRole('button', { name: /delete signature/i })[0]);
    fireEvent.click(screen.getByRole('button', { name: /^confirm$/i }));
    expect(onDelete).toHaveBeenCalledWith('sig-1');
    expect(screen.queryByText(/delete\?/i)).not.toBeInTheDocument();
  });

  it('disables Confirm while the row is in deletingIds', () => {
    setup({ deletingIds: new Set(['sig-1']) });
    fireEvent.click(screen.getAllByRole('button', { name: /delete signature/i })[0]);
    expect(screen.getByRole('button', { name: /deleting/i })).toBeDisabled();
  });

  it('renders rowErrorById message in the actions cell', () => {
    setup({ rowErrorById: { 'sig-2': 'Delete failed' } });
    expect(screen.getByText('Delete failed')).toBeInTheDocument();
  });

  it('clicking a sortable header invokes onSortChange', () => {
    const onSortChange = vi.fn();
    setup({ onSortChange });
    const nameHeader = screen.getByRole('button', { name: /^name$/i });
    fireEvent.click(nameHeader);
    expect(onSortChange).toHaveBeenCalledWith('name', 'asc');
  });

  it('clicking the active sort header toggles direction', () => {
    const onSortChange = vi.fn();
    setup({ sort: 'name', order: 'asc', onSortChange });
    const nameHeader = screen.getByRole('button', { name: /^name$/i });
    fireEvent.click(nameHeader);
    expect(onSortChange).toHaveBeenCalledWith('name', 'desc');
  });

  it('renders empty state when no signatures', () => {
    setup({ signatures: [] });
    expect(screen.getByText(/no signatures/i)).toBeInTheDocument();
  });

  it('renders an em-dash for null address', () => {
    setup({ signatures: [fixture[1]] });
    expect(within(screen.getAllByRole('row')[1]).getAllByText('—').length).toBeGreaterThanOrEqual(1);
  });

  it('renders an Opted in badge only for signers with email_updates_consent=true', () => {
    setup();
    const badges = screen.getAllByText(/opted in/i);
    expect(badges).toHaveLength(1);
    const adaRow = screen.getByText('Ada Lovelace').closest('tr')!;
    expect(within(adaRow).getByText(/opted in/i)).toBeInTheDocument();
    const graceRow = screen.getByText('Grace Hopper').closest('tr')!;
    expect(within(graceRow).queryByText(/opted in/i)).not.toBeInTheDocument();
  });
});
