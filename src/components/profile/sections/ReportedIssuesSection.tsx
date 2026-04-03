'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { AlertCircle, Plus, AlertTriangle, Inbox } from 'lucide-react';
import { useManagementRequestsQuery } from '@/hooks/useProfileData';
import { Skeleton } from '@/components/ui/Skeleton';
import CompactIssueRow from '@/components/profile/CompactIssueRow';

export default function ReportedIssuesSection() {
  const { data: requests, isLoading, error } = useManagementRequestsQuery();

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        {/* Content skeleton */}
        <div className="ml-14 space-y-4">
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-12 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header with icon */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber/10">
          <AlertCircle className="h-6 w-6 text-amber" />
        </div>
        <div>
          <h2 className="font-display text-2xl text-forest">Reported Issues</h2>
          <p className="text-sm text-forest/60">
            Track and manage your submitted requests and issues.
          </p>
        </div>
      </div>

      {/* Submit new request button */}
      <div className="ml-14">
        <Link
          href="/management-request"
          className="inline-flex items-center gap-2 rounded-xl bg-terracotta px-4 py-2 text-sm font-semibold text-bone transition-colors hover:bg-terracotta/90"
        >
          <Plus className="w-4 h-4" />
          Submit a Request
        </Link>
      </div>

      {/* Content */}
      <div className="ml-14">
        {error ? (
          <div className="rounded-xl bg-terracotta/10 p-6 text-center shadow-[0_8px_32px_rgba(26,34,24,0.08)]">
            <div className="flex justify-center mb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-terracotta/10">
                <AlertTriangle className="h-6 w-6 text-terracotta" />
              </div>
            </div>
            <p className="text-terracotta">We couldn&apos;t load your requests right now.</p>
          </div>
        ) : requests && requests.length > 0 ? (
          <div className="divide-y divide-sage/10 rounded-xl bg-white shadow-[0_8px_32px_rgba(26,34,24,0.08)]">
            {requests.map(({ request, task }) => (
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
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sage/10">
                <Inbox className="h-8 w-8 text-sage" />
              </div>
            </div>
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
    </motion.div>
  );
}
