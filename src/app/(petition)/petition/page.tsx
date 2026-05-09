import type { Metadata } from 'next';
import { getPetitionCount } from '@/lib/api/petition';
import { getFeatureFlags } from '@/lib/api/feature-flags';
import PetitionHeader from '@/components/petition/PetitionHeader';
import PetitionBody from '@/components/petition/PetitionBody';
import PetitionSignSection from '@/components/petition/PetitionSignSection';
import PetitionClosingNote from '@/components/petition/PetitionClosingNote';
import PetitionCommentSection from '@/components/petition/PetitionCommentSection';
import PetitionFooterImage from '@/components/petition/PetitionFooterImage';
import PetitionStickyCTA from '@/components/petition/PetitionStickyCTA';

export const dynamic = 'force-dynamic';

const PETITION_GOAL = 125;

export const metadata: Metadata = {
  title: 'Replacement of Oaks',
  description:
    'Sign the petition to support the Coronation Gardens Residents Society Committee in replacing Oaks Property as our society manager.',
};

export default async function PetitionPage() {
  const [count, flagsResult] = await Promise.allSettled([
    getPetitionCount(),
    getFeatureFlags(),
  ]);

  const supporterCount = count.status === 'fulfilled' ? count.value : 0;
  const flags = flagsResult.status === 'fulfilled' ? flagsResult.value.flags : {};
  const isPetitionActive = flags['petition.active'] ?? true;

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <PetitionHeader
          supporterCount={supporterCount}
          goal={PETITION_GOAL}
          isPetitionActive={isPetitionActive}
        />
        <PetitionBody />
        <PetitionSignSection
          isPetitionActive={isPetitionActive}
          supporterCount={supporterCount}
          goal={PETITION_GOAL}
        />
        <PetitionClosingNote />
        <PetitionCommentSection />
      </div>
      <PetitionFooterImage />
      <PetitionStickyCTA isPetitionActive={isPetitionActive} />
    </>
  );
}
