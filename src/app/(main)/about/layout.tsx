import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Coronation Gardens | CGRS',
  description:
    'Learn about the Coronation Gardens Residents Society, our mission to serve the Mangere Bridge community, and meet the dedicated committee members.',
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
