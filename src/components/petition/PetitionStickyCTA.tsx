'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';

interface PetitionStickyCTAProps {
  isPetitionActive: boolean;
}

export default function PetitionStickyCTA({ isPetitionActive }: PetitionStickyCTAProps) {
  const [pastHero, setPastHero] = useState(false);
  const [formInView, setFormInView] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!isPetitionActive) return;

    const meter = document.getElementById('petition-meter');
    const form = document.getElementById('sign');

    const observers: IntersectionObserver[] = [];

    if (meter) {
      const heroObs = new IntersectionObserver(
        ([entry]) => setPastHero(!entry.isIntersecting),
        { rootMargin: '-80px 0px 0px 0px' }
      );
      heroObs.observe(meter);
      observers.push(heroObs);
    }

    if (form) {
      const formObs = new IntersectionObserver(
        ([entry]) => setFormInView(entry.isIntersecting),
        { rootMargin: '0px 0px -25% 0px' }
      );
      formObs.observe(form);
      observers.push(formObs);
    }

    return () => observers.forEach((o) => o.disconnect());
  }, [isPetitionActive]);

  if (!isPetitionActive || dismissed) return null;

  const visible = pastHero && !formInView;

  return (
    <div
      className={cn(
        'fixed bottom-0 inset-x-0 z-40 md:hidden',
        'transition-transform duration-500 ease-out-custom',
        visible ? 'translate-y-0' : 'translate-y-full pointer-events-none'
      )}
      aria-hidden={!visible}
    >
      <div
        className={cn(
          'mx-3 mb-3 px-4 py-3',
          'bg-forest text-bone rounded-xl shadow-lg',
          'flex items-center gap-3'
        )}
      >
        <a
          href="#sign"
          className={cn(
            'flex-1 inline-flex items-center justify-center gap-2',
            'py-2.5 px-4 rounded-lg',
            'bg-terracotta hover:bg-terracotta-dark',
            'font-body text-sm font-semibold text-bone',
            'transition-colors duration-200'
          )}
          tabIndex={visible ? 0 : -1}
        >
          <Icon icon="lucide:edit-3" width={16} height={16} />
          <span>Sign this petition</span>
        </a>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className={cn(
            'shrink-0 w-9 h-9 rounded-lg',
            'flex items-center justify-center',
            'text-bone/70 hover:text-bone hover:bg-bone/10',
            'transition-colors duration-200',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-bone/40'
          )}
          aria-label="Dismiss sticky sign reminder"
          tabIndex={visible ? 0 : -1}
        >
          <Icon icon="lucide:x" width={18} height={18} />
        </button>
      </div>
    </div>
  );
}
