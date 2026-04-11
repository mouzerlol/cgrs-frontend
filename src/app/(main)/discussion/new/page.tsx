'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import PageHeader from '@/components/sections/PageHeader';
import { ThreadForm } from '@/components/discussions/ThreadForm';
import type { ThreadFormData } from '@/components/discussions/ThreadForm/types';
import { useCreateThread } from '@/hooks/useDiscussions';

function NewThreadPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const createThreadMutation = useCreateThread();

  const preselectedCategory = searchParams.get('category') ?? undefined;

  const handleSubmit = async (data: ThreadFormData) => {
    const thread = await createThreadMutation.mutateAsync({
      title: data.title,
      body: data.body,
      category: data.category,
      visibility: data.visibility,
      poll: data.poll,
      images: data.images,
    });
    router.push(`/discussion/thread/${thread.id}`);
  };

  return (
    <div className="min-h-screen bg-bone">
      <PageHeader
        title="Start a Discussion"
        description="Share your thoughts, ask a question, or start a conversation."
        eyebrow="New Thread"
        eyebrowIconKey="messageSquarePlus"
        backgroundImage="/images/mangere-mountain.jpg"
        variant="compact"
      />
      <ThreadForm onSubmit={handleSubmit} initialData={preselectedCategory ? { category: preselectedCategory } : undefined} />
    </div>
  );
}

/**
 * New thread creation page.
 * Uses compact PageHeader variant for functional page styling.
 * Supports pre-selecting a category via ?category=<slug> query param.
 */
export default function NewThreadPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bone" />}>
      <NewThreadPageContent />
    </Suspense>
  );
}
