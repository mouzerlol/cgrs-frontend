'use client';

import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import PageHeader from '@/components/sections/PageHeader';
import { getMyRequests } from '@/lib/api/management-requests';
import { formatRelativeDate } from '@/lib/utils';

export default function MyRequestsPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { data, isLoading, error } = useQuery({
    queryKey: ['management-requests', 'mine'],
    queryFn: () => getMyRequests(getToken),
    enabled: isSignedIn,
  });

  return (
    <div>
      <PageHeader
        title="My Requests"
        description="Track the management requests you have submitted and see the linked work tasks."
        eyebrow="Resident Portal"
        variant="compact"
        backgroundImage="/images/mangere-mountain.jpg"
      />

      <section className="section bg-bone">
        <div className="container max-w-5xl">
          {!isLoaded || isLoading ? (
            <div className="rounded-card bg-white p-8 text-forest shadow-[0_8px_32px_rgba(26,34,24,0.08)]">
              Loading your requests...
            </div>
          ) : !isSignedIn ? (
            <div className="rounded-card bg-white p-8 text-forest shadow-[0_8px_32px_rgba(26,34,24,0.08)]">
              Please sign in to view your management requests.
            </div>
          ) : error ? (
            <div className="rounded-card bg-white p-8 text-terracotta shadow-[0_8px_32px_rgba(26,34,24,0.08)]">
              We couldn&apos;t load your requests right now.
            </div>
          ) : data && data.length > 0 ? (
            <div className="grid gap-4">
              {data.map(({ request, task }) => (
                <Link
                  key={request.id}
                  href={`/my-requests/${request.id}`}
                  className="rounded-card bg-white p-6 shadow-[0_8px_32px_rgba(26,34,24,0.08)] transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">
                        {request.category.replace('_', ' ')}
                      </p>
                      <h2 className="font-display text-2xl text-forest">{task.title}</h2>
                      <p className="max-w-2xl text-sm leading-relaxed text-forest/70">
                        {task.description}
                      </p>
                    </div>
                    <div className="min-w-[180px] space-y-2 text-sm text-forest/70">
                      <p>
                        <span className="font-semibold text-forest">Task status:</span> {task.status.replace('_', ' ')}
                      </p>
                      <p>
                        <span className="font-semibold text-forest">Request status:</span> {request.status}
                      </p>
                      <p>
                        <span className="font-semibold text-forest">Submitted:</span>{' '}
                        {formatRelativeDate(request.submitted_at)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-card bg-white p-8 text-forest shadow-[0_8px_32px_rgba(26,34,24,0.08)]">
              You haven&apos;t submitted any management requests yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
