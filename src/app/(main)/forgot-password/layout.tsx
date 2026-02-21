import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reset Password | Coronation Gardens',
  description:
    'Reset your Coronation Gardens resident account password. Enter your email to receive secure password recovery instructions.',
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
