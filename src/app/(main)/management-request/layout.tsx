import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Management Request | Coronation Gardens',
  description:
    'Submit maintenance requests, report issues, or contact the Coronation Gardens committee for assistance with your resident concerns in Mangere Bridge.',
};

/** Server layout so client `page.tsx` can omit `metadata` export. */
export default function ManagementRequestLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
