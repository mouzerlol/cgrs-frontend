import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Resident Login | Coronation Gardens',
  description:
    'Sign in to your Coronation Gardens resident account to access community resources, manage your profile, and stay connected.',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
