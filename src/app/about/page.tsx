'use client';

import { CommitteeMember } from '@/types';
import PageHeader from '@/components/sections/PageHeader';
import AboutContent from '@/components/about/AboutContent';

// Import data
import committeeData from '@/data/committee.json';
import siteConfig from '@/data/site-config.json';

interface CommitteeData {
  chairperson: CommitteeMember;
  members: CommitteeMember[];
}

/**
 * About page with React Query and Suspense loading states.
 */
export default function AboutPage() {
  const committee = committeeData as CommitteeData;

  return (
    <div className="min-h-screen">
      <PageHeader
        title="About Coronation Gardens"
        description="Our community, mission, and the committee that serves our residents."
        eyebrow="About Us"
        backgroundImage="/images/mangere-mountain.jpg"
      />

      <AboutContent committee={committee} mission={siteConfig.mission} />
    </div>
  );
}
