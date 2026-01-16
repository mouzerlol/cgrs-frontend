'use client';

import { Suspense, useRef } from 'react';
import PageHeader from '@/components/sections/PageHeader';
import { CalendarContent, CalendarSkeleton } from '@/components/calendar';

/**
 * Hook for managing immersive scroll behavior.
 */
function useImmersiveScroll(
  sectionRef: React.RefObject<HTMLElement | null>,
  options: {
    scrollOnMount?: boolean;
  } = {}
) {
  const { scrollOnMount = false } = options;
  const hasScrolledRef = useRef(false);

  const scrollToSection = useRef<(() => void) | null>(null);

  const enterImmersive = useRef(() => {
    if (hasScrolledRef.current || !sectionRef.current) return;
    hasScrolledRef.current = true;

    const rect = sectionRef.current.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const navHeight = 64;
    const targetY = rect.top + scrollTop - navHeight;

    window.scrollTo({
      top: Math.max(0, targetY),
      behavior: 'smooth',
    });
  });

  if (scrollOnMount && !scrollToSection.current) {
    scrollToSection.current = () => {
      setTimeout(() => {
        enterImmersive.current();
      }, 100);
    };
  }

  return {
    enterImmersive: enterImmersive.current,
  };
}

export default function CalendarPage() {
  const sectionRef = useRef<HTMLElement>(null);

  const { enterImmersive } = useImmersiveScroll(sectionRef, {
    scrollOnMount: false,
  });

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Community Calendar"
        description="Notices, events, and news from our community."
        eyebrow="Calendar"
        backgroundImage="/images/mangere-mountain.jpg"
      />

      <section
        className="py-3 md:py-4 bg-bone"
        ref={sectionRef}
        onClick={enterImmersive}
      >
        <div className="container">
          <Suspense fallback={<CalendarSkeleton />}>
            <CalendarContent />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
