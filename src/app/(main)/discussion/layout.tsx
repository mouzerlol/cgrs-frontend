import type { Metadata } from 'next';
import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from '@tanstack/react-query';
import { auth } from '@clerk/nextjs/server';
import {
  getCategories,
  getCategoryStatsAggregated,
  getThreads,
} from '@/lib/api/discussions';
import {
  discussionKeys,
  PAGE_SIZE,
  normalizeThreadOptions,
} from '@/lib/discussion-keys';

export const metadata: Metadata = {
  title: 'Community Discussion | Coronation Gardens',
  description:
    'Join conversations with your Coronation Gardens neighbours. Share ideas, ask questions, and stay informed about community topics.',
};

export default async function DiscussionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { getToken } = await auth();

  // Only prefetch when there is an authenticated session.
  // The backend requires a valid JWT for all discussion endpoints.
  const token = await getToken().catch(() => null);

  if (!token) {
    // Unauthenticated visitors — skip prefetch, let the client fetch after sign-in
    return <>{children}</>;
  }

  const queryClient = new QueryClient();
  const serverGetToken = async () => token;
  const defaultOpts = normalizeThreadOptions({ sort: 'newest' });

  // Use allSettled so a single failing prefetch doesn't crash the layout
  await Promise.allSettled([
    queryClient.prefetchQuery({
      queryKey: discussionKeys.categoryList(false),
      queryFn: () => getCategories(serverGetToken),
    }),
    queryClient.prefetchQuery({
      queryKey: discussionKeys.categoryStats(),
      queryFn: () => getCategoryStatsAggregated(serverGetToken),
    }),
    queryClient.prefetchInfiniteQuery({
      queryKey: discussionKeys.threadList({
        ...defaultOpts,
        limit: PAGE_SIZE,
      }),
      queryFn: () =>
        getThreads(
          { ...defaultOpts, limit: PAGE_SIZE, offset: 0 },
          serverGetToken,
        ),
      initialPageParam: 0,
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
}
