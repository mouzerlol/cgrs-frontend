import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CalendarCard, { formatCalendarDate } from '@/components/ui/CalendarCard';
import { Event } from '@/types';

const mockEvent: Event = {
  id: '1',
  title: 'Community BBQ',
  date: '2024-03-15',
  time: '2:00 PM',
  location: 'Community Center',
  description: 'Join us for our annual community BBQ',
  rsvp: true,
  featured: true,
};

describe('CalendarCard', () => {
  it('renders event title', () => {
    render(<CalendarCard event={mockEvent} day="15" month="Mar" />);
    expect(screen.getByText('Community BBQ')).toBeInTheDocument();
  });

  it('renders event description', () => {
    render(<CalendarCard event={mockEvent} day="15" month="Mar" />);
    expect(screen.getByText('Join us for our annual community BBQ')).toBeInTheDocument();
  });

  it('renders event time', () => {
    render(<CalendarCard event={mockEvent} day="15" month="Mar" />);
    expect(screen.getByText('2:00 PM')).toBeInTheDocument();
  });

  it('renders location when showLocation is true', () => {
    render(<CalendarCard event={mockEvent} day="15" month="Mar" showLocation />);
    expect(screen.getByText('Community Center')).toBeInTheDocument();
  });

  it('hides location when showLocation is false', () => {
    render(<CalendarCard event={mockEvent} day="15" month="Mar" showLocation={false} />);
    expect(screen.queryByText('Community Center')).not.toBeInTheDocument();
  });
});

describe('formatCalendarDate', () => {
  it('formats date correctly', () => {
    const result = formatCalendarDate('2024-03-15');
    expect(result.day).toBe('15');
    expect(result.month).toBe('Mar');
  });

  it('pads single digit days', () => {
    const result = formatCalendarDate('2024-03-05');
    expect(result.day).toBe('05');
  });
});
