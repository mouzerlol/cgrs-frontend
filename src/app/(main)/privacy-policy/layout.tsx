import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Coronation Gardens',
  description:
    'How the Coronation Gardens Residents Society collects, uses, and protects your personal information in accordance with the New Zealand Privacy Act 2020.',
};

export default function PrivacyPolicyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
