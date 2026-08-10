'use client';

import type { PostSummary } from '@/lib/blog/types';
import Hero from '@/components/sections/Hero';
import UtilityDock from '@/components/sections/UtilityDock';
import About from '@/components/sections/About';
import EventsSection from '@/components/sections/EventsSection';
import BlogGrid from '@/components/sections/BlogGrid';
import QuickAccessGrid from '@/components/sections/QuickAccessGrid';
import { useEasterEggContext } from '@/components/layout/WindyTextContext';
import calendarData from '@/data/calendar-items.json';
import type { CalendarItem } from '@/types';

interface HomePageClientProps {
  aboutDescription: string;
  /**
   * The posts the homepage shows, fetched on the server.
   *
   * This component used to import the whole content file, which meant every
   * homepage visitor downloaded the full prose of every article to render three
   * titles. Metadata and bodies are separate artifacts now, and only the
   * metadata crosses the boundary.
   */
  featuredPosts: PostSummary[];
}

/**
 * Client component that reads wind phase and renders the homepage content.
 */
export default function HomePageClient({
  aboutDescription,
  featuredPosts,
}: HomePageClientProps) {
  const { phase: easterEggPhase } = useEasterEggContext();

  const calendarItems = (calendarData.items as CalendarItem[])
    .filter(item => item.type === 'event')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="min-h-screen">
      <Hero
        title="Living at<br>the Bridge"
        subtitle="Māngere Bridge, Auckland • Est. 2014"
        backgroundImage="/images/mangere-mountain.jpg"
        easterEggPhase={easterEggPhase}
      />
      <About
        title="Welcome to Coronation Gardens Resident Society"
        description={aboutDescription}
      />
      {/* Omitted entirely when nothing is featured, rather than rendered as an
          empty band with a heading over it. */}
      {featuredPosts.length > 0 && <BlogGrid posts={featuredPosts} />}
      <QuickAccessGrid />
      <EventsSection items={calendarItems} />
      <UtilityDock overlapHero={false} />
    </div>
  );
}