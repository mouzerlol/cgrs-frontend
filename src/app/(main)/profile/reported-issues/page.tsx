'use client';

import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import { getMyRequests } from '@/lib/api/management-requests';
import { Skeleton } from '@/components/ui/Skeleton';
import CompactIssueRow from '@/components/profile/CompactIssueRow';
import { Icon } from '@iconify/react';

export default function ReportedIssuesPage() {
  const { getToken, isSignedIn } = useAuth();
  const { data, isLoading, error } = useQuery({
    queryKey: ['management-requests', 'mine'],
    queryFn: () => getMyRequests(getToken),
    enabled: isSignedIn,
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl text-forest">Reported Issues</h2>
        <Link
          href="/management-request"
          className="inline-flex items-center gap-2 rounded-xl bg-terracotta px-4 py-2 text-sm font-semibold text-bone transition-colors hover:bg-terracotta/90"
        >
          <Icon icon="lucide:plus" className="w-4 h-4" />
          Submit a Request
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-2 rounded-xl bg-white p-4 shadow-[0_8px_32px_rgba(26,34,24,0.08)]">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 rounded-xl px-4 py-3">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-4 flex-1 rounded" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-[0_8px_32px_rgba(26,34,24,0.08)]">
          <p className="text-terracotta">We couldn&apos;t load your requests right now.</p>
        </div>
      ) : data && data.length > 0 ? (
        <div className="divide-y divide-sage/10 rounded-xl bg-white shadow-[0_8px_32px_rgba(26,34,24,0.08)]">
          {data.map(({ request, task }) => (
            <CompactIssueRow
              key={request.id}
              id={request.id}
              title={task.title}
              category={request.category}
              status={request.status as 'open' | 'in_progress' | 'closed' | 'withdrawn'}
              submittedAt={request.submitted_at}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl bg-white p-8 text-center shadow-[0_8px_32px_rgba(26,34,24,0.08)]">
          <p className="mb-4 text-forest/70">You haven&apos;t submitted any requests yet.</p>
          <Link
            href="/management-request"
            className="text-sm font-semibold text-terracotta hover:underline"
          >
            Submit a Request
          </Link>
        </div>
      )}
    </div>
  );
}
