/**
 * React Query hooks for the notifications domain.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { getNotifications, getUnreadCount, markRead, type NotificationItem } from '@/lib/api/notifications';
import { STALE_TIMES } from '@/lib/cache-config';

export const UNREAD_COUNT_KEY = ['notifications', 'unread-count'] as const;
export const NOTIFICATIONS_KEY = ['notifications', 'list'] as const;

export function useUnreadCount() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  return useQuery({
    queryKey: UNREAD_COUNT_KEY,
    queryFn: () => getUnreadCount(getToken),
    enabled: isLoaded && !!isSignedIn,
    staleTime: STALE_TIMES.CONTENT,
    refetchInterval: 60_000,
  });
}

export function useNotifications(options?: { unread_only?: boolean; limit?: number }) {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  return useQuery({
    queryKey: [...NOTIFICATIONS_KEY, options?.unread_only ?? false, options?.limit ?? 50],
    queryFn: () => getNotifications(getToken, options),
    enabled: isLoaded && !!isSignedIn,
    staleTime: STALE_TIMES.CONTENT,
  });
}

export function useMarkRead() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof markRead>[1]) => markRead(getToken, payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_KEY });
      await queryClient.cancelQueries({ queryKey: UNREAD_COUNT_KEY });

      const previousNotifications = queryClient.getQueriesData({ queryKey: NOTIFICATIONS_KEY });
      const previousUnreadCount = queryClient.getQueriesData({ queryKey: UNREAD_COUNT_KEY });

      const idsToMark = new Set(payload.notification_ids ?? []);
      const sectionsToUpdate = new Set<string>();

      for (const [key, value] of queryClient.getQueriesData({ queryKey: NOTIFICATIONS_KEY })) {
        if (value && typeof value === 'object' && 'items' in value) {
          queryClient.setQueryData(key, (old: { items: NotificationItem[]; total: number }) => {
            if (!old) return old;
            let changed = false;
            const newItems = old.items.map((item) => {
              if (idsToMark.has(item.id) && !item.is_read) {
                changed = true;
                sectionsToUpdate.add(item.nav_section);
                return { ...item, is_read: true };
              }
              return item;
            });
            return changed ? { ...old, items: newItems } : old;
          });
        }
      }

      for (const [key, value] of queryClient.getQueriesData({ queryKey: UNREAD_COUNT_KEY })) {
        if (value && typeof value === 'object' && 'total' in value) {
          queryClient.setQueryData(key, (old: { total: number; by_section: { section: string; count: number }[] }) => {
            if (!old) return old;
            const count = payload.notification_ids?.length ?? 0;
            return {
              total: Math.max(0, old.total - count),
              by_section: old.by_section.map((s) =>
                sectionsToUpdate.has(s.section)
                  ? { ...s, count: Math.max(0, s.count - count) }
                  : s
              ),
            };
          });
        }
      }

      return { previousNotifications, previousUnreadCount };
    },
    onError: (_err, _payload, context) => {
      for (const [key, value] of [...(context?.previousNotifications ?? []), ...(context?.previousUnreadCount ?? [])]) {
        queryClient.setQueryData(key, value);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_KEY });
    },
  });
}

/**
 * Standalone mark-read function for use in useEffect (deep links).
 * Applies optimistic update manually, then invalidates queries after the API call.
 * Unlike useMarkRead, this is NOT a hook — safe to call in useEffect with its own ref
 * to avoid re-triggering when the effect re-runs.
 */
export async function markReadWithoutHook(
  getToken: () => Promise<string | null>,
  queryClient: ReactQueryClient,
  notificationId: string,
) {
  const idsToMark = new Set([notificationId]);
  const sectionsToUpdate = new Set<string>();

  await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_KEY });
  await queryClient.cancelQueries({ queryKey: UNREAD_COUNT_KEY });

  for (const [key, value] of queryClient.getQueriesData({ queryKey: NOTIFICATIONS_KEY })) {
    if (value && typeof value === 'object' && 'items' in value) {
      queryClient.setQueryData(key, (old: { items: NotificationItem[]; total: number }) => {
        if (!old) return old;
        let changed = false;
        const newItems = old.items.map((item) => {
          if (idsToMark.has(item.id) && !item.is_read) {
            changed = true;
            sectionsToUpdate.add(item.nav_section);
            return { ...item, is_read: true };
          }
          return item;
        });
        return changed ? { ...old, items: newItems } : old;
      });
    }
  }

  for (const [key, value] of queryClient.getQueriesData({ queryKey: UNREAD_COUNT_KEY })) {
    if (value && typeof value === 'object' && 'total' in value) {
      queryClient.setQueryData(key, (old: { total: number; by_section: { section: string; count: number }[] }) => {
        if (!old) return old;
        return {
          total: Math.max(0, old.total - 1),
          by_section: old.by_section.map((s) =>
            sectionsToUpdate.has(s.section) ? { ...s, count: Math.max(0, s.count - 1) } : s
          ),
        };
      });
    }
  }

  try {
    await markRead(getToken, { notification_ids: [notificationId] });
  } catch {
    // On error, invalidate to force a refetch rather than trying to restore
    // because the error may indicate auth/permission issues.
  } finally {
    queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_KEY });
  }
}

// Re-export types for consumers
type ReactQueryClient = ReturnType<typeof useQueryClient>;
