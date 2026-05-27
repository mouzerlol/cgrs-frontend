'use client';

import { useCallback, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import { Loader2, RefreshCw } from 'lucide-react';
import { apiRequest, ApiError } from '@/lib/api/client';
import EmailMessageItem, { type CorrespondenceMessage } from './EmailMessageItem';

interface CorrespondencePanelProps {
  taskId: string;
}

interface MessagesPage {
  messages: CorrespondenceMessage[];
  next_cursor: string | null;
}

const PAGE_SIZE = 20;

async function fetchPage(
  taskId: string,
  cursor: string | null,
  getToken: () => Promise<string | null>,
): Promise<MessagesPage> {
  const params = new URLSearchParams({ limit: String(PAGE_SIZE) });
  if (cursor) params.set('cursor', cursor);
  return apiRequest<MessagesPage>(
    `/api/v1/emails/messages/by-task/${taskId}?${params.toString()}`,
    getToken,
  );
}

export default function CorrespondencePanel({ taskId }: CorrespondencePanelProps) {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  const [olderPages, setOlderPages] = useState<MessagesPage[]>([]);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [loadOlderError, setLoadOlderError] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = useQuery<MessagesPage, Error>({
    queryKey: ['correspondence', taskId],
    queryFn: () => fetchPage(taskId, null, getToken),
    enabled: isLoaded && !!isSignedIn,
  });

  const handleRefresh = useCallback(() => {
    setOlderPages([]);
    setLoadOlderError(null);
    refetch();
  }, [refetch]);

  const loadOlder = useCallback(async () => {
    const latestCursor = olderPages.length
      ? olderPages[olderPages.length - 1].next_cursor
      : (data?.next_cursor ?? null);
    if (!latestCursor) return;
    setLoadingOlder(true);
    setLoadOlderError(null);
    try {
      const next = await fetchPage(taskId, latestCursor, getToken);
      setOlderPages((prev) => [...prev, next]);
    } catch (e) {
      setLoadOlderError(e instanceof Error ? e.message : 'Failed to load older messages');
    } finally {
      setLoadingOlder(false);
    }
  }, [data?.next_cursor, getToken, olderPages, taskId]);

  const allMessages: CorrespondenceMessage[] = [
    ...(data?.messages ?? []),
    ...olderPages.flatMap((p) => p.messages),
  ];

  const hasMore = olderPages.length
    ? Boolean(olderPages[olderPages.length - 1].next_cursor)
    : Boolean(data?.next_cursor);

  if (!isLoaded || isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-forest/40" aria-label="Loading correspondence" />
      </div>
    );
  }

  if (isError) {
    const status = error instanceof ApiError ? error.status : null;
    const message =
      status === 403
        ? 'You do not have permission to view correspondence for this task.'
        : (error?.message ?? 'Failed to load correspondence.');
    return (
      <div className="rounded-none border border-sage/20 bg-bone/30 px-4 py-6 text-center" role="alert">
        <p className="text-sm text-forest/70">{message}</p>
        {status !== 403 ? (
          <button
            type="button"
            onClick={handleRefresh}
            className="mt-3 text-[11px] font-bold uppercase tracking-wider text-forest underline-offset-2 hover:underline"
          >
            Retry
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-forest/50">
          Correspondence
        </h3>
        <button
          type="button"
          onClick={handleRefresh}
          aria-label="Refresh correspondence"
          className="inline-flex items-center gap-1.5 rounded-none border border-sage/20 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-forest/70 hover:bg-sage-light/30"
        >
          <RefreshCw className="h-3 w-3" aria-hidden />
          Refresh
        </button>
      </div>

      {allMessages.length === 0 ? (
        <div className="rounded-none border border-dashed border-sage/30 bg-sage-light/20 px-4 py-10 text-center">
          <p className="text-sm text-forest/60 max-w-md mx-auto leading-relaxed">
            No email correspondence is linked to this task yet. When residents or the
            society manager email about this issue, messages will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {allMessages.map((m, idx) => {
            const prev = allMessages[idx - 1];
            const hideSubject = Boolean(prev && prev.subject === m.subject);
            return <EmailMessageItem key={m.id} message={m} hideSubject={hideSubject} />;
          })}
        </div>
      )}

      {hasMore ? (
        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={loadOlder}
            disabled={loadingOlder}
            className="inline-flex items-center gap-1.5 rounded-none border border-sage/30 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-forest hover:bg-sage-light/40 disabled:opacity-50"
          >
            {loadingOlder ? <Loader2 className="h-3 w-3 animate-spin" aria-hidden /> : null}
            Load older
          </button>
          {loadOlderError ? (
            <p className="text-[11px] text-red-700" role="alert">
              {loadOlderError}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
