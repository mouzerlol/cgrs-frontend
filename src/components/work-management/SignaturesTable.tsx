'use client';

import { useState } from 'react';
import { ArrowDown, ArrowUp, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatRelativeTimeShort } from '@/lib/format-relative-time';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import type { AdminSignatureResponse, ResidentTypeEnum } from '@/types/admin';

type SortField = 'name' | 'email' | 'resident_type' | 'signed_at';
type SortDirection = 'asc' | 'desc';

interface SignaturesTableProps {
  signatures: AdminSignatureResponse[];
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
  field: SortField;
  currentSort: SortField;
  direction: SortDirection;
  onSort: (field: SortField) => void;
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

function MaskedIp({
  ip,
  isRevealed,
  onToggle,
}: {
  ip: string | null;
  isRevealed: boolean;
  onToggle: () => void;
}) {
  if (ip === null) {
    return <span className="text-forest/30">—</span>;
  }

  return (
    <div className="inline-flex items-center gap-2">
      <code className="font-mono text-xs text-forest/60">
        {isRevealed ? ip : '•••.•••.•••.•••'}
      </code>
      <button
        type="button"
        onClick={onToggle}
        className="p-0.5 rounded hover:bg-forest/5 transition-colors"
        aria-label={isRevealed ? 'Hide IP address' : 'Reveal IP address'}
      >
        {isRevealed ? (
          <EyeOff className="w-3.5 h-3.5 text-forest/40" />
        ) : (
          <Eye className="w-3.5 h-3.5 text-forest/40" />
        )}
      </button>
    </div>
  );
}

function formatResidentType(type: ResidentTypeEnum): string {
  return type === 'owner' ? 'Owner' : 'Tenant';
}

export default function SignaturesTable({ signatures }: SignaturesTableProps) {
  const [sortField, setSortField] = useState<SortField>('signed_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [revealedIps, setRevealedIps] = useState<Set<string>>(new Set());

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const toggleIp = (id: string) => {
    setRevealedIps((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const sortedSignatures = [...signatures].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case 'name':
        comparison = `${a.first_name} ${a.last_name}`.localeCompare(
          `${b.first_name} ${b.last_name}`,
        );
        break;
      case 'email':
        comparison = a.email.localeCompare(b.email);
        break;
      case 'resident_type':
        comparison = a.resident_type.localeCompare(b.resident_type);
        break;
      case 'signed_at':
        comparison = new Date(a.signed_at).getTime() - new Date(b.signed_at).getTime();
        break;
    }
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-sage/20">
            <th className="py-3 px-4 text-left">
              <SortableHeader
                label="Name"
                field="name"
                currentSort={sortField}
                direction={sortDirection}
                onSort={handleSort}
              />
            </th>
            <th className="py-3 px-4 text-left hidden md:table-cell">
              <SortableHeader
                label="Email"
                field="email"
                currentSort={sortField}
                direction={sortDirection}
                onSort={handleSort}
              />
            </th>
            <th className="py-3 px-4 text-left">
              <SortableHeader
                label="Resident Type"
                field="resident_type"
                currentSort={sortField}
                direction={sortDirection}
                onSort={handleSort}
              />
            </th>
            <th className="py-3 px-4 text-left hidden lg:table-cell">
              <PlainHeaderLabel label="Address" />
            </th>
            <th className="py-3 px-4 text-left hidden xl:table-cell">
              <PlainHeaderLabel label="IP Address" />
            </th>
            <th className="py-3 px-4 text-left">
              <SortableHeader
                label="Signed At"
                field="signed_at"
                currentSort={sortField}
                direction={sortDirection}
                onSort={handleSort}
              />
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedSignatures.map((sig, index) => (
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
                <span className="font-mono text-xs text-forest/60">{sig.email}</span>
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
                <MaskedIp
                  ip={sig.ip_address}
                  isRevealed={revealedIps.has(sig.id)}
                  onToggle={() => toggleIp(sig.id)}
                />
              </td>
              <td className="py-3 px-4">
                <span className="text-sm text-forest/70">
                  {formatRelativeTimeShort(sig.signed_at)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {sortedSignatures.length === 0 && (
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
