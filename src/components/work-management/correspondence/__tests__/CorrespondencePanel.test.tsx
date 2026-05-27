import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CorrespondencePanel from '../CorrespondencePanel';
import type { CorrespondenceMessage } from '../EmailMessageItem';

const mockGetToken = vi.fn().mockResolvedValue('test-token');
vi.mock('@clerk/nextjs', () => ({
  useAuth: () => ({ getToken: mockGetToken, isSignedIn: true, isLoaded: true }),
}));

function withQueryClient(node: React.ReactNode) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={qc}>{node}</QueryClientProvider>;
}

function makeMessage(overrides: Partial<CorrespondenceMessage> = {}): CorrespondenceMessage {
  return {
    id: overrides.id ?? 'msg-1',
    thread_id: 'thr-1',
    direction: 'inbound',
    subject: overrides.subject ?? 'Test subject',
    body_text: overrides.body_text ?? 'Hello world',
    body_html: null,
    received_at: overrides.received_at ?? '2025-06-01T10:00:00Z',
    sent_at: null,
    sender: overrides.sender ?? {
      type: 'user',
      name: 'Sender',
      email: 'sender@example.com',
      avatar_url: null,
    },
    attachments: overrides.attachments ?? [],
  };
}

describe('CorrespondencePanel', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the empty state when API returns no messages', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ messages: [], next_cursor: null }),
      json: async () => ({ messages: [], next_cursor: null }),
    });
    vi.stubGlobal('fetch', fetchSpy);

    render(withQueryClient(<CorrespondencePanel taskId="task-1" />));

    await waitFor(() => {
      expect(
        screen.getByText(/no email correspondence is linked to this task yet/i),
      ).toBeInTheDocument();
    });
  });

  it('renders a single message returned from the API', async () => {
    const message = makeMessage({ body_text: 'Single message body' });
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ messages: [message], next_cursor: null }),
      json: async () => ({ messages: [message], next_cursor: null }),
    });
    vi.stubGlobal('fetch', fetchSpy);

    render(withQueryClient(<CorrespondencePanel taskId="task-1" />));

    await waitFor(() => {
      expect(screen.getByText('Single message body')).toBeInTheDocument();
    });
  });

  it('refresh button refetches the messages', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ messages: [], next_cursor: null }),
      json: async () => ({ messages: [], next_cursor: null }),
    });
    vi.stubGlobal('fetch', fetchSpy);

    render(withQueryClient(<CorrespondencePanel taskId="task-1" />));
    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole('button', { name: /refresh correspondence/i }));
    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(2));
  });

  it('shows a load-older button when the API hints there are more messages', async () => {
    const message = makeMessage();
    // First page returns a `next_cursor` to indicate more available
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () =>
          JSON.stringify({ messages: [message], next_cursor: 'cursor-2' }),
        json: async () => ({ messages: [message], next_cursor: 'cursor-2' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () =>
          JSON.stringify({ messages: [{ ...message, id: 'msg-2', body_text: 'Older' }], next_cursor: null }),
        json: async () => ({
          messages: [{ ...message, id: 'msg-2', body_text: 'Older' }],
          next_cursor: null,
        }),
      });
    vi.stubGlobal('fetch', fetchSpy);

    render(withQueryClient(<CorrespondencePanel taskId="task-1" />));
    await waitFor(() => expect(screen.getByText('Hello world')).toBeInTheDocument());

    const loadOlder = await screen.findByRole('button', { name: /load older/i });
    fireEvent.click(loadOlder);

    await waitFor(() => expect(screen.getByText('Older')).toBeInTheDocument());
  });
});
