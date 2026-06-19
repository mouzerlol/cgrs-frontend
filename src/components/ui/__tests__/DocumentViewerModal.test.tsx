import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DocumentViewerModal } from '../DocumentViewerModal';

// PdfDocumentView pulls in pdf.js (browser-only globals, no DOMMatrix in jsdom) and is loaded via
// next/dynamic. Stub it with a lightweight view that reports load success so the modal's
// fetch → blob → status flow stays testable without rendering real PDF canvas output.
vi.mock('../PdfDocumentView', async () => {
  const React = await import('react');
  function MockPdfDocumentView({
    fileUrl,
    onLoadSuccess,
  }: {
    fileUrl: string;
    onLoadSuccess?: () => void;
  }) {
    React.useEffect(() => onLoadSuccess?.(), [onLoadSuccess]);
    return React.createElement('div', { 'data-testid': 'pdf-view', 'data-file': fileUrl }, 'pdf');
  }
  return { default: MockPdfDocumentView };
});

describe('DocumentViewerModal', () => {
  const baseProps = {
    isOpen: true,
    onClose: vi.fn(),
    fileUrl: '/sample.pdf',
    fileName: 'Concrete Pad Report.pdf',
    fileType: 'pdf' as const,
  };

  beforeEach(() => {
    // The PDF renderer fetches the document and renders a blob: URL, so stub both.
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob(['%PDF-1.4'], { type: 'application/pdf' })),
    }) as unknown as typeof fetch;
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-pdf');
    global.URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the document and header when open', () => {
    render(<DocumentViewerModal {...baseProps} onClose={vi.fn()} />);
    expect(screen.getByText('Concrete Pad Report.pdf')).toBeInTheDocument();
  });

  it('does not render content when closed', () => {
    render(<DocumentViewerModal {...baseProps} isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByText('Concrete Pad Report.pdf')).not.toBeInTheDocument();
  });

  it('fetches the fileUrl and renders the resulting blob in the PDF view', async () => {
    render(<DocumentViewerModal {...baseProps} onClose={vi.fn()} />);
    expect(global.fetch).toHaveBeenCalledWith('/sample.pdf');
    const view = await screen.findByTestId('pdf-view');
    expect(view.getAttribute('data-file')).toBe('blob:mock-pdf');
  });

  it('shows the error state when the document fails to load', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 }) as unknown as typeof fetch;
    render(<DocumentViewerModal {...baseProps} onClose={vi.fn()} />);
    expect(await screen.findByText("We couldn't load this document.")).toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn();
    render(<DocumentViewerModal {...baseProps} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText('Close document viewer'));
    // Headless UI Dialog may also propagate a close, so we only assert it fired.
    expect(onClose).toHaveBeenCalled();
  });

  it('shows the unsupported fallback for docx instead of the PDF view', () => {
    render(
      <DocumentViewerModal
        {...baseProps}
        onClose={vi.fn()}
        fileType="docx"
        fileName="minutes.docx"
      />,
    );
    expect(screen.getByText("This file type can't be previewed yet.")).toBeInTheDocument();
    expect(screen.queryByTestId('pdf-view')).not.toBeInTheDocument();
    // A download action remains available (header + fallback both offer one).
    expect(screen.getAllByText('Download').length).toBeGreaterThan(0);
    // Unsupported types never trigger a fetch.
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('infers the renderer from the file extension when fileType is omitted', () => {
    render(
      <DocumentViewerModal
        isOpen
        onClose={vi.fn()}
        fileUrl="/reports/minutes.docx"
      />,
    );
    expect(screen.getByText("This file type can't be previewed yet.")).toBeInTheDocument();
  });
});
