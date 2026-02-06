'use client';

import Link from 'next/link';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import Icon from '@/components/ui/Icon';

const CARDS = [
  {
    title: 'Report an Issue',
    description: 'Report maintenance & community issues',
    href: '/management-request',
    type: 'large' as const,
    backgroundImage: 'https://placehold.co/800x800/2d6a4f/white?text=Report+Issue',
  },
  {
    title: 'Message Board',
    description: 'Community notices & announcements',
    href: '/notice-board',
    type: 'simple' as const,
    icon: 'message'
  },
  {
    title: 'Committee Blog',
    description: 'Updates from your committee',
    href: '/blog',
    type: 'simple' as const,
    icon: 'edit'
  },
  {
    title: 'CGRS Calendar',
    description: 'Community events & activities',
    href: '/calendar',
    type: 'simple' as const,
    icon: 'calendar'
  },
  {
    title: 'Coronation Gardens Map',
    description: 'Explore our community boundaries',
    href: '/map',
    type: 'simple' as const,
    icon: 'map'
  },
  {
    title: 'Community Guidelines',
    description: 'Rules, forms & policies',
    href: '/guidelines',
    type: 'simple' as const,
    icon: 'document'
  },
  {
    title: 'Community Projects',
    description: 'Contribute ideas & initiatives',
    href: '/projects',
    type: 'simple' as const,
    icon: 'lightbulb'
  },
  {
    title: 'Connect',
    description: 'Join our Facebook & Messenger',
    href: '/contact?subject=connect',
    type: 'accent' as const,
    icon: 'share'
  },
];

/**
 * Quick Access grid with mixed card layouts.
 * Features large card with background image and smaller utility cards.
 */
export default function QuickAccessGrid() {
  const [headerRef, headerVisible] = useIntersectionObserver<HTMLDivElement>({ threshold: 0.2 });

  return (
    <section
      className="section relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, var(--bone) 0%, #FAF8F3 100%)' }}
      id="quick-access"
    >
      {/* Divider line at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-sage/40" />

      {/* Subtle gradient overlay */}
      <div
        className="absolute top-px left-0 right-0 h-0.5 opacity-60"
        style={{ background: 'linear-gradient(90deg, transparent, var(--sage) 30%, transparent)' }}
      />

      <div className="container">
        <div
          ref={headerRef}
          className={`text-center max-w-[700px] mx-auto mb-10 md:mb-16 fade-up ${headerVisible ? 'visible' : ''}`}
        >
          <span className="text-eyebrow block mb-4">Essential Services</span>
          <h2>Everything You Need,<br />One Click Away</h2>
          <p className="mt-4 opacity-70">Access all resident services and community features instantly</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-10">
          {CARDS.map((card, index) => (
            <QuickAccessCard key={card.title} card={card} index={index} />
          ))}
        </div>

      </div>
    </section>
  );
}

interface CardType {
  title: string;
  description: string;
  href: string;
  type: 'large' | 'simple' | 'accent';
  icon?: string;
  backgroundImage?: string;
}

function QuickAccessCard({ card, index }: { card: CardType; index: number }) {
  const [ref, isVisible] = useIntersectionObserver<HTMLAnchorElement>({ threshold: 0.1 });

  const isLarge = card.type === 'large';
  const isAccent = card.type === 'accent';

  return (
    <Link
      ref={ref}
      href={card.href}
      className={`
        quick-access-card
        ${isLarge ? 'col-span-1 md:col-span-2 md:row-span-2 min-h-[280px] md:min-h-[400px]' : 'min-h-[160px] md:min-h-[180px]'}
        ${isAccent ? 'quick-access-card-accent' : ''}
        fade-up ${isVisible ? 'visible' : ''}
      `}
      style={{ transitionDelay: `${index * 0.08}s` }}
    >
      {isLarge && card.backgroundImage && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 hover:scale-105"
            style={{ backgroundImage: `url('${card.backgroundImage}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-forest/85 to-forest/65" />
        </>
      )}

      <div className={`relative z-10 h-full flex flex-col ${isLarge ? 'justify-end text-bone' : ''}`}>
        {!isLarge && (
          <div className={`quick-access-card-icon ${isAccent ? '!bg-white/20' : ''}`}>
            <Icon name={card.icon as import('@/components/ui/Icon').IconName} size="md" className={isAccent ? 'stroke-bone' : 'stroke-forest'} />
          </div>
        )}
        {isLarge && (
          <div className="w-14 h-14 flex items-center justify-center bg-terracotta rounded-2xl mb-4 transition-all duration-400 hover:scale-110 hover:rotate-[5deg]">
            <Icon name="amenities" size="lg" className="stroke-bone" />
          </div>
        )}
        <h3 className={`font-display font-medium ${isLarge ? 'text-2xl md:text-4xl mb-2' : 'text-xl mb-1'}`}>
          {card.title}
        </h3>
        <p className={`${isLarge ? 'text-base opacity-90' : 'text-sm opacity-70'}`}>
          {card.description}
        </p>
      </div>
    </Link>
  );
}

