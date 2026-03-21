'use client';

import { formatDateHeader, isTodayDate } from '@/lib/calendar-utils';
import { CalendarItemCard } from './CalendarItemCard';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import type { CalendarItem } from '@/types';

interface DateGroupProps {
  date: string;
  items: CalendarItem[];
  expandedItemIds: Set<string>;
  onItemClick: (itemId: string) => void;
}

export function DateGroup({
  date,
  items,
  expandedItemIds,
  onItemClick,
}: DateGroupProps) {
  const isToday = isTodayDate(date);

  return (
    <div
      className="scroll-mt-8 [content-visibility:auto] [contain-intrinsic-size:0_200px]"
      data-date={date}
    >
      <h3
        className={cn(
          'font-display text-lg font-medium text-forest mb-sm pb-xs pl-xs border-b border-sage-light flex items-center gap-sm',
          isToday && 'text-terracotta'
        )}
      >
        {formatDateHeader(date)}
        {isToday && (
          <span className="font-body text-xs font-semibold uppercase tracking-[0.1em] bg-terracotta text-bone py-0.5 px-2 rounded">
            Today
          </span>
        )}
      </h3>
      <div className="flex flex-col gap-sm">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <CalendarItemCard
              item={item}
              isExpanded={expandedItemIds.has(item.id)}
              onToggle={() => onItemClick(item.id)}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default DateGroup;
