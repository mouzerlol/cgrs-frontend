'use client';

import { Calendar } from 'lucide-react';
import { DateGroup } from './DateGroup';
import type { DateGrouping } from '@/types';

interface CalendarDetailViewProps {
  groupedItems: DateGrouping[];
  expandedItemId: string | null;
  onItemClick: (itemId: string) => void;
}

export function CalendarDetailView({
  groupedItems,
  expandedItemId,
  onItemClick,
}: CalendarDetailViewProps) {
  if (groupedItems.length === 0) {
    return (
      <div className="flex flex-col gap-lg px-[calc(0.5rem/3)] pb-xl pt-md">
        <div className="flex flex-col items-center justify-center text-center px-md py-xl">
          <Calendar className="w-12 h-12 text-sage mb-md" />
          <h3 className="font-display text-lg font-medium text-forest mb-xs">No items this month</h3>
          <p className="text-sm text-forest opacity-70 max-w-[280px]">
            There are no notices, events, or news scheduled for this month.
            Check back later or browse other months.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-lg px-[calc(0.5rem/3)] pb-xl pt-md">
      {groupedItems.map((group) => (
        <DateGroup
          key={group.date}
          date={group.date}
          items={group.items}
          expandedItemId={expandedItemId}
          onItemClick={onItemClick}
        />
      ))}
    </div>
  );
}

export default CalendarDetailView;
