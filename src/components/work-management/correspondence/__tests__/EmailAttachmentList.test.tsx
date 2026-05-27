import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import EmailAttachmentList, { type EmailAttachment } from '../EmailAttachmentList';

const mockGetToken = vi.fn().mockResolvedValue('test-token');

vi.mock('@clerk/nextjs', () => ({
  useAuth: () => ({ getToken: mockGetToken }),
}));

describe('EmailAttachmentList', () => {
  const messageId = 'msg-1';
  const attachments: EmailAttachment[] = [
    {
      id: 'att-1',
      filename: 'report.pdf',
      content_type: 'application/pdf',
      byte_size: 12_345,
      inline: false,
    },
    {
      id: 'att-2',
      filename: 'photo.jpg',
      content_type: 'image/jpeg',
      byte_size: 2_500_000,
      inline: false,
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
    mockGetToken.mockResolvedValue('test-token');
  });

  it('lists all attachments with filename and human-formatted size', () => {
    render(<EmailAttachmentList attachments={attachments} messageId={messageId} />);
    expect(screen.getByText('report.pdf')).toBeInTheDocument();
    expect(screen.getByText('photo.jpg')).toBeInTheDocument();
    expect(screen.getByText(/12\.\d+\s*KB/i)).toBeInTheDocument();
    expect(screen.getByText(/2\.\d+\s*MB/i)).toBeInTheDocument();
  });

  it('renders nothing when there are no attachments', () => {
    const { container } = render(<EmailAttachmentList attachments={[]} messageId={messageId} />);
    expect(container.firstChild).toBeNull();
  });

  it('fetches the download URL and assigns window.location on download click', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({
          download_url: 'https://r2.example.com/signed/att-1',
          expires_in_seconds: 300,
        }),
      json: async () => ({
        download_url: 'https://r2.example.com/signed/att-1',
        expires_in_seconds: 300,
      }),
    });
    vi.stubGlobal('fetch', fetchSpy);

    const assignSpy = vi.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...window.location, assign: assignSpy },
    });

    render(<EmailAttachmentList attachments={attachments} messageId={messageId} />);
    fireEvent.click(screen.getAllByRole('button', { name: /download/i })[0]);

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining(`/api/v1/emails/messages/${messageId}/attachments/att-1/download-url`),
        expect.objectContaining({ headers: expect.any(Object) }),
      );
      expect(assignSpy).toHaveBeenCalledWith('https://r2.example.com/signed/att-1');
    });
  });
});
