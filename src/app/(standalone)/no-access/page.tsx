import type { Metadata } from 'next';
import Link from 'next/link';
import PageHeader from '@/components/sections/PageHeader';
import Button from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Access denied | Coronation Gardens',
  description: 'You do not have access to this resource.',
};

/**
 * Shown when the backend returns 403 (e.g. no organization context or tenant not found).
 * Uses standalone layout to prevent infinite loops from auth error handling.
 */
export default function NoAccessPage() {
  return (
    <div className="min-h-screen">
      <PageHeader
        title="Access denied"
        description="You don't have access to this resource. You may need to sign in or join an organization."
        eyebrow="403"
        variant="compact"
        backgroundImage="/images/mangere-mountain.jpg"
      />
      <section className="section bg-bone">
        <div className="container text-center">
          <p className="text-forest/80 mb-6 max-w-md mx-auto">
            If you believe this is an error, please contact support or try signing in again.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="primary" asChild>
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
