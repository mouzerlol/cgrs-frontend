import type { Metadata } from 'next';
import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from '@tanstack/react-query';
import { auth } from '@clerk/nextjs/server';
import { prefetchDiscussionCore } from '@/lib/discussion-prefetch';

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

  await prefetchDiscussionCore(queryClient, serverGetToken);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
}
