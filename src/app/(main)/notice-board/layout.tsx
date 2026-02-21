import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Notice Board | Coronation Gardens',
  description:
    'View community notices, maintenance schedules, and committee announcements for Coronation Gardens residents.',
};

export default function NoticeBoardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
