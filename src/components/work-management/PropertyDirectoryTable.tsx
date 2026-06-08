'use client';

import { useState } from 'react';
import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import PropertyMembersTable from '@/components/work-management/PropertyMembersTable';
import ConfirmActionModal from '@/components/work-management/ConfirmActionModal';
import {
  usePropertyMembersQuery,
  useRevokeRelationshipMutation,
} from '@/hooks/useVerificationReview';
import type {
  PropertyDirectoryItem,
  PropertyDirectorySort,
  PropertyDirectoryOrder,
} from '@/lib/api/verification';
import type { PropertyMemberItem } from '@/lib/api/verification';

interface PropertyDirectoryTableProps {
  properties: PropertyDirectoryItem[];
  reviewer: boolean;
  sort: PropertyDirectorySort;
  order: PropertyDirectoryOrder;
  onSort: (field: PropertyDirectorySort) => void;
  onRevoke: (member: PropertyMemberItem, address: string) => void;
}

const headerLabelClass =
  'font-display text-xs font-medium uppercase tracking-wider text-forest/40';

function SortableHeader({
  label,
  field,
  sort,
  order,
  onSort,
  className,
}: {
  label: string;
  field: PropertyDirectorySort;
  sort: PropertyDirectorySort;
  order: PropertyDirectoryOrder;
  onSort: (field: PropertyDirectorySort) => void;
  className?: string;
}) {
  const isActive = sort === field;
  const SortIcon = order === 'asc' ? ArrowUp : ArrowDown;
  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className={cn(
        'inline-flex items-center gap-1.5 text-left transition-colors',
        headerLabelClass,
        'hover:text-forest/65',
        isActive && 'text-forest',
        className,
      )}
    >
      <span>{label}</span>
      {isActive && <SortIcon className="h-3.5 w-3.5 shrink-0 text-forest" aria-hidden />}
    </button>
  );
}

function formatAddress(p: PropertyDirectoryItem): string {
  const unit = p.unit_number ? `${p.unit_number}/` : '';
  return `${unit}${p.street_number} ${p.street_name}`.trim();
}

function DirectoryRow({
  property,
  reviewer,
  onRevoke,
}: {
  property: PropertyDirectoryItem;
  reviewer: boolean;
  onRevoke: (member: PropertyMemberItem, address: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const address = formatAddress(property);

  // Lazy: members are only fetched once the row is expanded.
  const { data, isLoading } = usePropertyMembersQuery(
    property.property_id,
    expanded && reviewer,
  );
  const members = data?.members ?? [];

  const Chevron = expanded ? ChevronDown : ChevronRight;

  return (
    <>
      <tr
        className={cn(
          'cursor-pointer border-b border-sage/10 transition-colors hover:bg-sage-light/30',
          expanded && 'bg-sage-light/20',
        )}
        onClick={() => setExpanded((e) => !e)}
      >
        <td className="py-3 px-4">
          <div className="flex items-center gap-3">
            <Chevron className="h-4 w-4 shrink-0 text-forest/40" aria-hidden />
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-forest/10">
              <Home className="h-4 w-4 text-forest" />
            </div>
            <span className="font-body text-sm font-medium text-forest">{address}</span>
          </div>
        </td>
        <td className="py-3 px-4">
          {property.resident_count > 0 ? (
            <Badge variant="default" size="sm">
              {property.resident_count} {property.resident_count === 1 ? 'resident' : 'residents'}
            </Badge>
          ) : (
            <span className="text-xs text-forest/30">—</span>
          )}
        </td>
        <td className="py-3 px-4">
          {property.owner_count > 0 ? (
            <Badge variant="forest" size="sm">
              {property.owner_count} {property.owner_count === 1 ? 'owner' : 'owners'}
            </Badge>
          ) : (
            <span className="text-xs text-forest/30">—</span>
          )}
        </td>
      </tr>
      {expanded && (
        <tr className="border-b border-sage/10 bg-bone/40">
          <td colSpan={3} className="px-4 py-2">
            <div className="rounded-lg border border-sage/15 bg-white">
              {isLoading ? (
                <div className="space-y-3 p-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-12 animate-pulse rounded-lg bg-sage/10" />
                  ))}
                </div>
              ) : (
                <PropertyMembersTable
                  members={members}
                  onRevoke={(m) => onRevoke(m, address)}
                />
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function PropertyDirectoryTable({
  properties,
  reviewer,
  sort,
  order,
  onSort,
  onRevoke,
}: PropertyDirectoryTableProps) {
  if (properties.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="font-display text-lg text-forest/50">No properties with members</p>
        <p className="mt-1 text-sm text-forest/30">
          Properties appear here once they have a verified resident or owner
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-sage/20">
            <th className="px-4 py-3 text-left">
              <SortableHeader label="Property" field="address" sort={sort} order={order} onSort={onSort} />
            </th>
            <th className="px-4 py-3 text-left">
              <SortableHeader label="Residents" field="residents" sort={sort} order={order} onSort={onSort} />
            </th>
            <th className="px-4 py-3 text-left">
              <SortableHeader label="Owners" field="owners" sort={sort} order={order} onSort={onSort} />
            </th>
          </tr>
        </thead>
        <tbody>
          {properties.map((property) => (
            <DirectoryRow
              key={property.property_id}
              property={property}
              reviewer={reviewer}
              onRevoke={onRevoke}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
