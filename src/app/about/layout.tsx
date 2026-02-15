import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | Coronation Gardens',
  description:
    'Learn about the Coronation Gardens Residents Society, our mission, and the committee serving our Mangere Bridge community.',
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
