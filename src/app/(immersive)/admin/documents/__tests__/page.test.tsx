import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { CurrentUserResponse } from '@/hooks/useCurrentUser';
import type {
  SocietyDocumentCategory,
  SocietyDocumentCategoryListResponse,
  SocietyDocumentListResponse,
  SocietyDocumentResponse,
} from '@/types/admin';
import DocumentsPage from '../page';

const mockList = vi.fn();
const mockUpload = vi.fn();
const mockUpdate = vi.fn();
const mockReplace = vi.fn();
const mockDelete = vi.fn();
const mockDownloadUrl = vi.fn();
const mockListCats = vi.fn();
const mockCreateCat = vi.fn();
const mockUpdateCat = vi.fn();
const mockDeleteCat = vi.fn();
const mockUseCurrentUser = vi.fn();
const mockUseAuth = vi.fn();

vi.mock('@/hooks/useCurrentUser', () => ({
  useCurrentUser: () => mockUseCurrentUser(),
}));

vi.mock('@clerk/nextjs', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('@/lib/api/societyDocuments', () => ({
  MAX_DOCUMENT_UPLOAD_BYTES: 31_457_280,
  ALLOWED_DOCUMENT_CONTENT_TYPES: ['application/pdf', 'image/png'],
  listSocietyDocuments: (...args: unknown[]) => mockList(...args),
  uploadSocietyDocument: (...args: unknown[]) => mockUpload(...args),
  updateSocietyDocument: (...args: unknown[]) => mockUpdate(...args),
  replaceSocietyDocumentFile: (...args: unknown[]) => mockReplace(...args),
  deleteSocietyDocument: (...args: unknown[]) => mockDelete(...args),
  getSocietyDocumentDownloadUrl: (...args: unknown[]) => mockDownloadUrl(...args),
}));

vi.mock('@/lib/api/societyDocumentCategories', () => ({
  listSocietyDocumentCategories: (...args: unknown[]) => mockListCats(...args),
  createSocietyDocumentCategory: (...args: unknown[]) => mockCreateCat(...args),
  updateSocietyDocumentCategory: (...args: unknown[]) => mockUpdateCat(...args),
  deleteSocietyDocumentCategory: (...args: unknown[]) => mockDeleteCat(...args),
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('@/components/ui/Modal', () => ({
  Modal: ({ isOpen, title, children }: { isOpen: boolean; title?: string; children: React.ReactNode }) =>
    isOpen ? (
      <div role="dialog" aria-label={title}>
        {children}
      </div>
    ) : null,
}));

function renderWithQueryClient(ui: React.ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

const superadminUser: CurrentUserResponse = {
  user: {
    id: 'u1',
    clerk_user_id: 'clerk_1',
    email: 'admin@example.com',
    first_name: 'Admin',
    last_name: 'User',
    avatar_url: null,
    created_at: '2020-01-01T00:00:00Z',
  },
  membership: null,
  is_superadmin: true,
  capabilities: [],
};

const residentUser: CurrentUserResponse = { ...superadminUser, is_superadmin: false };

function cat(overrides: Partial<SocietyDocumentCategory> = {}): SocietyDocumentCategory {
  return {
    id: 'cat-1',
    community_id: 'c1',
    label: 'Minutes',
    is_visible: false,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

function doc(overrides: Partial<SocietyDocumentResponse> = {}): SocietyDocumentResponse {
  return {
    id: 'doc-1',
    community_id: 'c1',
    title: 'May Minutes',
    category_id: null,
    category: null,
    description: null,
    display_name: 'may-minutes.pdf',
    content_type: 'application/pdf',
    size_bytes: 12_345,
    status: 'ready',
    visibility: 30,
    source: 'manual_upload',
    external_id: null,
    external_modified_at: null,
    content_hash: null,
    last_synced_at: null,
    uploaded_by: 'u1',
    created_at: '2026-05-05T12:00:00Z',
    updated_at: '2026-05-05T12:00:00Z',
    ...overrides,
  };
}

function listResponse(items: SocietyDocumentResponse[]): SocietyDocumentListResponse {
  return { items, limit: 50, offset: 0 };
}

function catsResponse(items: SocietyDocumentCategory[]): SocietyDocumentCategoryListResponse {
  return { items };
}

const signedInAuth = { isLoaded: true, isSignedIn: true, getToken: async () => 'token' };

describe('AdminDocumentsPage', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    mockList.mockReset();
    mockUpload.mockReset();
    mockUpdate.mockReset();
    mockReplace.mockReset();
    mockDelete.mockReset();
    mockDownloadUrl.mockReset();
    mockListCats.mockReset();
    mockCreateCat.mockReset();
    mockUpdateCat.mockReset();
    mockDeleteCat.mockReset();
    mockUseCurrentUser.mockReset();
    mockUseAuth.mockReset();
    // Sensible defaults; individual tests override.
    mockListCats.mockResolvedValue(catsResponse([]));
  });

  it('groups documents under category headings, shows empty categories and visibility', async () => {
    mockUseAuth.mockReturnValue(signedInAuth);
    mockUseCurrentUser.mockReturnValue({ data: superadminUser, isLoading: false });
    mockListCats.mockResolvedValue(
      catsResponse([
        cat({ id: 'cat-minutes', label: 'Minutes', is_visible: true }),
        cat({ id: 'cat-bylaws', label: 'Bylaws', is_visible: false }),
      ]),
    );
    mockList.mockResolvedValue(listResponse([doc({ category_id: 'cat-minutes' })]));

    renderWithQueryClient(<DocumentsPage />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Minutes' })).toBeInTheDocument();
    });
    // Empty category still renders as a heading.
    expect(screen.getByRole('heading', { name: 'Bylaws' })).toBeInTheDocument();
    expect(screen.getByText(/no documents in this category yet/i)).toBeInTheDocument();
    // Document appears with its human-readable visibility label.
    expect(screen.getByText('May Minutes')).toBeInTheDocument();
    expect(screen.getByText('Owners & above')).toBeInTheDocument();
  });

  it('renders an Uncategorized section for documents with no category', async () => {
    mockUseAuth.mockReturnValue(signedInAuth);
    mockUseCurrentUser.mockReturnValue({ data: superadminUser, isLoading: false });
    mockListCats.mockResolvedValue(catsResponse([]));
    mockList.mockResolvedValue(listResponse([doc({ category_id: null })]));

    renderWithQueryClient(<DocumentsPage />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Uncategorized' })).toBeInTheDocument();
    });
    expect(screen.getByText('May Minutes')).toBeInTheDocument();
  });

  it('shows the empty state when there are no documents and no categories', async () => {
    mockUseAuth.mockReturnValue(signedInAuth);
    mockUseCurrentUser.mockReturnValue({ data: superadminUser, isLoading: false });
    mockListCats.mockResolvedValue(catsResponse([]));
    mockList.mockResolvedValue(listResponse([]));

    renderWithQueryClient(<DocumentsPage />);

    await waitFor(() => {
      expect(screen.getByText(/no documents yet/i)).toBeInTheDocument();
    });
  });

  it('denies a non-manager and does not fetch documents or categories', async () => {
    mockUseAuth.mockReturnValue(signedInAuth);
    mockUseCurrentUser.mockReturnValue({ data: residentUser, isLoading: false });
    mockList.mockResolvedValue(listResponse([doc()]));

    renderWithQueryClient(<DocumentsPage />);

    await waitFor(() => {
      expect(screen.getByText(/don't have permission/i)).toBeInTheDocument();
    });
    expect(mockList).not.toHaveBeenCalled();
    expect(mockListCats).not.toHaveBeenCalled();
  });

  it('offers a category dropdown and a visibility selector in the upload modal', async () => {
    mockUseAuth.mockReturnValue(signedInAuth);
    mockUseCurrentUser.mockReturnValue({ data: superadminUser, isLoading: false });
    mockListCats.mockResolvedValue(catsResponse([cat({ id: 'cat-minutes', label: 'Minutes' })]));
    mockList.mockResolvedValue(listResponse([]));

    renderWithQueryClient(<DocumentsPage />);

    // A category exists, so the page shows sections (not the empty state); open
    // the upload modal from the nav bar "Upload" action.
    const openBtn = await screen.findByRole('button', { name: /^upload$/i });
    fireEvent.click(openBtn);

    const categorySelect = await screen.findByLabelText('Category');
    expect(within(categorySelect).getByRole('option', { name: 'Uncategorized' })).toBeInTheDocument();
    expect(within(categorySelect).getByRole('option', { name: 'Minutes' })).toBeInTheDocument();
    // Visibility selector present with the audience options.
    const visSelect = screen.getByLabelText('Visibility');
    expect(within(visSelect).getByRole('option', { name: /property owners and above/i })).toBeInTheDocument();
  });

  it('surfaces a client-side validation error for an oversize file and does not upload', async () => {
    mockUseAuth.mockReturnValue(signedInAuth);
    mockUseCurrentUser.mockReturnValue({ data: superadminUser, isLoading: false });
    mockListCats.mockResolvedValue(catsResponse([]));
    mockList.mockResolvedValue(listResponse([]));

    renderWithQueryClient(<DocumentsPage />);

    const openBtn = await screen.findByRole('button', { name: /upload document/i });
    fireEvent.click(openBtn);

    const title = await screen.findByLabelText(/title/i);
    fireEvent.change(title, { target: { value: 'Big file' } });

    const fileInput = screen.getByLabelText(/^file/i) as HTMLInputElement;
    const big = new File(['x'], 'big.pdf', { type: 'application/pdf' });
    Object.defineProperty(big, 'size', { value: 31_457_281 });
    fireEvent.change(fileInput, { target: { files: [big] } });

    fireEvent.click(screen.getByRole('button', { name: /^upload$/i }));

    await waitFor(() => {
      expect(screen.getByText(/too large/i)).toBeInTheDocument();
    });
    expect(mockUpload).not.toHaveBeenCalled();
  });

  it('triggers a download when the row download action is clicked', async () => {
    mockUseAuth.mockReturnValue(signedInAuth);
    mockUseCurrentUser.mockReturnValue({ data: superadminUser, isLoading: false });
    mockListCats.mockResolvedValue(catsResponse([]));
    mockList.mockResolvedValue(listResponse([doc()]));
    mockDownloadUrl.mockResolvedValue({ download_url: 'https://r2/x', expires_in_seconds: 300 });
    vi.spyOn(window, 'open').mockImplementation(() => null);

    renderWithQueryClient(<DocumentsPage />);

    const dl = await screen.findByRole('button', { name: /download may minutes/i });
    fireEvent.click(dl);

    await waitFor(() => {
      expect(mockDownloadUrl).toHaveBeenCalledWith('doc-1', expect.any(Function));
    });
  });

  // --- Inline category management ---

  it('creates a category from the New category modal', async () => {
    mockUseAuth.mockReturnValue(signedInAuth);
    mockUseCurrentUser.mockReturnValue({ data: superadminUser, isLoading: false });
    mockListCats.mockResolvedValue(catsResponse([]));
    mockList.mockResolvedValue(listResponse([]));
    mockCreateCat.mockResolvedValue(cat({ id: 'new', label: 'Policies' }));

    renderWithQueryClient(<DocumentsPage />);

    const newCatBtn = await screen.findByRole('button', { name: /new category/i });
    fireEvent.click(newCatBtn);

    const label = await screen.findByLabelText(/label/i);
    fireEvent.change(label, { target: { value: 'Policies' } });
    fireEvent.click(screen.getByRole('button', { name: /^create$/i }));

    await waitFor(() => {
      expect(mockCreateCat).toHaveBeenCalledWith(
        { label: 'Policies', is_visible: false },
        expect.any(Function),
      );
    });
  });

  it('shows a duplicate-label error inline when category creation conflicts', async () => {
    mockUseAuth.mockReturnValue(signedInAuth);
    mockUseCurrentUser.mockReturnValue({ data: superadminUser, isLoading: false });
    mockListCats.mockResolvedValue(catsResponse([]));
    mockList.mockResolvedValue(listResponse([]));
    mockCreateCat.mockRejectedValue(new Error("A category named 'Minutes' already exists"));

    renderWithQueryClient(<DocumentsPage />);

    fireEvent.click(await screen.findByRole('button', { name: /new category/i }));
    fireEvent.change(await screen.findByLabelText(/label/i), { target: { value: 'Minutes' } });
    fireEvent.click(screen.getByRole('button', { name: /^create$/i }));

    await waitFor(() => {
      expect(screen.getByText(/already exists/i)).toBeInTheDocument();
    });
  });

  it('toggles category visibility from the heading control', async () => {
    mockUseAuth.mockReturnValue(signedInAuth);
    mockUseCurrentUser.mockReturnValue({ data: superadminUser, isLoading: false });
    mockListCats.mockResolvedValue(
      catsResponse([cat({ id: 'cat-minutes', label: 'Minutes', is_visible: false })]),
    );
    mockList.mockResolvedValue(listResponse([]));
    mockUpdateCat.mockResolvedValue(cat({ id: 'cat-minutes', is_visible: true }));

    renderWithQueryClient(<DocumentsPage />);

    const toggle = await screen.findByRole('button', { name: /toggle visibility of minutes/i });
    fireEvent.click(toggle);

    await waitFor(() => {
      expect(mockUpdateCat).toHaveBeenCalledWith(
        'cat-minutes',
        { is_visible: true },
        expect.any(Function),
      );
    });
  });

  it('deletes a category from the heading control', async () => {
    mockUseAuth.mockReturnValue(signedInAuth);
    mockUseCurrentUser.mockReturnValue({ data: superadminUser, isLoading: false });
    mockListCats.mockResolvedValue(
      catsResponse([cat({ id: 'cat-minutes', label: 'Minutes' })]),
    );
    mockList.mockResolvedValue(listResponse([doc({ category_id: 'cat-minutes' })]));
    mockDeleteCat.mockResolvedValue(undefined);

    renderWithQueryClient(<DocumentsPage />);

    const del = await screen.findByRole('button', { name: /delete minutes/i });
    fireEvent.click(del);

    // Confirm modal mentions moving documents to Uncategorized.
    expect(await screen.findByText(/move to uncategorized/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /^delete$/i }));

    await waitFor(() => {
      expect(mockDeleteCat).toHaveBeenCalledWith('cat-minutes', expect.any(Function));
    });
  });
});
