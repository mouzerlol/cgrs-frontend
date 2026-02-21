'use client';

import { Suspense, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import PageHeader from '@/components/sections/PageHeader';
import { CalendarSkeleton } from '@/components/calendar/CalendarContent';
import { useImmersiveScroll } from '@/hooks/useImmersiveScroll';

const CalendarContent = dynamic(
  () => import('@/components/calendar/CalendarContent').then(m => m.CalendarContent),
  { loading: () => <CalendarSkeleton /> }
);

export default function CalendarPage() {
  const sectionRef = useRef<HTMLElement>(null);

  const { enterImmersive } = useImmersiveScroll(sectionRef, {
    scrollOnMount: true,
  });

  // Direct scroll on mount - ensures the calendar section is visible below the fixed header
  // This is a fallback/backup to useImmersiveScroll for more reliable behavior
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const scrollToSection = () => {
      const element = sectionRef.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const navHeight = 64;
      const targetY = rect.top + (window.scrollY || document.documentElement.scrollTop) - navHeight;

      window.scrollTo({
        top: Math.max(0, targetY),
        behavior: 'instant',
      });
    };

    scrollToSection();
    const frameId = requestAnimationFrame(scrollToSection);
    const timeoutId = setTimeout(scrollToSection, 100);
    const timeoutId2 = setTimeout(scrollToSection, 300);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(timeoutId);
      clearTimeout(timeoutId2);
    };
  }, []);

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
        <Suspense fallback={<CalendarSkeleton />}>
          <CalendarContent />
        </Suspense>
      </section>
    </div>
  );
}
