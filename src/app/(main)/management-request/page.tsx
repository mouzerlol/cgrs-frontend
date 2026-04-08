'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PageHeader from '@/components/sections/PageHeader';
import { ManagementRequestForm } from '@/components/management-request/ManagementRequestForm';
import { getInitialFormData, getPrefilledFormData, type PrefilledSource } from '@/lib/management-request';
import type { ManagementCategoryId } from '@/types/management-request';

function ManagementRequestPageContent() {
  const searchParams = useSearchParams();

  const category = (searchParams.get('category') ?? 'maintenance') as ManagementCategoryId;
  const prefill = searchParams.get('prefill') as PrefilledSource | null;

  const initialData = {
    ...getInitialFormData(),
    ...getPrefilledFormData(prefill ?? undefined),
    category,
  };

  return (
    <div>
      <PageHeader
        title="Management Request"
        description="Submit a request or report an issue to society management"
        eyebrow="Request Portal"
        variant="compact"
        backgroundImage="/images/mangere-mountain.jpg"
      />
      <section className="bg-bone pt-3 pb-xl md:pt-4 md:pb-2xl">
        <div className="container">
          <ManagementRequestForm initialData={initialData} />
        </div>
      </section>
    </div>
  );
}

/**
 * Management Request Portal page.
 * Allows residents to submit various types of requests to the body corporate committee.
 * Supports URL params: ?category=<id>&prefill=<source>
 */
export default function ManagementRequestPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bone" />}>
      <ManagementRequestPageContent />
    </Suspense>
  );
}