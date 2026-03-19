'use client';

import { useCurrentUser, CurrentUserResponse } from '@/hooks/useCurrentUser';
import { useAuth, useUser } from '@clerk/nextjs';
import PageHeader from '@/components/sections/PageHeader';
import { SignInButton } from '@clerk/nextjs';

function formatRole(role: string): string {
  return role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(isoString: string | null | undefined): string {
  if (!isoString) return '—';
  const d = new Date(isoString);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
}

function UserProfileCard({
  user,
  clerkFallback,
}: {
  user: CurrentUserResponse['user'];
  clerkFallback?: { firstName?: string; lastName?: string; imageUrl?: string };
}) {
  const firstName = user.first_name || clerkFallback?.firstName || '';
  const lastName = user.last_name || clerkFallback?.lastName || '';
  const avatarUrl = user.avatar_url || clerkFallback?.imageUrl || '';

  const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'No name set';
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="rounded-card bg-white p-6 shadow-[0_8px_32px_rgba(26,34,24,0.08)]">
      <div className="flex items-center gap-6">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={fullName}
            className="h-20 w-20 rounded-full object-cover ring-4 ring-bone/50"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-forest text-2xl font-bold text-bone ring-4 ring-bone/50">
            {initials}
          </div>
        )}
        <div>
          <h2 className="font-display text-2xl text-forest">{fullName}</h2>
          <p className="text-sm text-forest/70">{user.email}</p>
          <p className="mt-1 text-xs text-forest/50">Member since {formatDate(user.created_at)}</p>
        </div>
      </div>
    </div>
  );
}

function MembershipCard({ membership }: { membership: NonNullable<CurrentUserResponse['membership']> }) {
  return (
    <div className="rounded-card bg-white p-6 shadow-[0_8px_32px_rgba(26,34,24,0.08)]">
      <h3 className="mb-4 font-display text-lg text-forest">Community Membership</h3>
      <div className="space-y-3">
        <div className="flex justify-between border-b border-bone pb-2">
          <span className="text-sm font-medium text-forest/70">Role</span>
          <span className="text-sm font-semibold text-terracotta">{formatRole(membership.role)}</span>
        </div>
        <div className="flex justify-between border-b border-bone pb-2">
          <span className="text-sm font-medium text-forest/70">Member since</span>
          <span className="text-sm text-forest">{formatDate(membership.created_at)}</span>
        </div>
      </div>
    </div>
  );
}

function CapabilitiesCard({ capabilities }: { capabilities: string[] }) {
  if (!capabilities.length) {
    return null;
  }

  return (
    <div className="rounded-card bg-white p-6 shadow-[0_8px_32px_rgba(26,34,24,0.08)]">
      <h3 className="mb-4 font-display text-lg text-forest">Your Capabilities</h3>
      <div className="flex flex-wrap gap-2">
        {capabilities.map((cap) => (
          <span
            key={cap}
            className="rounded-full bg-bone px-3 py-1 text-xs font-medium text-forest"
          >
            {cap.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()).trim()}
          </span>
        ))}
      </div>
    </div>
  );
}

function SignedOutCard() {
  return (
    <div className="rounded-card bg-white p-8 text-center shadow-[0_8px_32px_rgba(26,34,24,0.08)]">
      <h2 className="mb-4 font-display text-2xl text-forest">Sign in to view your profile</h2>
      <p className="mb-6 text-forest/70">Access your community membership and manage your account.</p>
      <SignInButton mode="redirect">
        <button className="rounded bg-terracotta px-6 py-3 font-medium text-bone transition-colors hover:bg-terracotta/90">
          Sign In
        </button>
      </SignInButton>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="rounded-card bg-white p-8 text-center shadow-[0_8px_32px_rgba(26,34,24,0.08)]">
      <p className="text-forest/70">Loading your profile...</p>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="rounded-card bg-terracotta/10 p-8 text-center shadow-[0_8px_32px_rgba(26,34,24,0.08)]">
      <p className="text-terracotta">We couldn&apos;t load your profile. Please try again.</p>
    </div>
  );
}

export default function ProfilePage() {
  const { isSignedIn: isClerkSignedIn, isLoaded: isClerkLoaded } = useAuth();
  const { user: clerkUser } = useUser();
  const { data, isLoading, error } = useCurrentUser();

  const isSignedIn = isClerkSignedIn && isClerkLoaded;

  const clerkFallback =
    clerkUser && (clerkUser.firstName || clerkUser.lastName || clerkUser.imageUrl)
      ? {
          firstName: clerkUser.firstName ?? undefined,
          lastName: clerkUser.lastName ?? undefined,
          imageUrl: clerkUser.imageUrl ?? undefined,
        }
      : undefined;

  return (
    <div>
      <PageHeader
        title="My Profile"
        description="View your account details and community membership information."
        eyebrow="Resident Portal"
        variant="compact"
        backgroundImage="/images/mangere-mountain.jpg"
      />

      <section className="section bg-bone">
        <div className="container max-w-3xl">
          {!isSignedIn ? (
            <SignedOutCard />
          ) : isLoading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState />
          ) : data ? (
            <div className="space-y-6">
              <UserProfileCard user={data.user} clerkFallback={clerkFallback} />
              {data.membership && <MembershipCard membership={data.membership} />}
              {data.capabilities.length > 0 && <CapabilitiesCard capabilities={data.capabilities} />}
              {data.is_superadmin && (
                <div className="rounded-card bg-forest p-4 text-bone">
                  <p className="text-sm font-medium">Super Administrator</p>
                  <p className="text-xs text-bone/70">You have full system access</p>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
