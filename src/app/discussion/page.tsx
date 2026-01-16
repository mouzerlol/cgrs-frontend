'use client';

import PageHeader from '@/components/sections/PageHeader';
import { DiscussionsLanding } from '@/components/discussions';

/**
 * Community Discussion landing page.
 * Displays compact category accordion and recent threads.
 * Uses compact PageHeader variant for functional page styling.
 */
export default function DiscussionPage() {
  return (
    <div className="min-h-screen bg-bone">
      <PageHeader
        title="Community Discussion"
        description="Connect with your neighbors, share ideas, and stay informed."
        eyebrow="Forum"
        backgroundImage="/images/mangere-mountain.jpg"
        variant="compact"
      />

      <DiscussionsLanding />
    </div>
  );
}
