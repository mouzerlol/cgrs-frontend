/**
 * Tests for nav-items API client: authenticated requests must send Bearer token
 * so the backend can resolve role-based nav (Discussion, Management, etc.).
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getNavItems } from '../nav-items';

describe('getNavItems', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ items: [], flags: {} }), { status: 200 })),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends Authorization Bearer when getToken returns a JWT', async () => {
    await getNavItems(async () => 'jwt-from-clerk');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/nav-items'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer jwt-from-clerk',
        }),
      }),
    );
  });

  it('does not set Authorization when getToken is omitted', async () => {
    await getNavItems();

    const [, init] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit];
    expect(init.headers).toEqual({});
  });
});
