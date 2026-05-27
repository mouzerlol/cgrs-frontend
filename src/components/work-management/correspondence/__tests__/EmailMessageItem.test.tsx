import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EmailMessageItem, { type CorrespondenceMessage } from '../EmailMessageItem';

const mockGetToken = vi.fn().mockResolvedValue('test-token');
vi.mock('@clerk/nextjs', () => ({
  useAuth: () => ({ getToken: mockGetToken }),
}));

const baseMessage: CorrespondenceMessage = {
  id: 'msg-1',
  thread_id: 'thr-1',
  direction: 'inbound',
  subject: 'Roof leak update',
  body_text: 'Plain text body of the message.',
  body_html: '<p>HTML <b>body</b><script>alert(1)</script></p>',
  received_at: '2025-06-01T10:00:00Z',
  sent_at: null,
  sender: {
    type: 'user',
    name: 'Sender User',
    email: 'sender@example.com',
    avatar_url: null,
  },
  attachments: [],
};

describe('EmailMessageItem', () => {
  it('renders body_text by default and shows subject + sender chip', () => {
    render(<EmailMessageItem message={baseMessage} />);
    expect(screen.getByText('Plain text body of the message.')).toBeInTheDocument();
    expect(screen.getByText('Roof leak update')).toBeInTheDocument();
    expect(screen.getByText('Sender User')).toBeInTheDocument();
  });

  it('toggles to HTML view and sanitizes via DOMPurify (no <script>)', () => {
    render(<EmailMessageItem message={baseMessage} />);
    fireEvent.click(screen.getByRole('button', { name: /show html/i }));
    const htmlContainer = screen.getByTestId('email-html-body');
    expect(htmlContainer.innerHTML).toContain('<b>body</b>');
    expect(htmlContainer.innerHTML).not.toContain('<script>');
    expect(htmlContainer.innerHTML).not.toContain('alert(1)');
  });

  it('rewrites cid: inline image URLs to the attachment download endpoint', () => {
    const messageWithInline: CorrespondenceMessage = {
      ...baseMessage,
      body_html: '<p>See attached: <img src="cid:logo123"></p>',
      attachments: [
        {
          id: 'att-1',
          filename: 'logo.png',
          content_type: 'image/png',
          byte_size: 1234,
          inline: true,
          content_id: 'logo123',
        },
      ],
    };
    render(<EmailMessageItem message={messageWithInline} />);
    fireEvent.click(screen.getByRole('button', { name: /show html/i }));
    const htmlContainer = screen.getByTestId('email-html-body');
    const img = htmlContainer.querySelector('img');
    expect(img).not.toBeNull();
    expect(img!.getAttribute('src')).toContain(`/api/v1/emails/messages/${messageWithInline.id}/attachments/att-1/inline`);
  });

  it('renders nothing when both text and html bodies are missing', () => {
    const empty: CorrespondenceMessage = { ...baseMessage, body_text: null, body_html: null };
    render(<EmailMessageItem message={empty} />);
    expect(screen.getByText(/no body/i)).toBeInTheDocument();
  });
});
