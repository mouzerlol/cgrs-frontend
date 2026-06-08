'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import WorkManagementNavBar from '@/components/work-management/WorkManagementNavBar';
import Card from '@/components/ui/Card';
import ReviewQueueTable from '@/components/work-management/ReviewQueueTable';
import ConfirmActionModal from '@/components/work-management/ConfirmActionModal';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import {
  useReviewQueueQuery,
  useReviewVerificationMutation,
  isVerificationReviewer,
} from '@/hooks/useVerificationReview';
import type { ReviewQueueItem } from '@/lib/api/verification';

type PendingAction = { kind: 'approve' | 'reject'; item: ReviewQueueItem } | null;

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full w-full overflow-hidden flex flex-col bg-bone">
      <WorkManagementNavBar
        title="Verifications"
        showBackButton
        backHref="/work-management"
        backLabel="Work Management"
      />
      <main className="flex-1 min-h-0 overflow-y-auto">{children}</main>
    </div>
  );
}

export default function VerificationsReviewPage() {
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  const reviewer = isVerificationReviewer(
    currentUser?.membership?.role,
    currentUser?.is_superadmin ?? false,
  );

  const { data, isLoading } = useReviewQueueQuery(reviewer);
  const reviewMutation = useReviewVerificationMutation();
  const [pending, setPending] = useState<PendingAction>(null);

  if (!userLoading && currentUser && !reviewer) {
    return (
      <Shell>
        <div className="flex h-full items-center justify-center">
          <Card variant="sage" className="p-12 text-center">
            <div className="mb-4 text-6xl">🔒</div>
            <h2 className="mb-2 font-display text-2xl text-forest">Access Denied</h2>
            <p className="text-forest/60">You don&apos;t have permission to review verifications.</p>
          </Card>
        </div>
      </Shell>
    );
  }

  const items = data?.items ?? [];

  const handleConfirm = async (note?: string) => {
    if (!pending) return;
    await reviewMutation.mutateAsync({
      requestId: pending.item.request_id,
      approved: pending.kind === 'approve',
      note,
    });
  };

  const subject = pending?.item;

  return (
    <Shell>
      <div className="mx-auto max-w-7xl p-6 md:p-8 lg:p-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="overflow-hidden bg-white">
            <div className="border-b border-sage/20 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-forest/10">
                  <ShieldCheck className="h-5 w-5 text-forest" />
                </div>
                <div>
                  <h2 className="font-display text-xl text-forest">Verification Queue</h2>
                  <p className="text-sm text-forest/50">
                    {items.length} pending {items.length === 1 ? 'request' : 'requests'} awaiting review
                  </p>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-4 p-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-14 animate-pulse rounded-lg bg-sage/10" />
                ))}
              </div>
            ) : (
              <ReviewQueueTable
                items={items}
                onApprove={(item) => setPending({ kind: 'approve', item })}
                onReject={(item) => setPending({ kind: 'reject', item })}
              />
            )}
          </div>
        </motion.div>
      </div>

      <ConfirmActionModal
        isOpen={!!pending}
        onClose={() => setPending(null)}
        title={pending?.kind === 'approve' ? 'Confirm verification' : 'Reject verification'}
        confirmLabel={pending?.kind === 'approve' ? 'Confirm verify' : 'Confirm reject'}
        intent={pending?.kind === 'approve' ? 'primary' : 'danger'}
        withNote={pending?.kind === 'reject'}
        noteLabel="Reason (optional)"
        notePlaceholder="Why is this request being rejected?"
        onConfirm={handleConfirm}
        message={
          subject ? (
            <span>
              {pending?.kind === 'approve' ? 'Verify' : 'Reject'}{' '}
              <strong>{subject.requester_name || 'this user'}</strong>
              {subject.email ? ` (${subject.email})` : ''} as{' '}
              <strong>{subject.verification_type}</strong> of{' '}
              <strong>
                {subject.street_number} {subject.street_name}
              </strong>
              ?{' '}
              {pending?.kind === 'approve'
                ? 'This grants them verified access for this property.'
                : 'They will be notified that the request was not approved.'}
            </span>
          ) : null
        }
      />
    </Shell>
  );
}
