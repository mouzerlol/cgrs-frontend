'use client';

import { useState } from 'react';
import { Tab } from '@headlessui/react';
import Card from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { SiteBreadcrumbs } from '@/components/ui/breadcrumb';
import QuickAccessCard from '@/components/ui/QuickAccessCard';
import NewsCard from '@/components/ui/NewsCard';
import CalendarCard from '@/components/ui/CalendarCard';
import LuxuryRefinedCard from '@/components/ui/experimental-cards/LuxuryRefinedCard';
import EditorialMagazineCard from '@/components/ui/experimental-cards/EditorialMagazineCard';
import OrganicNaturalCard from '@/components/ui/experimental-cards/OrganicNaturalCard';
import IndustrialUtilitarianCard from '@/components/ui/experimental-cards/IndustrialUtilitarianCard';
import RetroFuturisticCard from '@/components/ui/experimental-cards/RetroFuturisticCard';
import PlayfulToyCard from '@/components/ui/experimental-cards/PlayfulToyCard';
import BrutalistRawCard from '@/components/ui/experimental-cards/BrutalistRawCard';
import MaximalistChaosCard from '@/components/ui/experimental-cards/MaximalistChaosCard';
import ArtDecoGeometricCard from '@/components/ui/experimental-cards/ArtDecoGeometricCard';

const EXPERIMENTAL_CARD_PROPS = {
  title: 'Report an Issue',
  description: 'Report maintenance, landscaping, or security issues directly to the management team. Track your requests and stay updated on community improvements.',
  href: '#',
  icon: 'document' as const,
  image: '/images/quick-access/report-issue.png',
};

const CARD_VARIANTS = [
  { id: 'luxury-refined', label: 'Luxury / Refined' },
  { id: 'editorial-magazine', label: 'Editorial / Magazine' },
  { id: 'organic-natural', label: 'Organic / Natural' },
  { id: 'industrial-utilitarian', label: 'Industrial / Utilitarian' },
  { id: 'retro-futuristic', label: 'Retro-futuristic' },
  { id: 'playful-toy', label: 'Playful / Toy-like' },
  { id: 'brutalist-raw', label: 'Brutalist / Raw' },
  { id: 'maximalist-chaos', label: 'Maximalist Chaos' },
  { id: 'art-deco-geometric', label: 'Art Deco / Geometric' },
];

const CARD_COMPONENTS = {
  'luxury-refined': LuxuryRefinedCard,
  'editorial-magazine': EditorialMagazineCard,
  'organic-natural': OrganicNaturalCard,
  'industrial-utilitarian': IndustrialUtilitarianCard,
  'retro-futuristic': RetroFuturisticCard,
  'playful-toy': PlayfulToyCard,
  'brutalist-raw': BrutalistRawCard,
  'maximalist-chaos': MaximalistChaosCard,
  'art-deco-geometric': ArtDecoGeometricCard,
};

function ArchivedBadge() {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-terracotta/20 text-terracotta">
      Archived
    </span>
  );
}

