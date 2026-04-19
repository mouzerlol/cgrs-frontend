import type { Metadata } from 'next';
import { NewsArticle } from '@/types';
import { getLatestArticles } from '@/lib/utils';
import Hero from '@/components/sections/Hero';
import UtilityDock from '@/components/sections/UtilityDock';
import About from '@/components/sections/About';
import EventsSection from '@/components/sections/EventsSection';
import NewsGrid from '@/components/sections/NewsGrid';
import QuickAccessGrid from '@/components/sections/QuickAccessGrid';

// Import data
import newsData from '@/data/news.json';
import calendarData from '@/data/calendar-items.json';
import type { CalendarItem } from '@/types';

export const metadata: Metadata = {
  title: 'Coronation Gardens Residents Society | Mangere Bridge',
  description:
    'Official community hub for Coronation Gardens residents in Mangere Bridge, Auckland. Find news, events, and neighbourhood resources.',
};

// Make page dynamic to ensure events are filtered at request time
export const dynamic = 'force-dynamic';

const ABOUT_DESCRIPTION = `From a handful of homes in 2014 to over 240 households, Coronation Gardens has grown into the largest residential community in all of South-Central Auckland. Nestled between the volcanic slopes of Māngere Mountain and the shimmering shores of Manukau Harbour, we're proud to have the best of both worlds: coastal serenity meets city convenience. With State Highway 20 connecting Coronation Gardens to Manukau City, Onehunga and Auckland Airport in minutes as well as being a major vein into the CBD, everything you need is always within reach.`;

/**
 * Homepage with new design system.
 * Sections: Hero, About, QuickAccess, Events, News, UtilityDock.
 */
export default function HomePage() {
  const latestNews = getLatestArticles(newsData.articles as NewsArticle[], 3);
  
  // Filter calendar items to only show events, sorted by date
  const calendarItems = (calendarData.items as CalendarItem[])
    .filter(item => item.type === 'event')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="min-h-screen">
      {/* Hero Section with Parallax */}
      <Hero
        title="Living at<br>the Bridge"
        subtitle="Māngere Bridge, Auckland • Est. 2014"
        backgroundImage="/images/mangere-mountain.jpg"
      />

      {/* About Section */}
      <About
        title="Welcome to Coronation Gardens Resident Society"
        description={ABOUT_DESCRIPTION}
      />

      {/* Essential Services - Quick Access Grid */}
      <QuickAccessGrid />

      {/* Events Section (Dark) - now using calendar items */}
      <EventsSection items={calendarItems} />

      {/* News Grid Section */}
      <NewsGrid articles={latestNews} />

      {/* Utility dock below community news */}
      <UtilityDock overlapHero={false} />
    </div>
  );
}
