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
      <div className="calendar-detail-view">
        <div className="calendar-empty-state">
          <Calendar className="calendar-empty-icon" />
          <h3 className="calendar-empty-title">No items this month</h3>
          <p className="calendar-empty-description">
            There are no notices, events, or news scheduled for this month.
            Check back later or browse other months.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="calendar-detail-view">
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
