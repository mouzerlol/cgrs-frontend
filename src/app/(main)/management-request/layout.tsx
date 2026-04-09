import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Management Request | Coronation Gardens',
  description:
    'Submit a request or report an issue to society management for Coronation Gardens residents.',
};

/** Server layout so client `page.tsx` can omit `metadata` export. */
export default function ManagementRequestLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
