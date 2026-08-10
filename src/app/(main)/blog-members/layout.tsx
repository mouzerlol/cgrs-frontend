import type { Metadata } from 'next';

/**
 * Same title and description as `/blog`, because this is the same page — the
 * visitor's URL says `/blog` throughout, and only the render is different.
 */
export const metadata: Metadata = {
  title: 'Community Blog | Coronation Gardens',
  description:
    'News, updates, and announcements from the Coronation Gardens committee. Stay informed about your Mangere Bridge community.',
};

export default function MembersBlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
