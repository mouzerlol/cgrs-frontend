import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Discussion Thread | Coronation Gardens',
  description:
    'Read and reply to a community discussion thread at Coronation Gardens. Connect with your Mangere Bridge neighbours.',
};

export default function ThreadLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
