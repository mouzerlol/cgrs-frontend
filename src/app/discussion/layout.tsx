import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Community Discussion | Coronation Gardens',
  description:
    'Join conversations with your Coronation Gardens neighbours. Share ideas, ask questions, and stay informed about community topics.',
};

export default function DiscussionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
