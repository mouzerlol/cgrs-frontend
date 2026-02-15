import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Design System | Coronation Gardens',
  description:
    'Internal design system reference for the Coronation Gardens website. Colours, typography, components, and patterns.',
};

export default function DesignSystemLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
