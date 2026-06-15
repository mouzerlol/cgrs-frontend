'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2 } from 'lucide-react';
import WorkManagementNavBar from '@/components/work-management/WorkManagementNavBar';
import Card from '@/components/ui/Card';
import PropertyDirectoryTable from '@/components/work-management/PropertyDirectoryTable';
import { SignaturesPager } from '@/components/work-management/SignaturesPager';
import ConfirmActionModal from '@/components/work-management/ConfirmActionModal';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import {
  usePropertiesQuery,
  useRevokeRelationshipMutation,
  isVerificationReviewer,
  PROPERTY_DIRECTORY_PAGE_SIZE,
} from '@/hooks/useVerificationReview';
import type {
  PropertyDirectorySort,
  PropertyDirectoryOrder,
  PropertyMemberItem,
} from '@/lib/api/verification';

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full w-full overflow-hidden flex flex-col bg-bone">
      <WorkManagementNavBar
        title="Properties"
        showBackButton
        backHref="/admin"
        backLabel="Administration"
      />
      <main className="flex-1 min-h-0 overflow-y-auto">{children}</main>
    </div>
  );
}

export default function PropertiesPage() {
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  const reviewer = isVerificationReviewer(
    currentUser?.membership?.role,
    currentUser?.is_superadmin ?? false,
  );

  const [offset, setOffset] = useState(0);
  const [sort, setSort] = useState<PropertyDirectorySort>('address');
  const [order, setOrder] = useState<PropertyDirectoryOrder>('asc');
  const [pending, setPending] = useState<{ member: PropertyMemberItem; address: string } | null>(null);

  const { data, isLoading } = usePropertiesQuery({ offset, sort, order, enabled: reviewer });
  const revokeMutation = useRevokeRelationshipMutation();

  const handleSort = (field: PropertyDirectorySort) => {
    if (sort === field) {
      setOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSort(field);
      setOrder('asc');
    }
    setOffset(0);
  };

  const handleConfirm = async (reason?: string) => {
    if (!pending) return;
    await revokeMutation.mutateAsync({ relationshipId: pending.member.relationship_id, reason });
  };

  if (!userLoading && currentUser && !reviewer) {
    return (
      <Shell>
        <div className="flex h-full items-center justify-center">
          <Card variant="sage" className="p-12 text-center">
            <div className="mb-4 text-6xl">🔒</div>
            <h2 className="mb-2 font-display text-2xl text-forest">Access Denied</h2>
            <p className="text-forest/60">You don&apos;t have permission to view properties.</p>
          </Card>
        </div>
      </Shell>
    );
  }

  const properties = data?.properties ?? [];
  const total = data?.total ?? 0;
  const hasMore = data?.has_more ?? false;

  const subjectName = pending
    ? `${pending.member.first_name || ''} ${pending.member.last_name || ''}`.trim() || 'this user'
    : '';

  return (
    <Shell>
      <div className="mx-auto max-w-5xl p-6 md:p-8 lg:p-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="overflow-hidden bg-white">
            <div className="border-b border-sage/20 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-forest/10">
                  <Building2 className="h-5 w-5 text-forest" />
                </div>
                <div>
                  <h2 className="font-display text-xl text-forest">Properties</h2>
                  <p className="text-sm text-forest/50">
                    {total} {total === 1 ? 'property' : 'properties'} with verified members
                  </p>
                </div>
              </div>
            </div>

            {isLoading || userLoading ? (
              <div className="space-y-4 p-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-14 animate-pulse rounded-lg bg-sage/10" />
                ))}
              </div>
            ) : (
              <>
                <PropertyDirectoryTable
                  properties={properties}
                  reviewer={reviewer}
                  sort={sort}
                  order={order}
                  onSort={handleSort}
                  onRevoke={(member, address) => setPending({ member, address })}
                />
                <SignaturesPager
                  total={total}
                  offset={offset}
                  limit={PROPERTY_DIRECTORY_PAGE_SIZE}
                  hasMore={hasMore}
                  onChangeOffset={setOffset}
                />
              </>
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
              {pending.member.email ? ` (${pending.member.email})` : ''} as{' '}
              <strong>{pending.member.relationship_type}</strong> of <strong>{pending.address}</strong>?
              This removes their verified access for this property and notifies them.
            </span>
          ) : null
        }
      />
    </Shell>
  );
}
