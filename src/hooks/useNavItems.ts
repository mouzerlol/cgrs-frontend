'use client';

/**
 * Hook for accessing server-filtered navigation items.
 * Navigation items are filtered on the server based on user role and feature flags.
 * This eliminates client-side flash when items should be hidden.
 */

import { useAuth } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import { getNavItems, type NavItemsResponse } from '@/lib/api/nav-items';
import { STALE_TIMES } from '@/lib/cache-config';
import { queryKeys } from '@/lib/query-keys';

export function useNavItems() {
  const { getToken, isLoaded, userId } = useAuth();

  return useQuery<NavItemsResponse, Error>({
    /** Separate cache per signed-in user so nav refetches on login/logout. */
    queryKey: queryKeys.navItems(userId),
    queryFn: () => getNavItems(getToken),
    enabled: isLoaded,
    staleTime: STALE_TIMES.CONTENT,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

/**
 * Get only the visible navigation items.
 * Convenience hook that returns just the items array.
 */
export function useVisibleNavItems() {
  const { data, ...rest } = useNavItems();
  return {
    items: data?.items ?? [],
    ...rest,
  };
}

/**
 * Get feature flags for the navigation context.
 * These flags can be used by other components that need
 * to conditionally render based on feature flags.
 */
export function useNavFeatureFlags() {
  const { data, ...rest } = useNavItems();
  return {
    flags: data?.flags ?? {},
    ...rest,
  };
}