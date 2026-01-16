'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { CalendarItem } from '@/types';
import Icon from '@/components/ui/Icon';
import CalendarCard, { formatCalendarDate } from '@/components/ui/CalendarCard';

interface EventsSectionProps {
  items?: CalendarItem[];
  title?: string;
  eyebrow?: string;
  showViewAll?: boolean;
  maxItems?: number;
}

/**
 * Events section with dark forest-light background.
 * Features enhanced calendar cards with date badges in terracotta.
 */
export default function EventsSection({
  items,
  title = 'Community<br>Events',
  eyebrow = "What's On",
  showViewAll = true,
  maxItems = 3,
}: EventsSectionProps) {
  const router = useRouter();
  const [headerRef, headerVisible] = useIntersectionObserver<HTMLDivElement>({ threshold: 0.2 });

  const handleItemClick = (item: CalendarItem) => {
    const params = new URLSearchParams();
    params.set('item', item.id);
    params.set('month', item.date.substring(0, 7)); // YYYY-MM
    router.push(`/calendar?${params.toString()}`);
  };

  const displayItems = items?.slice(0, maxItems) || [];

  return (
    <section className="section bg-forest-light texture-signal" id="events">
      <div className="container">
        <div
          ref={headerRef}
          className={`max-w-[600px] mb-10 md:mb-12 fade-up ${headerVisible ? 'visible' : ''}`}
        >
          <span className="text-eyebrow block mb-4">{eyebrow}</span>
          <h2 className="text-bone" dangerouslySetInnerHTML={{ __html: title }} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {displayItems.map((item) => {
            const { day, month } = formatCalendarDate(item.date);
            return (
              <div key={item.id} onClick={() => handleItemClick(item)}>
                <CalendarCard event={item} day={day} month={month} />
              </div>
            );
          })}
        </div>

        {showViewAll && (
          <div className="text-center mt-10">
            <Link
              href="/calendar"
              className="inline-flex items-center gap-2 text-sm font-medium text-bone uppercase tracking-wider hover:text-terracotta transition-colors"
            >
              View All Events
              <Icon name="arrow-right" size="sm" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
