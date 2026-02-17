'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { addCollection } from '@iconify/react';
import lucideIcons from '@iconify-json/lucide/icons.json';
import mdiIcons from '@iconify-json/mdi/icons.json';

// Register icon sets locally so they render without external API calls
// (CSP blocks connect-src to api.iconify.design)
addCollection(lucideIcons);
addCollection(mdiIcons);

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
