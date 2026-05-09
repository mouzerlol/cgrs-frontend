import { apiRequest } from './client';
import type { CurrentUserResponse } from '@/hooks/useCurrentUser';
import type { CommunityResponse } from '@/hooks/useCommunity';
import type { FeatureFlagsResponse } from './feature-flags';
import type { UnreadCountResponse } from './notifications';

export interface BootstrapResponse {
  user: CurrentUserResponse | null;
  community: CommunityResponse | null;
  feature_flags: FeatureFlagsResponse | null;
  unread_count: UnreadCountResponse | null;
}

export function getBootstrap(
  getToken: () => Promise<string | null>,
): Promise<BootstrapResponse> {
  return apiRequest<BootstrapResponse>('/api/v1/bootstrap', getToken);
}
