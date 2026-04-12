'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatRelativeTimeShort } from '@/lib/format-relative-time';
import { formatRole } from '@/lib/auth';
import Avatar from '@/components/ui/Avatar';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import type { AdminUserResponse, RoleEnum } from '@/types/admin';

type SortField = 'name' | 'role' | 'member_since' | 'last_login' | 'pending_verification_count';
type SortDirection = 'asc' | 'desc';

interface UsersTableProps {
  users: AdminUserResponse[];
}

const roleBadgeVariant: Record<RoleEnum, BadgeVariant> = {
  contact: 'default',
  resident: 'default',
  owner: 'forest',
  society_manager: 'amber',
  committee_member: 'terracotta',
  committee_chairperson: 'terracotta',
};

function formatMemberSince(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMonths = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30));
  const diffYears = Math.floor(diffMonths / 12);

  if (diffMonths < 1) return 'Just joined';
  if (diffMonths < 12) return `${diffMonths}mo`;
  if (diffYears === 1) return '1yr';
  return `${diffYears}yr`;
}

function TruncatedId({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);
  const truncated = id.slice(0, 8);

  const handleCopy = () => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-1.5 group">
      <code className="font-mono text-xs text-forest/50">{truncated}</code>
      <button
        onClick={handleCopy}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-forest/5 rounded"
        title="Copy full ID"
      >
        {copied ? (
          <Check className="w-3 h-3 text-sage" />
        ) : (
          <Copy className="w-3 h-3 text-forest/40" />
        )}
      </button>
    </div>
  );
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

  return (
    <button
      onClick={() => onSort(field)}
      className={cn(
        'flex items-center gap-1 text-left font-display text-xs font-medium uppercase tracking-wider',
        'text-forest/40 hover:text-forest/70 transition-colors',
        isActive && 'text-forest',
      )}
    >
      {label}
      {isActive && (
        <span className="text-[10px]">{direction === 'asc' ? '↑' : '↓'}</span>
      )}
    </button>
  );
}

export default function UsersTable({ users }: UsersTableProps) {
  const [sortField, setSortField] = useState<SortField>('member_since');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'role':
        comparison = a.role.localeCompare(b.role);
        break;
      case 'member_since':
        comparison = new Date(a.member_since).getTime() - new Date(b.member_since).getTime();
        break;
      case 'last_login':
        const aLogin = a.last_login ? new Date(a.last_login).getTime() : 0;
        const bLogin = b.last_login ? new Date(b.last_login).getTime() : 0;
        comparison = aLogin - bLogin;
        break;
      case 'pending_verification_count':
        comparison = a.pending_verification_count - b.pending_verification_count;
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
            <th className="py-3 px-4 text-left hidden md:table-cell">Email</th>
            <th className="py-3 px-4 text-left">
              <SortableHeader
                label="User ID"
                field="name"
                currentSort={sortField}
                direction={sortDirection}
                onSort={handleSort}
              />
            </th>
            <th className="py-3 px-4 text-left">
              <SortableHeader
                label="Role"
                field="role"
                currentSort={sortField}
                direction={sortDirection}
                onSort={handleSort}
              />
            </th>
            <th className="py-3 px-4 text-left hidden lg:table-cell">
              <SortableHeader
                label="Member Since"
                field="member_since"
                currentSort={sortField}
                direction={sortDirection}
                onSort={handleSort}
              />
            </th>
            <th className="py-3 px-4 text-left hidden xl:table-cell">
              <SortableHeader
                label="Last Login"
                field="last_login"
                currentSort={sortField}
                direction={sortDirection}
                onSort={handleSort}
              />
            </th>
            <th className="py-3 px-4 text-left">
              <SortableHeader
                label="Verifications"
                field="pending_verification_count"
                currentSort={sortField}
                direction={sortDirection}
                onSort={handleSort}
              />
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedUsers.map((user, index) => (
            <tr
              key={user.id}
              className={cn(
                'border-b border-sage/10 transition-colors hover:bg-sage-light/30',
                'animate-fade-up',
              )}
              style={{ animationDelay: `${index * 30}ms`, animationFillMode: 'both' }}
            >
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={user.avatar_url}
                    name={user.name}
                    size="md"
                  />
                  <span className="font-body text-sm font-medium text-forest">
                    {user.name}
                  </span>
                </div>
              </td>
              <td className="py-3 px-4 hidden md:table-cell">
                <span className="font-mono text-xs text-forest/60">
                  {user.email}
                </span>
              </td>
              <td className="py-3 px-4">
                <TruncatedId id={user.id} />
              </td>
              <td className="py-3 px-4">
                <Badge variant={roleBadgeVariant[user.role]} size="sm">
                  {formatRole(user.role)}
                </Badge>
              </td>
              <td className="py-3 px-4 hidden lg:table-cell">
                <div className="flex flex-col">
                  <span className="text-xs text-amber font-semibold">
                    {formatMemberSince(user.member_since)}
                  </span>
                  <span className="text-[10px] text-forest/40">
                    {new Date(user.member_since).toLocaleDateString('en-NZ', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </td>
              <td className="py-3 px-4 hidden xl:table-cell">
                <span className={cn(
                  'text-sm',
                  user.last_login ? 'text-amber' : 'text-forest/30'
                )}>
                  {user.last_login ? formatRelativeTimeShort(user.last_login) : 'Never'}
                </span>
              </td>
              <td className="py-3 px-4">
                {user.pending_verification_count > 0 ? (
                  <Badge
                    variant="status-open"
                    size="sm"
                    className="animate-pulse-subtle"
                  >
                    {user.pending_verification_count}
                  </Badge>
                ) : (
                  <span className="text-xs text-forest/30">-</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {sortedUsers.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-forest/50 font-display text-lg">No users found</p>
          <p className="text-forest/30 text-sm mt-1">Users will appear here once they join the community</p>
        </div>
      )}
    </div>
  );
}
