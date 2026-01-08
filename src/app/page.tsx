import { NewsArticle, Event } from '@/types';
import { getLatestArticles, getUpcomingEvents } from '@/lib/utils';
import Hero from '@/components/sections/Hero';
import UtilityDock from '@/components/sections/UtilityDock';
import About from '@/components/sections/About';
import EventsSection from '@/components/sections/EventsSection';
import NewsGrid from '@/components/sections/NewsGrid';
import QuickAccessGrid from '@/components/sections/QuickAccessGrid';

// Import data
import newsData from '@/data/news.json';
import eventsData from '@/data/events.json';

// Make page dynamic to ensure events are filtered at request time
export const dynamic = 'force-dynamic';

const ABOUT_DESCRIPTION = `Coronation Gardens is a resident community in the heart of Māngere Bridge, Auckland. We believe that where you live shapes how you live—which is why we've created spaces designed for connection, wellness, and everyday elegance. From our rooftop sanctuary to our shared work spaces, every corner of our community has been thoughtfully crafted with you in mind.`;

/**
 * Homepage with new design system.
 * Sections: Hero, UtilityDock, About, Events, News, QuickAccess.
 */
export default function HomePage() {
  const latestNews = getLatestArticles(newsData.articles as NewsArticle[], 3);
  const upcomingEvents = getUpcomingEvents(eventsData.events as Event[], 3);

  return (
    <div className="min-h-screen">
      {/* Hero Section with Parallax */}
      <Hero
        title="Living at<br>the Bridge"
        subtitle="Māngere Bridge, Auckland • Est. 2024"
        backgroundImage="https://www.cgrs.co.nz/images/mangere-mountain.jpg"
      />

      {/* Floating Utility Dock */}
      <UtilityDock />

      {/* About Section */}
      <About
        title="Welcome to Coronation Gardens Resident Society"
        description={ABOUT_DESCRIPTION}
      />

      {/* Events Section (Dark) */}
      <EventsSection events={upcomingEvents} />

      {/* News Grid Section */}
      <NewsGrid articles={latestNews} />

      {/* Quick Access Grid */}
      <QuickAccessGrid />
    </div>
  );
}
