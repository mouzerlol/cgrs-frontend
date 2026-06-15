import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';
import type { SocietyDocumentResponse, SocietyDocumentListResponse } from '@/types/admin';
import SocietyDocumentsSection from '../SocietyDocumentsSection';

const mockUseQuery = vi.fn();
const mockMutate = vi.fn();
const mockUseDownload = vi.fn();

vi.mock('@/hooks/useSocietyDocuments', () => ({
  useSocietyDocumentsQuery: () => mockUseQuery(),
  useDownloadSocietyDocument: () => mockUseDownload(),
}));

// framer-motion: render plain elements so list/li semantics are preserved.
vi.mock('framer-motion', () => ({
  motion: new Proxy(
    {},
    {
      get: (_t, tag: string) => {
        const Comp = ({ children, ...rest }: { children?: React.ReactNode }) => {
          const Tag = tag as keyof JSX.IntrinsicElements;
          // Strip framer-only props
          const { initial, animate, exit, variants, transition, ...dom } = rest as Record<string, unknown>;
          void initial; void animate; void exit; void variants; void transition;
          return <Tag {...dom}>{children}</Tag>;
        };
        return Comp;
      },
    },
  ),
  useReducedMotion: () => true,
}));

function makeDoc(overrides: Partial<SocietyDocumentResponse>): SocietyDocumentResponse {
  return {
    id: 'doc-1',
    community_id: 'c1',
    title: 'Untitled',
    category_id: 'cat-1',
    category: { id: 'cat-1', label: 'Governance', is_visible: true },
    description: null,
    display_name: 'file.pdf',
    content_type: 'application/pdf',
    size_bytes: 2048,
    status: 'ready',
    visibility: 30,
    source: 'manual_upload',
    external_id: null,
    external_modified_at: null,
    content_hash: null,
    last_synced_at: null,
    uploaded_by: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

function list(items: SocietyDocumentResponse[]): SocietyDocumentListResponse {
  return { items, limit: 50, offset: 0 };
}

beforeEach(() => {
  mockUseQuery.mockReset();
  mockMutate.mockReset();
  mockUseDownload.mockReset();
  mockUseDownload.mockReturnValue({ mutate: mockMutate, isPending: false, isError: false, variables: undefined });
});

describe('SocietyDocumentsSection', () => {
  it('shows skeletons while loading', () => {
    mockUseQuery.mockReturnValue({ data: undefined, isLoading: true, error: null });
    render(<SocietyDocumentsSection />);
    expect(screen.getByRole('heading', { name: 'Society documents' })).toBeInTheDocument();
    expect(screen.queryByText('No documents yet')).not.toBeInTheDocument();
  });

  it('shows a recoverable error when the load fails', () => {
    mockUseQuery.mockReturnValue({ data: undefined, isLoading: false, error: new Error('boom') });
    render(<SocietyDocumentsSection />);
    expect(screen.getByText(/couldn’t load the society documents|couldn't load the society documents/i)).toBeInTheDocument();
  });

  it('shows the empty state when no visible documents remain', () => {
    mockUseQuery.mockReturnValue({
      data: list([
        makeDoc({ id: 'a', category: { id: 'h', label: 'Hidden', is_visible: false } }),
        makeDoc({ id: 'b', category: null, category_id: null }),
      ]),
      isLoading: false,
      error: null,
    });
    render(<SocietyDocumentsSection />);
    expect(screen.getByText('No documents yet')).toBeInTheDocument();
  });

  it('renders only visible-category documents, grouped and sorted', () => {
    mockUseQuery.mockReturnValue({
      data: list([
        makeDoc({ id: 'old', title: 'AGM Minutes 2024', created_at: '2024-06-01T00:00:00Z' }),
        makeDoc({ id: 'new', title: 'AGM Minutes 2025', created_at: '2025-06-01T00:00:00Z' }),
        makeDoc({
          id: 'fin',
          title: 'Annual Financials',
          category: { id: 'cat-2', label: 'Finance', is_visible: true },
        }),
        makeDoc({ id: 'hidden', title: 'Secret', category: { id: 'x', label: 'Hidden', is_visible: false } }),
        makeDoc({ id: 'uncat', title: 'Loose', category: null, category_id: null }),
      ]),
      isLoading: false,
      error: null,
    });
    render(<SocietyDocumentsSection />);

    // Visible categories shown, hidden/uncategorised excluded.
    expect(screen.getByRole('heading', { name: 'Finance' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Governance' })).toBeInTheDocument();
    expect(screen.queryByText('Secret')).not.toBeInTheDocument();
    expect(screen.queryByText('Loose')).not.toBeInTheDocument();

    // Categories alphabetical: Finance before Governance.
    const headings = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
    expect(headings).toEqual(['Finance', 'Governance']);

    // Within Governance, newest-first: 2025 before 2024.
    const lists = screen.getAllByRole('list');
    const governanceList = lists[1];
    const titles = within(governanceList)
      .getAllByText(/AGM Minutes/)
      .map((n) => n.textContent);
    expect(titles).toEqual(['AGM Minutes 2025', 'AGM Minutes 2024']);
  });

  it('downloads a document by id when its button is activated', () => {
    mockUseQuery.mockReturnValue({
      data: list([makeDoc({ id: 'fin', title: 'Annual Financials' })]),
      isLoading: false,
      error: null,
    });
    render(<SocietyDocumentsSection />);
    fireEvent.click(screen.getByRole('button', { name: 'Download Annual Financials' }));
    expect(mockMutate).toHaveBeenCalledWith('fin');
  });

  it('surfaces a per-row retry when a download fails', () => {
    mockUseDownload.mockReturnValue({ mutate: mockMutate, isPending: false, isError: true, variables: 'fin' });
    mockUseQuery.mockReturnValue({
      data: list([makeDoc({ id: 'fin', title: 'Annual Financials' })]),
      isLoading: false,
      error: null,
    });
    render(<SocietyDocumentsSection />);
    expect(screen.getByRole('button', { name: 'Retry download of Annual Financials' })).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(/couldn’t open|couldn't open/i);
  });
});
