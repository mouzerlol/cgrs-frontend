'use client';

/**
 * When the signed-in Clerk user record changes (e.g. name, avatar, or primary email
 * after the UserProfile modal), refetch /users/me so React Query stays aligned with
 * the backend, which re-syncs profile fields from Clerk on each request.
 */

import { useAuth, useClerk } from '@clerk/nextjs';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

function clerkUserProfileKey(
  user: { id: string; firstName: string | null; lastName: string | null; imageUrl: string; primaryEmailAddress?: { emailAddress: string } | null } | null | undefined
): string {
  if (!user) return '';
  const email = user.primaryEmailAddress?.emailAddress ?? '';
  return [user.id, user.firstName ?? '', user.lastName ?? '', user.imageUrl ?? '', email].join('\0');
}

export function useInvalidateCurrentUserOnClerkChange(): void {
  const { isLoaded } = useAuth();
  const clerk = useClerk();
  const queryClient = useQueryClient();
  const previousKey = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return undefined;

    const unsubscribe = clerk.addListener(({ user }) => {
      const key = clerkUserProfileKey(user);
      if (previousKey.current !== null && key !== previousKey.current) {
        void queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      }
      previousKey.current = key;
    });

    return unsubscribe;
  }, [clerk, isLoaded, queryClient]);
}
