'use client';

/**
 * Hook for accessing feature flags in components.
 * Returns a single flag value or the entire flags map.
 */

import { useFeatureFlagContext } from '@/components/providers/FeatureFlagProvider';
import type { FeatureFlagId } from '@/lib/feature-flags';

export { useFeatureFlagContext };

/**
 * Get a single feature flag value.
 * @param flagId - The feature flag ID to check
 * @returns boolean indicating if the flag is enabled (defaults to true if not found)
 */
export function useFeatureFlag(flagId: FeatureFlagId): boolean {
  const { flags } = useFeatureFlagContext();
  return flags[flagId] ?? true;
}

/**
 * Get all feature flags as a map.
 * @returns Record of flag ID to enabled status
 */
export function useAllFeatureFlags(): Record<string, boolean> {
  const { flags } = useFeatureFlagContext();
  return flags;
}

/**
 * Check if feature flags are still loading.
 */
export function useFeatureFlagsLoading(): boolean {
  const { isLoading } = useFeatureFlagContext();
  return isLoading;
}
