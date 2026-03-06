'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { addCollection } from '@iconify/react';
import type { IconifyJSON } from '@iconify/react';
import iconBundle from '@/lib/icon-bundle.json';

// Register curated icon subset locally (CSP blocks api.iconify.design).
// Run `node scripts/extract-icons.mjs` after adding new icon references.
for (const collection of iconBundle) {
  addCollection(collection as unknown as IconifyJSON);
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
