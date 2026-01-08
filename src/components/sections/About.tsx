'use client';

import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface AboutProps {
  eyebrow?: string;
  title: string;
  description: string;
}

/**
 * About section with sage-light background.
 * Centered content with fade-up animation.
 */
export default function About({ eyebrow, title, description }: AboutProps) {
  const [ref, isVisible] = useIntersectionObserver<HTMLDivElement>({ threshold: 0.2 });

  return (
    <section className="section bg-sage-light" id="about">
      <div className="container">
        <div
          ref={ref}
          className={`max-w-[700px] mx-auto text-center fade-up ${isVisible ? 'visible' : ''}`}
        >
          {eyebrow && <span className="text-eyebrow block mb-4">{eyebrow}</span>}
          <h2 className="mb-6">{title}</h2>
          <p className="text-lg leading-relaxed opacity-80">{description}</p>
        </div>
      </div>
    </section>
  );
}
