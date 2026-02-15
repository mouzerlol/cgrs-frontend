import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Start a Discussion | Coronation Gardens',
  description:
    'Create a new discussion thread in the Coronation Gardens community forum. Share ideas or ask questions with your neighbours.',
};

export default function NewDiscussionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
