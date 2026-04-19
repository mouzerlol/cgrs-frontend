'use client';

import { NewsArticle } from '@/types';
import { getLatestArticles } from '@/lib/utils';
import Hero from '@/components/sections/Hero';
import UtilityDock from '@/components/sections/UtilityDock';
import About from '@/components/sections/About';
import EventsSection from '@/components/sections/EventsSection';
import NewsGrid from '@/components/sections/NewsGrid';
import QuickAccessGrid from '@/components/sections/QuickAccessGrid';
import { useEasterEggContext } from '@/components/layout/WindyTextContext';
import newsData from '@/data/news.json';
import calendarData from '@/data/calendar-items.json';
import type { CalendarItem } from '@/types';

interface HomePageClientProps {
  aboutDescription: string;
}

/**
 * Client component that reads wind phase and renders the homepage content.
 */
export default function HomePageClient({ aboutDescription }: HomePageClientProps) {
  const { phase: easterEggPhase } = useEasterEggContext();
  const latestNews = getLatestArticles(newsData.articles as NewsArticle[], 3);

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
      <QuickAccessGrid />
      <EventsSection items={calendarItems} />
      <NewsGrid articles={latestNews} />
      <UtilityDock overlapHero={false} />
    </div>
  );
}