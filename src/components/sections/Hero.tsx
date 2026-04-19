'use client';

import { useHeroParallax } from '@/hooks/useParallax';
import Icon from '@/components/ui/Icon';

interface HeroProps {
  title: string;
  subtitle?: string;
  backgroundImage: string;
  easterEggPhase?: 'idle' | 'active';
}

/**
 * Hero section with parallax background and fade-up animations.
 * Full viewport height with gradient overlay.
 * Includes a beautiful aurora text color transition when easterEggPhase is active.
 */
export default function Hero({ title, subtitle, backgroundImage, easterEggPhase = 'idle' }: HeroProps) {
  const { bgRef, heroRef } = useHeroParallax(0.35);

  const isEasterEggActive = easterEggPhase === 'active';

  return (
    <section className="relative h-dvh min-h-[600px] flex items-center justify-center overflow-hidden bg-bone" ref={heroRef}>
      <div
        ref={bgRef}
        className="absolute -top-[20%] left-0 w-full h-[140%] bg-cover bg-center will-change-transform"
        style={{ backgroundImage: `url('${backgroundImage}')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-forest/40 to-forest/60" />
      <div className="relative z-10 text-center text-bone p-md">
        <div className="opacity-0 animate-fade-up mb-md">
          <h1
            className={`font-display text-display tracking-tight leading-none text-bone transition-colors duration-1000 ${
              isEasterEggActive ? 'animate-aurora-text' : ''
            }`}
            dangerouslySetInnerHTML={{ __html: title }}
          />
        </div>
        {subtitle && (
          <p className="text-lg md:text-xl tracking-wide font-normal opacity-0 animate-fade-up [animation-delay:200ms]">{subtitle}</p>
        )}
        <div
          className="absolute bottom-[-60px] left-1/2 -translate-x-1/2 w-8 h-14 border-[3px] border-bone rounded-2xl opacity-60"
          aria-hidden="true"
        >
          <Icon name="arrow-down" size="md" className="absolute bottom-2 left-1/2 -translate-x-1/2 animate-scroll-bounce" />
        </div>
      </div>
    </section>
  );
}
