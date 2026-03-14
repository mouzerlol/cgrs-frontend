/**
 * Authenticated API client for backend requests.
 * Attaches Clerk JWT as Bearer token on every request.
 * Throws ApiError on non-2xx; 401/403 are handled centrally via React Query onError.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
export const isLocalApi = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(API_URL);

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
  ) {
    super(`API error ${status}`);
    this.name = 'ApiError';
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }
}

/**
 * Make an authenticated request to the backend API.
 * Must be called from a component/hook that has access to a getToken function.
 * On 401/403, throws ApiError; global Query onError redirects to /login or /no-access.
 */
export async function apiRequest<T>(
  path: string,
  getToken: () => Promise<string | null>,
  options?: RequestInit,
): Promise<T> {
  const token = await getToken();
  const authToken = token ?? (isLocalApi ? 'dev-token' : null);
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(res.status, body);
  }

  return res.json();
}
