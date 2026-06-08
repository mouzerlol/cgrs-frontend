'use client';

import { Ban } from 'lucide-react';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import type { PropertyMemberItem } from '@/lib/api/verification';

interface PropertyMembersTableProps {
  members: PropertyMemberItem[];
  onRevoke: (member: PropertyMemberItem) => void;
}

const typeBadge: Record<string, BadgeVariant> = {
  resident: 'default',
  owner: 'forest',
};

const headerLabelClass = 'font-display text-xs font-medium uppercase tracking-wider text-forest/40';

function fullName(m: PropertyMemberItem): string {
  return `${m.first_name || ''} ${m.last_name || ''}`.trim() || 'Unknown';
}

export default function PropertyMembersTable({ members, onRevoke }: PropertyMembersTableProps) {
  if (members.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="font-display text-lg text-forest/50">No active members</p>
        <p className="mt-1 text-sm text-forest/30">
          No verified residents or owners are currently linked to this property
        </p>
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
            <th className="px-4 py-3 text-left"><span className={headerLabelClass}>Relationship</span></th>
            <th className="px-4 py-3 text-left hidden md:table-cell"><span className={headerLabelClass}>Since</span></th>
            <th className="px-4 py-3 text-right"><span className={headerLabelClass}>Action</span></th>
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <tr key={m.relationship_id} className="border-b border-sage/10 transition-colors hover:bg-sage-light/30">
              <td className="px-4 py-3">
                <span className="font-body text-sm font-medium text-forest">{fullName(m)}</span>
              </td>
              <td className="px-4 py-3">
                <span className="font-mono text-xs text-forest/60">{m.email || '—'}</span>
              </td>
              <td className="px-4 py-3">
                <Badge variant={typeBadge[m.relationship_type] ?? 'default'} size="sm">
                  {m.relationship_type}
                </Badge>
              </td>
              <td className="px-4 py-3 hidden md:table-cell">
                <span className="text-sm text-forest/50">
                  {new Date(m.established_at).toLocaleDateString('en-NZ', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => onRevoke(m)}
                    className="inline-flex items-center gap-1 rounded-lg border border-terracotta/40 px-3 py-1.5 text-xs font-medium text-terracotta transition-colors hover:bg-terracotta/10"
                  >
                    <Ban className="h-3.5 w-3.5" /> Revoke
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
