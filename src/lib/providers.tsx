'use client';

import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { addCollection } from '@iconify/react';
import type { IconifyJSON } from '@iconify/react';
import iconBundle from '@/lib/icon-bundle.json';
import { ApiError } from '@/lib/api/client';

// Register curated icon subset locally (CSP blocks api.iconify.design).
// Run `node scripts/extract-icons.mjs` after adding new icon references.
for (const collection of iconBundle) {
  addCollection(collection as unknown as IconifyJSON);
}

function handleApiAuthError(error: unknown): void {
  if (typeof window === 'undefined') return;
  if (!(error instanceof ApiError)) return;
  if (error.isUnauthorized) {
    // Redirect to /no-access instead of /login to avoid redirect loop:
    // Clerk SignIn redirects signed-in users from /login back to /, which triggers
    // API calls that 401 again. /no-access has no auth-dependent queries.
    window.location.href = '/no-access?reason=unauthorized';
    return;
  }
  if (error.isForbidden) {
    window.location.href = '/no-access';
  }
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: handleApiAuthError,
        }),
        mutationCache: new MutationCache({
          onError: handleApiAuthError,
        }),
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
              if (error instanceof ApiError && (error.isUnauthorized || error.isForbidden)) return false;
              return failureCount < 1;
            },
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
