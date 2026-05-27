'use client';

import { Icon } from '@iconify/react';
import PetitionSignForm from './PetitionSignForm';

interface PetitionSignSectionProps {
  isPetitionActive: boolean;
  supporterCount: number;
  goal: number;
}

export default function PetitionSignSection({
  isPetitionActive,
  supporterCount,
  goal,
}: PetitionSignSectionProps) {
  if (!isPetitionActive) {
    return (
      <section
        id="sign"
        className="mb-10 bg-sage-light rounded-xl border border-sage/30 p-6 md:p-8 text-center scroll-mt-24"
      >
        <Icon
          icon="lucide:check-circle"
          className="w-10 h-10 text-terracotta mx-auto mb-3"
        />
        <p className="font-display text-xl font-semibold text-forest mb-2">
          This petition is now closed
        </p>
        <p className="font-body text-forest/70">
          We collected{' '}
          <span className="font-semibold text-terracotta">
            {supporterCount.toLocaleString()}
          </span>{' '}
          signatures. Thank you to everyone who signed.
        </p>
      </section>
    );
  }

  return (
    <section
      id="sign"
      className="mb-10 bg-white rounded-xl border border-sage/30 p-6 md:p-8 shadow-sm scroll-mt-24"
    >
      <h3 className="font-semibold text-forest mb-4">Sign this petition</h3>
      <PetitionSignForm goal={goal} />
    </section>
  );
}
