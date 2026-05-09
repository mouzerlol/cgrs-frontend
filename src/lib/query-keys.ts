/**
 * Centralized React Query key factory.
 *
 * Using factory functions (not inline arrays) ensures key strings are defined in one
 * place, making refactoring and cache invalidation calls unambiguous and type-safe.
 */
export const queryKeys = {
  featureFlags: ['featureFlags'] as const,
  navItems: (userId: string | null | undefined) => ['navItems', userId ?? 'anonymous'] as const,
  petitionCount: ['petition', 'count'] as const,
  petitionThread: ['petition', 'thread'] as const,
  petitionReplies: ['petition', 'replies'] as const,
};
