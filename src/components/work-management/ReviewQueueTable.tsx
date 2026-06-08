'use client';

import Link from 'next/link';
import { Check, X } from 'lucide-react';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import { formatRelativeTimeShort } from '@/lib/format-relative-time';
import type { ReviewQueueItem } from '@/lib/api/verification';

interface ReviewQueueTableProps {
  items: ReviewQueueItem[];
  onApprove: (item: ReviewQueueItem) => void;
  onReject: (item: ReviewQueueItem) => void;
}

const typeBadge: Record<string, BadgeVariant> = {
  resident: 'default',
  owner: 'forest',
};

const methodLabel: Record<string, string> = {
  peer: 'Peer',
  qr_mail: 'QR by mail',
  role_management: 'Staff review',
};

const headerLabelClass = 'font-display text-xs font-medium uppercase tracking-wider text-forest/40';

export default function ReviewQueueTable({ items, onApprove, onReject }: ReviewQueueTableProps) {
  if (items.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="font-display text-lg text-forest/50">Nothing to review</p>
        <p className="mt-1 text-sm text-forest/30">Pending verification requests will appear here</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-sage/20">
            <th className="px-4 py-3 text-left"><span className={headerLabelClass}>Name</span></th>
            <th className="px-4 py-3 text-left"><span className={headerLabelClass}>Email</span></th>
            <th className="px-4 py-3 text-left"><span className={headerLabelClass}>Type</span></th>
            <th className="px-4 py-3 text-left hidden md:table-cell"><span className={headerLabelClass}>Property</span></th>
            <th className="px-4 py-3 text-left hidden lg:table-cell"><span className={headerLabelClass}>Method</span></th>
            <th className="px-4 py-3 text-left hidden lg:table-cell"><span className={headerLabelClass}>Requested</span></th>
            <th className="px-4 py-3 text-right"><span className={headerLabelClass}>Action</span></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.request_id} className="border-b border-sage/10 transition-colors hover:bg-sage-light/30">
              <td className="px-4 py-3">
                <span className="font-body text-sm font-medium text-forest">
                  {item.requester_name || 'Unknown'}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="font-mono text-xs text-forest/60">{item.email || '—'}</span>
              </td>
              <td className="px-4 py-3">
                <Badge variant={typeBadge[item.verification_type] ?? 'default'} size="sm">
                  {item.verification_type}
                </Badge>
              </td>
              <td className="px-4 py-3 hidden md:table-cell">
                <Link
                  href={`/work-management/verifications/property/${item.property_id}`}
                  className="text-sm text-forest underline-offset-2 hover:underline"
                >
                  {item.street_number} {item.street_name}
                </Link>
              </td>
              <td className="px-4 py-3 hidden lg:table-cell">
                <span className="text-sm text-forest/60">{methodLabel[item.method] ?? item.method}</span>
              </td>
              <td className="px-4 py-3 hidden lg:table-cell">
                <span className="text-sm text-forest/50">{formatRelativeTimeShort(item.created_at)}</span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => onApprove(item)}
                    className="inline-flex items-center gap-1 rounded-lg bg-forest px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-forest/90"
                  >
                    <Check className="h-3.5 w-3.5" /> Verify
                  </button>
                  <button
                    type="button"
                    onClick={() => onReject(item)}
                    className="inline-flex items-center gap-1 rounded-lg border border-terracotta/40 px-3 py-1.5 text-xs font-medium text-terracotta transition-colors hover:bg-terracotta/10"
                  >
                    <X className="h-3.5 w-3.5" /> Reject
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
