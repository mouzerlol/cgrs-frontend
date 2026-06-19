'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { AlertCircle, Plus, AlertTriangle, Inbox } from 'lucide-react';
import { useManagementRequestsQuery } from '@/hooks/useProfileData';
import AccountSectionHeading from '@/components/profile/AccountSectionHeading';
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
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-9 w-40 rounded-lg" />
        </div>
        {/* Content skeleton */}
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex min-h-[60px] items-center gap-4 border border-sage/20 bg-white p-4">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <Skeleton className="hidden sm:block h-6 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const openRequests = requests?.filter(r => ['open', 'in_progress'].includes(r.request.status)) || [];
  const closedRequests = requests?.filter(r => ['closed', 'withdrawn'].includes(r.request.status)) || [];

  return (
    <motion.div
      className="space-y-6 lg:pl-8 lg:[&>*:first-child]:-ml-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <AccountSectionHeading
        eyebrow="Requests"
        title="Reported Issues"
        subtitle="Everything you've reported to the society, and where each one is up to."
        icon={AlertCircle}
        action={
          <Link
            href="/management-request"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-terracotta px-4 py-2 text-sm font-semibold text-bone transition-colors hover:bg-terracotta-dark"
          >
            <Plus className="w-4 h-4" />
            Submit a Request
          </Link>
        }
      />

      {/* Content */}
      <div>
        {error ? (
          <div className="rounded-card border border-terracotta/20 bg-terracotta/5 p-6 text-center">
            <div className="flex justify-center mb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-terracotta/10">
                <AlertTriangle className="h-6 w-6 text-terracotta" />
              </div>
            </div>
            <p className="text-forest">We couldn&apos;t load your reported issues just now. Please try again shortly.</p>
          </div>
        ) : requests && requests.length > 0 ? (
          <div className="space-y-4">
            {openRequests.length > 0 && (
              <motion.div
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: { staggerChildren: 0.05 }
                  }
                }}
                initial="hidden"
                animate="show"
              >
                <h3 className="text-xs font-semibold uppercase tracking-wider text-forest/50 mb-2 px-1">Open</h3>
                <div className="space-y-1">
                  {openRequests.map(({ request, task }) => (
                    <motion.div
                      key={request.id}
                      variants={{
                        hidden: { opacity: 0, y: 8 },
                        show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } }
                      }}
                    >
                      <CompactIssueRow
                        id={request.id}
                        title={task.title}
                        category={request.category}
                        status={request.status as 'open' | 'in_progress' | 'closed' | 'withdrawn'}
                        submittedAt={request.submitted_at}
                        priority={task.priority}
                        assigneeName={task.assignee_name}
                        assigneeAvatarUrl={task.assignee_avatar_url}
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {closedRequests.length > 0 && (
              <motion.div
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: { staggerChildren: 0.05, delayChildren: 0.1 }
                  }
                }}
                initial="hidden"
                animate="show"
              >
                <h3 className="text-xs font-semibold uppercase tracking-wider text-forest/50 mb-2 px-1">Closed</h3>
                <div className="space-y-1">
                  {closedRequests.map(({ request, task }) => (
                    <motion.div
                      key={request.id}
                      variants={{
                        hidden: { opacity: 0, y: 8 },
                        show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } }
                      }}
                    >
                      <CompactIssueRow
                        id={request.id}
                        title={task.title}
                        category={request.category}
                        status={request.status as 'open' | 'in_progress' | 'closed' | 'withdrawn'}
                        submittedAt={request.submitted_at}
                        priority={task.priority}
                        assigneeName={task.assignee_name}
                        assigneeAvatarUrl={task.assignee_avatar_url}
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        ) : (
          <div className="rounded-card border border-sage/20 bg-white p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sage/10">
                <Inbox className="h-8 w-8 text-sage" />
              </div>
            </div>
            <p className="mb-1 font-display text-lg text-forest">Nothing reported yet</p>
            <p className="mb-4 text-sm text-forest/60">
              Spotted something around the neighbourhood that needs attention? Let the society know.
            </p>
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