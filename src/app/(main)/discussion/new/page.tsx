'use client';

import { useRouter } from 'next/navigation';
import PageHeader from '@/components/sections/PageHeader';
import { ThreadForm } from '@/components/discussions/ThreadForm';
import type { ThreadFormData } from '@/components/discussions/ThreadForm/types';
import { useCreateThread } from '@/hooks/useDiscussions';

/**
 * New thread creation page.
 * Uses compact PageHeader variant for functional page styling.
 */
export default function NewThreadPage() {
  const router = useRouter();
  const createThreadMutation = useCreateThread();

  const handleSubmit = async (data: ThreadFormData) => {
    const thread = await createThreadMutation.mutateAsync({
      title: data.title,
      body: data.body,
      category: data.category,
      poll: data.poll,
    });
    router.push(`/discussion/thread/${thread.id}`);
  };

  return (
    <div className="min-h-screen bg-bone">
      <PageHeader
        title="Start a Discussion"
        description="Share your thoughts, ask a question, or start a conversation."
        eyebrow="New Thread"
        backgroundImage="/images/mangere-mountain.jpg"
        variant="compact"
      />
      <ThreadForm onSubmit={handleSubmit} />
    </div>
  );
}
