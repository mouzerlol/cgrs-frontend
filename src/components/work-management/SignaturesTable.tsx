'use client';

import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatRelativeTimeShort } from '@/lib/format-relative-time';
import { maskEmail } from '@/lib/format-mask-email';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import { MaskedValue } from '@/components/work-management/MaskedValue';
import type {
  AdminSignatureResponse,
  ResidentTypeEnum,
  SignatureSortField,
  SignatureSortOrder,
} from '@/types/admin';

const SORTABLE_FIELDS: SignatureSortField[] = ['name', 'email', 'resident_type', 'signed_at'];

interface SignaturesTableProps {
  signatures: AdminSignatureResponse[];
  sort: SignatureSortField;
  order: SignatureSortOrder;
  onSortChange: (sort: SignatureSortField, order: SignatureSortOrder) => void;
  onDelete: (id: string) => void;
  deletingIds: ReadonlySet<string>;
  rowErrorById?: Record<string, string | undefined>;
}

const residentTypeBadgeVariant: Record<ResidentTypeEnum, BadgeVariant> = {
  owner: 'forest',
  tenant: 'default',
};

const headerLabelClass =
  'font-display text-xs font-medium uppercase tracking-wider text-forest/40';

function PlainHeaderLabel({ label }: { label: string }) {
  return <span className={headerLabelClass}>{label}</span>;
}

function SortableHeader({
  label,
  field,
  currentSort,
  direction,
  onSort,
}: {
  label: string;
  field: SignatureSortField;
  currentSort: SignatureSortField;
  direction: SignatureSortOrder;
  onSort: (field: SignatureSortField) => void;
}) {
  const isActive = currentSort === field;
  const SortIcon = direction === 'asc' ? ArrowUp : ArrowDown;

  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className={cn(
        'inline-flex items-center gap-1.5 text-left transition-colors',
        headerLabelClass,
        'hover:text-forest/65',
        isActive && 'text-forest',
      )}
    >
      <span>{label}</span>
      {isActive && <SortIcon className="h-3.5 w-3.5 shrink-0 text-forest" aria-hidden />}
    </button>
  );
}

function formatResidentType(type: ResidentTypeEnum): string {
  return type === 'owner' ? 'Owner' : 'Tenant';
}

