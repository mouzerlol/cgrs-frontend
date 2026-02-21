import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Community Blog | Coronation Gardens',
  description:
    'News, updates, and announcements from the Coronation Gardens committee. Stay informed about your Mangere Bridge community.',
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
