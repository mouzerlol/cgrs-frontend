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

// Make page dynamic to ensure events are filtered at request time
export const dynamic = 'force-dynamic';

const ABOUT_DESCRIPTION = `Coronation Gardens is a resident community in the heart of Māngere Bridge, Auckland. We believe that where you live shapes how you live—which is why we've created spaces designed for connection, wellness, and everyday elegance. From our rooftop sanctuary to our shared work spaces, every corner of our community has been thoughtfully crafted with you in mind.`;

/**
 * Homepage with new design system.
 * Sections: Hero, UtilityDock, About, Events, News, QuickAccess.
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

      {/* Essential Services - Quick Access Grid */}
      <QuickAccessGrid />

      {/* Events Section (Dark) - now using calendar items */}
      <EventsSection items={calendarItems} />

      {/* News Grid Section */}
      <NewsGrid articles={latestNews} />
    </div>
  );
}