export default function DesignExperimentsPage() {
  const [selectedVariant, setSelectedVariant] = useState('luxury-refined');

  return (
    <div className="min-h-screen bg-bone">
      {/* Header */}
      <header className="bg-forest text-bone py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="font-display text-4xl">Design Experiments</h1>
            <ArchivedBadge />
          </div>
          <p className="opacity-70 max-w-2xl">
            A graveyard for design system experiments, old home page cards, and UI components that were once live on the site.
            These artifacts are preserved here for reference and potential future resurrection.
          </p>
        </div>
      </header>

      <SiteBreadcrumbs variant="belowHero" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Tab.Group>
          <Tab.List className="flex flex-wrap gap-2 border-b border-sage/20 pb-4 mb-8">
            {[
              { id: 'aesthetic-cards', label: 'Aesthetic Card Experiments' },
              { id: 'original-home', label: 'Original Home Cards' },
            ].map((tab) => (
              <Tab
                key={tab.id}
                className={({ selected }: { selected: boolean }) =>
                  cn(
                    'px-4 py-2 text-sm font-medium rounded-lg transition-all',
                    selected
                      ? 'bg-forest text-bone'
                      : 'text-forest/60 hover:text-forest hover:bg-sage-light'
                  )
                }
              >
                {tab.label}
              </Tab>
            ))}
          </Tab.List>

          <Tab.Panels>
            {/* Aesthetic Card Experiments Panel */}
            <Tab.Panel>
              <div className="space-y-8">
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className="font-display text-2xl">Aesthetic Card Experiments</h2>
                    <ArchivedBadge />
                  </div>
                  <p className="text-sm opacity-70">
                    9 distinct experimental card components showcasing different aesthetic styles. These were explored during
                    the design system phase but were not ultimately deployed to production.
                    Note: The &quot;Brutally Minimal&quot; variant is now live on the homepage.
                  </p>
                </Card>

                {/* Variant Selector */}
                <Card className="p-6">
                  <h3 className="text-sm font-medium mb-4 opacity-50 uppercase tracking-wider">Select Variant to Preview</h3>
                  <div className="flex flex-wrap gap-2">
                    {CARD_VARIANTS.map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant.id)}
                        className={cn(
                          'px-3 py-1.5 text-sm rounded transition-all',
                          selectedVariant === variant.id
                            ? 'bg-terracotta text-bone'
                            : 'bg-sage-light text-forest hover:bg-sage/30'
                        )}
                      >
                        {variant.label}
                      </button>
                    ))}
                  </div>
                </Card>

                {/* Card Display */}
                <Card className="p-8">
                  <h3 className="text-sm font-medium mb-4 opacity-50 uppercase tracking-wider">
                    {CARD_VARIANTS.find((v) => v.id === selectedVariant)?.label}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(() => {
                      const Component = CARD_COMPONENTS[selectedVariant as keyof typeof CARD_COMPONENTS];
                      return (
                        <>
                          <Component
                            variant="large"
                            title={EXPERIMENTAL_CARD_PROPS.title}
                            description={EXPERIMENTAL_CARD_PROPS.description}
                            href={EXPERIMENTAL_CARD_PROPS.href}
                            icon={EXPERIMENTAL_CARD_PROPS.icon}
                            image={EXPERIMENTAL_CARD_PROPS.image}
                          />
                          <Component
                            title="Message Board"
                            description="Community notices & announcements."
                            href="#"
                            icon="message"
                            image="/images/quick-access/message-board.png"
                          />
                        </>
                      );
                    })()}
                  </div>
                </Card>
              </div>
            </Tab.Panel>

            {/* Original Home Cards Panel */}
            <Tab.Panel>
              <div className="space-y-8">
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className="font-display text-2xl">Original Home Page Cards</h2>
                    <ArchivedBadge />
                  </div>
                  <p className="text-sm opacity-70">
                    The original card components that appeared on the home page before the Brutally Minimal redesign.
                    These have been replaced with the current brutalist aesthetic cards.
                  </p>
                </Card>

                {/* Quick Access Card */}
                <Card className="p-6">
                  <h3 className="text-sm font-medium mb-4 opacity-50 uppercase tracking-wider">Quick Access Card</h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <QuickAccessCard
                      card={{
                        title: 'Report an Issue',
                        description: 'Report maintenance & community issues',
                        href: '#',
                        type: 'large',
                        backgroundImage: '/images/quick-access/report-issue.png',
                      }}
                    />
                    <QuickAccessCard
                      card={{
                        title: 'Message Board',
                        description: 'Community notices & announcements',
                        href: '#',
                        type: 'simple',
                        icon: 'message',
                        backgroundImage: '/images/quick-access/message-board.png',
                      }}
                    />
                    <QuickAccessCard
                      card={{
                        title: 'Connect',
                        description: 'Join our Facebook & Messenger',
                        href: '#',
                        type: 'accent',
                        icon: 'share',
                      }}
                    />
                  </div>
                </Card>

                {/* Community Events Card */}
                <Card className="p-6">
                  <h3 className="text-sm font-medium mb-4 opacity-50 uppercase tracking-wider">Community Events Card</h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <CalendarCard
                      event={{
                        id: '1',
                        type: 'event',
                        title: 'Summer BBQ',
                        description: 'Join us for a community BBQ to celebrate the summer.',
                        date: '2024-12-15',
                        time: '12:00 PM',
                        image: '/images/events/barbecue.svg',
                        category: 'events',
                        author: {
                          name: 'Committee',
                          avatar: '',
                        },
                      }}
                      day="15"
                      month="DEC"
                    />
                  </div>
                </Card>

                {/* Community News Card */}
                <Card className="p-6">
                  <h3 className="text-sm font-medium mb-4 opacity-50 uppercase tracking-wider">Community News Card</h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <NewsCard
                      article={{
                        id: '1',
                        slug: 'new-community-garden',
                        title: 'New Community Garden',
                        excerpt: 'We are excited to announce the opening of our new community garden. Come and see what we have planted.',
                        content: 'We are excited to announce the opening of our new community garden. Come and see what we have planted.',
                        date: '2024-11-20',
                        image: 'https://placehold.co/800x600/f4a261/white?text=Community+News',
                        category: 'general',
                        featured: false,
                        author: 'Committee',
                      }}
                    />
                  </div>
                </Card>
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </main>

      {/* Footer */}
      <footer className="bg-forest text-bone py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="opacity-60">Design Experiments Archive — Preserved for reference</p>
        </div>
      </footer>
    </div>
  );
}
