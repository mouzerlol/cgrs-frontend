'use client';

import PageHeader from '@/components/sections/PageHeader';
import { ThreadForm } from '@/components/discussions';

/**
 * New thread creation page.
 * Uses compact PageHeader variant for functional page styling.
 */
export default function NewThreadPage() {
  return (
    <div className="min-h-screen bg-bone">
      <PageHeader
        title="Start a Discussion"
        description="Share your thoughts, ask a question, or start a conversation."
        eyebrow="New Thread"
        backgroundImage="/images/mangere-mountain.jpg"
        variant="compact"
      />
      <ThreadForm />
    </div>
  );
}
