import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';
import type {
  VisibleSocietyCategoryGroup,
  VisibleSocietyDocument,
  VisibleSocietyDocumentsResponse,
} from '@/types/admin';
import SocietyDocumentsSection from '../SocietyDocumentsSection';

const mockUseQuery = vi.fn();
const mockDownloadMutate = vi.fn();
const mockViewMutate = vi.fn();
const mockUseDownload = vi.fn();
const mockUseView = vi.fn();

vi.mock('@/hooks/useSocietyDocuments', () => ({
  useVisibleSocietyDocumentsQuery: () => mockUseQuery(),
  useDownloadVisibleSocietyDocument: () => mockUseDownload(),
  useVisibleSocietyDocumentViewUrl: () => mockUseView(),
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

// DocumentViewerModal pulls in the vendored pdf.js viewer; stub it out.
vi.mock('@/components/ui/DocumentViewerModal', () => ({
  DocumentViewerModal: () => null,
}));

function makeDoc(overrides: Partial<VisibleSocietyDocument> = {}): VisibleSocietyDocument {
  return {
    id: 'doc-1',
    title: 'Untitled',
    description: null,
    display_name: 'file.pdf',
    content_type: 'application/pdf',
    size_bytes: 2048,
    visibility: 30,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

function group(
  id: string,
  label: string,
  documents: VisibleSocietyDocument[],
): VisibleSocietyCategoryGroup {
  return { id, label, documents };
}

function response(categories: VisibleSocietyCategoryGroup[]): VisibleSocietyDocumentsResponse {
  return { categories };
}

beforeEach(() => {
  mockUseQuery.mockReset();
  mockDownloadMutate.mockReset();
  mockViewMutate.mockReset();
  mockUseDownload.mockReset();
  mockUseView.mockReset();
  mockUseDownload.mockReturnValue({
    mutate: mockDownloadMutate,
    isPending: false,
    isError: false,
    variables: undefined,
  });
  mockUseView.mockReturnValue({
    mutate: mockViewMutate,
    isPending: false,
    isError: false,
    variables: undefined,
  });
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
    expect(
      screen.getByText(/couldn’t load the society documents|couldn't load the society documents/i),
    ).toBeInTheDocument();
  });

  it('shows the empty state when the server returns no categories', () => {
    mockUseQuery.mockReturnValue({ data: response([]), isLoading: false, error: null });
    render(<SocietyDocumentsSection />);
    expect(screen.getByText('No documents yet')).toBeInTheDocument();
  });

  it('renders the server groups, ordered A–Z with documents newest-first', () => {
    mockUseQuery.mockReturnValue({
      data: response([
        // Intentionally out of order: component should sort to Finance, Governance.
        group('cat-1', 'Governance', [
          makeDoc({ id: 'old', title: 'AGM Minutes 2024', created_at: '2024-06-01T00:00:00Z' }),
          makeDoc({ id: 'new', title: 'AGM Minutes 2025', created_at: '2025-06-01T00:00:00Z' }),
        ]),
        group('cat-2', 'Finance', [makeDoc({ id: 'fin', title: 'Annual Financials' })]),
      ]),
      isLoading: false,
      error: null,
    });
    render(<SocietyDocumentsSection />);

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

  it('opens a PDF in the viewer by id when its row is activated', () => {
    mockUseQuery.mockReturnValue({
      data: response([group('cat-1', 'Governance', [makeDoc({ id: 'fin', title: 'Annual Financials' })])]),
      isLoading: false,
      error: null,
    });
    render(<SocietyDocumentsSection />);
    fireEvent.click(screen.getByRole('button', { name: 'View Annual Financials' }));
    expect(mockViewMutate).toHaveBeenCalledWith('fin', expect.anything());
  });

  it('downloads a non-PDF document by id when its button is activated', () => {
    mockUseQuery.mockReturnValue({
      data: response([
        group('cat-1', 'Governance', [
          makeDoc({ id: 'sheet', title: 'Budget', content_type: 'text/csv', display_name: 'budget.csv' }),
        ]),
      ]),
      isLoading: false,
      error: null,
    });
    render(<SocietyDocumentsSection />);
    fireEvent.click(screen.getByRole('button', { name: 'Download Budget' }));
    expect(mockDownloadMutate).toHaveBeenCalledWith('sheet');
  });

  it('surfaces a per-row retry when a non-PDF download fails', () => {
    mockUseDownload.mockReturnValue({
      mutate: mockDownloadMutate,
      isPending: false,
      isError: true,
      variables: 'sheet',
    });
    mockUseQuery.mockReturnValue({
      data: response([
        group('cat-1', 'Governance', [
          makeDoc({ id: 'sheet', title: 'Budget', content_type: 'text/csv', display_name: 'budget.csv' }),
        ]),
      ]),
      isLoading: false,
      error: null,
    });
    render(<SocietyDocumentsSection />);
    expect(screen.getByRole('button', { name: 'Retry download of Budget' })).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(/couldn’t open|couldn't open/i);
  });
});
