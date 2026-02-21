import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register | Coronation Gardens',
  description:
    'Create your Coronation Gardens resident account to access community features, events, and neighbourhood updates.',
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
