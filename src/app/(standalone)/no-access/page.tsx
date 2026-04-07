import type { Metadata } from 'next';
import Link from 'next/link';
import PageHeader from '@/components/sections/PageHeader';
import Button from '@/components/ui/Button';
import NoAccessSignOutButton from '@/components/auth/NoAccessSignOutButton';

export const metadata: Metadata = {
  title: 'Access denied | Coronation Gardens',
  description: 'You do not have access to this resource.',
};

/**
 * Shown when the backend returns 401 or 403.
 * Uses standalone layout to prevent infinite loops from auth error handling.
 * - 401 (reason=unauthorized): Session/token invalid; sign out and sign in again.
 * - 403: Tenant could not be resolved (e.g. site domain not linked in API) or membership denied.
 */
export default async function NoAccessPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;
  const isUnauthorized = reason === 'unauthorized';
  // Always show sign out for easier debugging and user recovery
  const showSignOut = true;

  return (
    <div className="min-h-screen">
      <PageHeader
        title={isUnauthorized ? 'Session could not be verified' : 'Access denied'}
        description={
          isUnauthorized
            ? 'The API could not verify your session. Try signing out and signing in again, or contact support if this persists.'
            : "You don't have access to this resource. You may need to sign in, or the site may not be configured for your account yet."
        }
        eyebrow={isUnauthorized ? '401' : '403'}
        variant="compact"
        backgroundImage="/images/mangere-mountain.jpg"
      />
      <section className="section bg-bone">
        <div className="container text-center">
          <p className="text-forest/80 mb-6 max-w-md mx-auto">
            {isUnauthorized
              ? 'Please sign out and sign in again. If the problem continues, contact support so we can check your account and site configuration.'
              : 'If you believe this is an error, please contact support or try signing in again.'}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {showSignOut && <NoAccessSignOutButton />}
            <Button variant={isUnauthorized ? 'outline' : 'primary'} asChild>
              <Link href="/">Go to home</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/contact">Contact support</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
