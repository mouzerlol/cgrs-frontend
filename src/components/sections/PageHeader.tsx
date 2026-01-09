'use client';

import Image from 'next/image';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface PageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  dark?: boolean;
  backgroundImage?: string;
}

/**
 * Page header with floating glassmorphism card over full-bleed image.
 */
export default function PageHeader({ title, description, eyebrow, dark = true, backgroundImage }: PageHeaderProps) {
  const [ref, isVisible] = useIntersectionObserver<HTMLDivElement>({ threshold: 0.2 });

  return (
    <section className="pt-16 pb-10 md:pt-20 md:pb-12 relative overflow-hidden">
      {/* Full-bleed Background Image */}
      {backgroundImage && (
        <div className="absolute inset-0 z-0">
          <Image
            src={backgroundImage}
            alt=""
            fill
            className="object-cover"
            priority
          />
          {/* Light overlay for text readability */}
          <div className="absolute inset-0 bg-forest/25" />
        </div>
      )}

          {/* Floating Glassmorphism Card */}
      <div className="container relative z-10 flex items-center min-h-[35vh]">
        <div
          ref={ref}
          className={`fade-up ${isVisible ? 'visible' : ''}`}
        >
          <div className="max-w-xl">
            {/* Card header - glassmorphism */}
            <div className="bg-bone/50 backdrop-blur-md rounded-t-2xl p-6 md:p-8">
              {eyebrow && (
                <span className="text-eyebrow inline-block px-3 py-1 mb-3 bg-terracotta text-bone rounded-md">
                  {eyebrow}
                </span>
              )}
              <h1 className="font-semibold text-forest leading-tight" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)' }}>
                {title}
              </h1>
            </div>
            {/* Card body - solid sage-light */}
            {description && (
              <div className="bg-sage-light rounded-b-2xl p-6 md:p-8 -mt-2">
                <p className="text-base leading-relaxed opacity-80 text-forest/90">
                  {description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