export default function SignaturesTable({
  signatures,
  sort,
  order,
  onSortChange,
  onDelete,
  deletingIds,
  rowErrorById,
}: SignaturesTableProps) {
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

  // Clear reveal state and any pending confirmation when sort changes — the page
  // also clears it on offset changes by remounting the table via the query key.
  useEffect(() => {
    setRevealed(new Set());
    setConfirmingDeleteId(null);
  }, [sort, order]);

  // Document-level Escape listener while a confirmation is open.
  useEffect(() => {
    if (confirmingDeleteId === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setConfirmingDeleteId(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [confirmingDeleteId]);

  const handleSort = (field: SignatureSortField) => {
    if (sort === field) {
      onSortChange(field, order === 'asc' ? 'desc' : 'asc');
    } else {
      onSortChange(field, 'asc');
    }
  };

  const toggleReveal = (id: string, kind: 'ip' | 'email') => {
    setRevealed((prev) => {
      const next = new Set(prev);
      const key = `${id}:${kind}`;
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleTrash = (id: string) => {
    setConfirmingDeleteId(id);
  };

  const handleCancel = () => {
    setConfirmingDeleteId(null);
  };

  const handleConfirm = (id: string) => {
    onDelete(id);
    setConfirmingDeleteId(null);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-sage/20">
            <th className="py-3 px-4 text-left">
              <SortableHeader
                label="Name"
                field="name"
                currentSort={sort}
                direction={order}
                onSort={handleSort}
              />
            </th>
            <th className="py-3 px-4 text-left hidden md:table-cell">
              <SortableHeader
                label="Email"
                field="email"
                currentSort={sort}
                direction={order}
                onSort={handleSort}
              />
            </th>
            <th className="py-3 px-4 text-left">
              <SortableHeader
                label="Resident Type"
                field="resident_type"
                currentSort={sort}
                direction={order}
                onSort={handleSort}
              />
            </th>
            <th className="py-3 px-4 text-left hidden lg:table-cell">
              <PlainHeaderLabel label="Address" />
            </th>
            <th className="py-3 px-4 text-left hidden xl:table-cell">
              <PlainHeaderLabel label="IP Address" />
            </th>
            <th className="py-3 px-4 text-left hidden md:table-cell">
              <PlainHeaderLabel label="Email Updates" />
            </th>
            <th className="py-3 px-4 text-left">
              <SortableHeader
                label="Signed At"
                field="signed_at"
                currentSort={sort}
                direction={order}
                onSort={handleSort}
              />
            </th>
            <th className="py-3 px-2 w-1" aria-label="Row actions" />
          </tr>
        </thead>
        <tbody>
          {signatures.map((sig, index) => {
            const emailKey = `${sig.id}:email`;
            const ipKey = `${sig.id}:ip`;
            const isConfirming = confirmingDeleteId === sig.id;
            const isDeleting = deletingIds.has(sig.id);
            const rowError = rowErrorById?.[sig.id];
            return (
              <tr
                key={sig.id}
                className={cn(
                  'border-b border-sage/10 transition-colors hover:bg-sage-light/30',
                  'animate-fade-up',
                )}
                style={{ animationDelay: `${index * 30}ms`, animationFillMode: 'both' }}
              >
                <td className="py-3 px-4">
                  <span className="font-body text-sm font-medium text-forest">
                    {sig.first_name} {sig.last_name}
                  </span>
                </td>
                <td className="py-3 px-4 hidden md:table-cell">
                  <MaskedValue
                    value={sig.email}
                    masked={maskEmail(sig.email)}
                    isRevealed={revealed.has(emailKey)}
                    onToggle={() => toggleReveal(sig.id, 'email')}
                    ariaLabelHide="Hide email"
                    ariaLabelReveal="Reveal email"
                  />
                </td>
                <td className="py-3 px-4">
                  <Badge variant={residentTypeBadgeVariant[sig.resident_type]} size="sm">
                    {formatResidentType(sig.resident_type)}
                  </Badge>
                </td>
                <td className="py-3 px-4 hidden lg:table-cell">
                  {sig.address ? (
                    <span className="font-body text-xs text-forest/70">{sig.address}</span>
                  ) : (
                    <span className="text-forest/30">—</span>
                  )}
                </td>
                <td className="py-3 px-4 hidden xl:table-cell">
                  <MaskedValue
                    value={sig.ip_address}
                    masked="•••.•••.•••.•••"
                    isRevealed={revealed.has(ipKey)}
                    onToggle={() => toggleReveal(sig.id, 'ip')}
                    ariaLabelHide="Hide IP address"
                    ariaLabelReveal="Reveal IP address"
                  />
                </td>
                <td className="py-3 px-4 hidden md:table-cell">
                  {sig.email_updates_consent ? (
                    <span
                      title={
                        sig.consent_recorded_at
                          ? `Recorded ${new Date(sig.consent_recorded_at).toLocaleString()}`
                          : undefined
                      }
                    >
                      <Badge variant="forest" size="sm">
                        Opted in
                      </Badge>
                    </span>
                  ) : (
                    <span className="text-forest/30" aria-label="No email updates consent">
                      —
                    </span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm text-forest/70">
                    {formatRelativeTimeShort(sig.signed_at)}
                  </span>
                </td>
                <td className="py-3 px-2 text-right">
                  {isConfirming ? (
                    <div className="inline-flex items-center gap-2 text-xs">
                      <span className="text-terracotta font-medium">Delete?</span>
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="px-2 py-1 rounded-full text-forest/60 hover:bg-sage/10 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleConfirm(sig.id)}
                        disabled={isDeleting}
                        className="px-2 py-1 rounded-full bg-terracotta text-bone hover:bg-terracotta/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isDeleting ? 'Deleting…' : 'Confirm'}
                      </button>
                    </div>
                  ) : rowError ? (
                    <span className="text-xs text-terracotta">{rowError}</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleTrash(sig.id)}
                      aria-label="Delete signature"
                      className="p-1.5 rounded-full text-forest/40 hover:bg-sage/10 hover:text-terracotta transition-colors"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden />
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {signatures.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-forest/50 font-display text-lg">No signatures yet</p>
          <p className="text-forest/30 text-sm mt-1">
            Signatures will appear here as residents sign the petition
          </p>
        </div>
      )}
    </div>
  );
}

export { SORTABLE_FIELDS };
