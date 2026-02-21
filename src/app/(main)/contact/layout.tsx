import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | Coronation Gardens',
  description:
    'Get in touch with the Coronation Gardens committee. Submit enquiries, report issues, or find emergency contact details.',
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
