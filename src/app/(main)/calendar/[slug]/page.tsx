import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Event } from '@/types';
import EventContent from '@/components/event/EventContent';
import eventsData from '@/data/events.json';
import { getBreadcrumbsJsonLd } from '@/lib/breadcrumbs';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const events = eventsData.events as Event[];
  const event = events.find((e) => e.slug === slug);

  if (!event) {
    return { title: 'Event Not Found | Coronation Gardens' };
  }

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Calendar', href: '/calendar' },
    { label: event.title },
  ];

  const description =
    event.description.length > 160 ? event.description.slice(0, 157) + '...' : event.description;
  const ogImage = {
    url: `/api/og/event?slug=${event.slug}`,
    width: 1200,
    height: 630,
    alt: `${event.title}, a Coronation Gardens community event.`,
  };

  return {
    title: `${event.title} | Coronation Gardens`,
    description,
    openGraph: {
      title: event.title,
      description,
      type: 'article',
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: event.title,
      description,
      images: [ogImage.url],
    },
    other: {
      'script[type="application/ld+json"]': JSON.stringify(getBreadcrumbsJsonLd(breadcrumbs)),
    },
  };
}

export async function generateStaticParams() {
  const events = eventsData.events as Event[];
  return events.map((event) => ({
    slug: event.slug,
  }));
}

export default async function EventPage({ params }: PageProps) {
  const { slug } = await params;
  const events = eventsData.events as Event[];
  const event = events.find((e) => e.slug === slug);

  if (!event) {
    notFound();
  }

  return <EventContent event={event} allEvents={events} />;
}
