/**
 * Authenticated API client for backend requests.
 * Attaches Clerk JWT as Bearer token on every request.
 * Throws ApiError on non-2xx; 401/403 are handled centrally via React Query onError.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
export const isLocalApi = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(API_URL);

/** Extract FastAPI/Starlette `detail` from JSON error body for readable messages. */
export function formatApiErrorDetail(body: unknown): string {
  if (!body || typeof body !== 'object') {
    return '';
  }
  const d = (body as { detail?: unknown }).detail;
  if (typeof d === 'string') {
    return d;
  }
  if (Array.isArray(d)) {
    return d
      .map((item) =>
        typeof item === 'object' && item !== null && 'msg' in item
          ? String((item as { msg: unknown }).msg)
          : JSON.stringify(item),
      )
      .join('; ');
  }
  return '';
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
  ) {
    const detail = formatApiErrorDetail(body);
    super(detail ? `API error ${status}: ${detail}` : `API error ${status}`);
    this.name = 'ApiError';
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }
}

const THREAD_SUBMISSION_FALLBACK = 'Failed to create thread. Please try again.';

/**
 * Maps mutation errors to a user-visible string. Plain Errors (e.g. R2 direct-upload
 * failures, CORS) must surface {@link Error.message}; only API HTTP errors use {@link ApiError}.
 */
export function threadSubmissionErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return THREAD_SUBMISSION_FALLBACK;
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

  if (res.status === 204 || res.status === 205) {
    return undefined as T;
  }

  const text = await res.text();
  if (!text.trim()) {
    return undefined as T;
  }
  return JSON.parse(text) as T;
}
