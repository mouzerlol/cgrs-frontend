import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import EventCard, { PastEventCard } from '@/components/ui/EventCard';
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

const mockPastEvent: Event = {
  id: '2',
  title: 'Past Event',
  date: '2023-01-01',
  time: '10:00 AM',
  location: 'Somewhere',
  description: 'This event has passed',
  rsvp: false,
  featured: false,
};

describe('EventCard', () => {
  it('renders event title', () => {
    render(<EventCard event={mockEvent} />);
    expect(screen.getByText('Community BBQ')).toBeInTheDocument();
  });

  it('renders event details', () => {
    render(<EventCard event={mockEvent} />);
    expect(screen.getByText((content) => content.includes('2:00 PM'))).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('Community Center'))).toBeInTheDocument();
  });

  it('shows RSVP button when rsvp is true', () => {
    render(<EventCard event={mockEvent} />);
    expect(screen.getByText('RSVP Required')).toBeInTheDocument();
  });

  it('shows More Info button when rsvp is false', () => {
    render(<EventCard event={{ ...mockEvent, rsvp: false }} />);
    expect(screen.getByText('More Info')).toBeInTheDocument();
  });

  it('shows featured badge when event is featured', () => {
    render(<EventCard event={mockEvent} variant="featured" />);
    expect(screen.getByText('Featured')).toBeInTheDocument();
  });

  it('renders past event with Past badge', () => {
    render(<PastEventCard event={mockPastEvent} />);
    expect(screen.getByText('Past')).toBeInTheDocument();
  });
});
