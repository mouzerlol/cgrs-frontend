'use client';

import { use, useState } from 'react';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';
import WorkManagementNavBar from '@/components/work-management/WorkManagementNavBar';
import Card from '@/components/ui/Card';
import PropertyMembersTable from '@/components/work-management/PropertyMembersTable';
import ConfirmActionModal from '@/components/work-management/ConfirmActionModal';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import {
  usePropertyMembersQuery,
  useRevokeRelationshipMutation,
  isVerificationReviewer,
} from '@/hooks/useVerificationReview';
import type { PropertyMemberItem } from '@/lib/api/verification';

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full w-full overflow-hidden flex flex-col bg-bone">
      <WorkManagementNavBar
        title="Property members"
        showBackButton
        backHref="/work-management/verifications"
        backLabel="Verifications"
      />
      <main className="flex-1 min-h-0 overflow-y-auto">{children}</main>
    </div>
  );
}

export default function PropertyMembersPage({
  params,
}: {
  params: Promise<{ propertyId: string }>;
}) {
  const { propertyId } = use(params);
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  const reviewer = isVerificationReviewer(
    currentUser?.membership?.role,
    currentUser?.is_superadmin ?? false,
  );

  const { data, isLoading } = usePropertyMembersQuery(propertyId, reviewer);
  const revokeMutation = useRevokeRelationshipMutation();
  const [pending, setPending] = useState<PropertyMemberItem | null>(null);

  if (!userLoading && currentUser && !reviewer) {
    return (
      <Shell>
        <div className="flex h-full items-center justify-center">
          <Card variant="sage" className="p-12 text-center">
            <div className="mb-4 text-6xl">🔒</div>
            <h2 className="mb-2 font-display text-2xl text-forest">Access Denied</h2>
            <p className="text-forest/60">You don&apos;t have permission to manage property members.</p>
          </Card>
        </div>
      </Shell>
    );
  }

  const members = data?.members ?? [];
  const address = data ? `${data.street_number} ${data.street_name}` : '';

  const handleConfirm = async (reason?: string) => {
    if (!pending) return;
    await revokeMutation.mutateAsync({ relationshipId: pending.relationship_id, reason });
  };

  const subjectName = pending
    ? `${pending.first_name || ''} ${pending.last_name || ''}`.trim() || 'this user'
    : '';

  return (
    <Shell>
      <div className="mx-auto max-w-5xl p-6 md:p-8 lg:p-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="overflow-hidden bg-white">
            <div className="border-b border-sage/20 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-forest/10">
                  <Home className="h-5 w-5 text-forest" />
                </div>
                <div>
                  <h2 className="font-display text-xl text-forest">{address || 'Property members'}</h2>
                  <p className="text-sm text-forest/50">
                    {members.length} active {members.length === 1 ? 'member' : 'members'}
                  </p>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-4 p-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 animate-pulse rounded-lg bg-sage/10" />
                ))}
              </div>
            ) : (
              <PropertyMembersTable members={members} onRevoke={(m) => setPending(m)} />
            )}
          </div>
        </motion.div>
      </div>

      <ConfirmActionModal
        isOpen={!!pending}
        onClose={() => setPending(null)}
        title="Revoke relationship"
        confirmLabel="Confirm revoke"
        intent="danger"
        withNote
        noteLabel="Reason (optional)"
        notePlaceholder="Why is this relationship being revoked?"
        onConfirm={handleConfirm}
        message={
          pending ? (
            <span>
              Revoke <strong>{subjectName}</strong>
              {pending.email ? ` (${pending.email})` : ''} as <strong>{pending.relationship_type}</strong>{' '}
              of <strong>{address}</strong>? This removes their verified access for this property and
              notifies them.
            </span>
          ) : null
        }
      />
    </Shell>
  );
}
