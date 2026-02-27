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
    <section className="relative h-dvh min-h-[600px] flex items-center justify-center overflow-hidden bg-bone" ref={heroRef}>
      <div
        ref={bgRef}
        className="absolute -top-[20%] left-0 w-full h-[140%] bg-cover bg-center will-change-transform"
        style={{ backgroundImage: `url('${backgroundImage}')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-forest/40 to-forest/60" />
      <div className="relative z-10 text-center text-bone p-md">
        <h1 className="font-display text-display tracking-tight leading-none mb-md opacity-0 animate-fade-up text-bone" dangerouslySetInnerHTML={{ __html: title }} />
        {subtitle && <p className="text-base tracking-wide font-normal opacity-0 animate-fade-up [animation-delay:200ms]">{subtitle}</p>}
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
