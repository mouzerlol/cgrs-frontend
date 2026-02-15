import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Community Calendar | Coronation Gardens',
  description:
    'Browse upcoming events, meetings, and activities at Coronation Gardens. Stay connected with your Mangere Bridge neighbours.',
};

export default function CalendarLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
