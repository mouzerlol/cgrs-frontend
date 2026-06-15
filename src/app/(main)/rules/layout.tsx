import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Community Rules | CGRS',
  description:
    "The rules that keep Coronation Gardens safe and happy for every resident, owner, and neighbour. Part of the Coronation Gardens Residents' Society.",
};

export default function RulesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
