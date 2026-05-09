/**
 * Resolve the base API URL.
 *
 * Inside a Docker frontend container, `localhost` is the container's own
 * loopback and never reaches the API container. Server-side fetches need a
 * different host (e.g. the docker-compose service name `api:8000`).
 * `INTERNAL_API_URL` lets the runtime override the URL on the server only.
 */
export function getApiUrl(): string {
  if (typeof window === 'undefined' && process.env.INTERNAL_API_URL) {
    return process.env.INTERNAL_API_URL;
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
}

/**
 * Headers required for server-side fetches.
 *
 * The API resolves the tenant (community) from the `Origin` header. Browser
 * fetches set Origin automatically, but Node/Vercel server-side fetches do
 * not — without an explicit Origin the API returns "No community found".
 * `NEXT_PUBLIC_APP_URL` carries the canonical site URL per environment.
 */
export function getServerFetchHeaders(): Record<string, string> {
  if (typeof window !== 'undefined') return {};
  const origin = process.env.NEXT_PUBLIC_APP_URL;
  return origin ? { Origin: origin } : {};
}
