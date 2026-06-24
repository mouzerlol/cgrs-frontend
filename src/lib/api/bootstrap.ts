import { apiRequest } from './client';
import type { CurrentUserResponse } from '@/hooks/useCurrentUser';
import type { CommunityResponse } from '@/hooks/useCommunity';
import type { FeatureFlagsResponse } from './feature-flags';

export interface BootstrapResponse {
  user: CurrentUserResponse | null;
  community: CommunityResponse | null;
  feature_flags: FeatureFlagsResponse | null;
}

export function getBootstrap(
  getToken: () => Promise<string | null>,
): Promise<BootstrapResponse> {
  return apiRequest<BootstrapResponse>('/api/v1/bootstrap', getToken);
}
