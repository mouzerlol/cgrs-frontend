'use client';

/**
 * Member Directory content component.
 * Fetches and displays community members from the API.
 * Only accessible to users with viewMemberDirectory capability.
 */

import { useMembers, useHasCapability } from '@/hooks/useAuthorization';
import { CAPABILITIES, formatRole as formatRoleLabel } from '@/lib/auth';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

function MemberCard({ member }: { member: import('@/types/authorization').MemberSummaryResponse }) {
  const fullName = [member.user.first_name, member.user.last_name].filter(Boolean).join(' ') || 'Unknown';
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const joinDate = new Date(member.created_at).toLocaleDateString('en-NZ', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Card hover className="p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-sage-light flex items-center justify-center text-sage font-medium shrink-0">
          {member.user.avatar_url ? (
            <img
              src={member.user.avatar_url}
              alt={fullName}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            initials || '?'
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg font-medium truncate">{fullName}</h3>
          <p className="text-terracotta font-medium text-sm mb-1">
            {formatRoleLabel(member.role)}
          </p>
          {member.user.email && (
            <p className="text-sm opacity-60 truncate mb-2">{member.user.email}</p>
          )}
          <p className="text-xs opacity-40">Joined {joinDate}</p>
        </div>
      </div>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="p-6 animate-pulse">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-sage-light" />
            <div className="flex-1">
              <div className="h-5 w-32 bg-sage-light rounded mb-2" />
              <div className="h-4 w-24 bg-sage-light rounded mb-2" />
              <div className="h-3 w-40 bg-sage-light rounded" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function NoAccess() {
  return (
    <Card className="p-8 text-center">
      <div className="w-16 h-16 mx-auto mb-4 bg-sage-light rounded-full flex items-center justify-center">
        <span className="text-2xl">🔒</span>
      </div>
      <h3 className="font-display text-xl font-medium mb-2">Access Restricted</h3>
      <p className="opacity-70">
        You need permission to view the member directory. Contact a committee member for access.
      </p>
    </Card>
  );
}

function EmptyState() {
  return (
    <Card className="p-8 text-center">
      <div className="w-16 h-16 mx-auto mb-4 bg-sage-light rounded-full flex items-center justify-center">
        <span className="text-2xl">👥</span>
      </div>
      <h3 className="font-display text-xl font-medium mb-2">No Members Found</h3>
      <p className="opacity-70">
        There are no members in this community yet.
      </p>
    </Card>
  );
}

function ErrorState({ error }: { error: string }) {
  return (
    <Card className="p-8 text-center border-red-200 bg-red-50">
      <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
        <span className="text-2xl">⚠️</span>
      </div>
      <h3 className="font-display text-xl font-medium mb-2 text-red-800">Error Loading Members</h3>
      <p className="opacity-70 text-red-700 mb-4">{error}</p>
      <Button variant="primary" onClick={() => window.location.reload()}>
        Try Again
      </Button>
    </Card>
  );
}

/**
 * Main DirectoryContent component.
 */
export function DirectoryContent() {
  const hasAccess = useHasCapability(CAPABILITIES.VIEW_MEMBER_DIRECTORY);
  const { data: members, isLoading, error } = useMembers();

  if (!hasAccess) {
    return <NoAccess />;
  }

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorState error={String(error)} />;
  }

  if (!members || members.length === 0) {
    return <EmptyState />;
  }

  return (
    <div>
      <div className="mb-6">
        <p className="text-lg opacity-70">
          Showing {members.length} member{members.length !== 1 ? 's' : ''} in this community
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member) => (
          <MemberCard key={member.id} member={member} />
        ))}
      </div>
    </div>
  );
}
