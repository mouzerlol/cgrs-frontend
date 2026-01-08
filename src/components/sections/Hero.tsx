'use client';

import { useHeroParallax } from '@/hooks/useParallax';
import Icon from '@/components/ui/Icon';

interface HeroProps {
  title: string;
  subtitle?: string;
  backgroundImage: string;
}

/**
 * Hero section with parallax background and fade-up animations.
 * Full viewport height with gradient overlay.
 */
export default function Hero({ title, subtitle, backgroundImage }: HeroProps) {
  const { bgRef, heroRef } = useHeroParallax(0.35);

  return (
    <section className="hero" ref={heroRef}>
      <div
        ref={bgRef}
        className="hero-bg"
        style={{ backgroundImage: `url('${backgroundImage}')` }}
      />
      <div className="hero-overlay" />
      <div className="hero-content">
        <h1 className="hero-title" dangerouslySetInnerHTML={{ __html: title }} />
        {subtitle && <p className="hero-subtitle">{subtitle}</p>}
        <div
          className="absolute bottom-[-60px] left-1/2 -translate-x-1/2 w-6 h-10 border-2 border-bone rounded-xl opacity-60"
          aria-hidden="true"
        >
          <Icon name="arrow-down" size="sm" className="absolute bottom-1.5 left-1/2 -translate-x-1/2 animate-scroll-bounce" />
        </div>
      </div>
    </section>
  );
}
