import type { Metadata } from 'next';
import { NewsArticle } from '@/types';
import { getLatestArticles } from '@/lib/utils';
import Hero from '@/components/sections/Hero';
import UtilityDock from '@/components/sections/UtilityDock';
import About from '@/components/sections/About';
import EventsSection from '@/components/sections/EventsSection';
import NewsGrid from '@/components/sections/NewsGrid';
import QuickAccessGrid from '@/components/sections/QuickAccessGrid';
import HomePageClient from './HomePageClient';

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

export default function HomePage() {
  return <HomePageClient aboutDescription={ABOUT_DESCRIPTION} />;
}
