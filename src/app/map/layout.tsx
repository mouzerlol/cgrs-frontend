import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Community Map | Coronation Gardens',
  description:
    'Explore Coronation Gardens with our interactive map. Find community boundaries, amenities, and points of interest in Mangere Bridge.',
};

export default function MapLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
