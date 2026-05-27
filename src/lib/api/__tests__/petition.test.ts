import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getAdminSignatures, downloadSignaturesCsv } from '@/lib/api/petition';
import { apiRequest } from '@/lib/api/client';
import type { AdminSignaturesListResponse } from '@/types/admin';

vi.mock('@/lib/api/client', () => ({
  apiRequest: vi.fn(),
}));

describe('getAdminSignatures', () => {
  const getToken = vi.fn(async () => 'token');

  beforeEach(() => {
    vi.mocked(apiRequest).mockReset();
    getToken.mockClear();
  });

  it('calls GET /api/v1/petition/signatures/list and returns the typed response', async () => {
    const fixture: AdminSignaturesListResponse = {
      signatures: [
        {
          id: 'sig-1',
          first_name: 'Ada',
          last_name: 'Lovelace',
          email: 'ada@example.com',
          resident_type: 'owner',
          address: '1 Analytical Engine Way',
          ip_address: '203.0.113.7',
          email_updates_consent: true,
          consent_recorded_at: '2026-05-01T12:00:00Z',
          signed_at: '2026-05-01T12:00:00Z',
        },
      ],
      total: 1,
      offset: 0,
      limit: 50,
      has_more: false,
    };
    vi.mocked(apiRequest).mockResolvedValue(fixture);

    const result = await getAdminSignatures(getToken);

    expect(apiRequest).toHaveBeenCalledWith(
      '/api/v1/petition/signatures/list',
      getToken,
    );
    expect(result).toEqual(fixture);
  });

  it('appends pagination and sort query params when supplied', async () => {
    const empty: AdminSignaturesListResponse = {
      signatures: [],
      total: 0,
      offset: 0,
      limit: 50,
      has_more: false,
    };
    vi.mocked(apiRequest).mockResolvedValue(empty);
    await getAdminSignatures(getToken, { offset: 50, limit: 50, sort: 'email', order: 'asc' });
    expect(apiRequest).toHaveBeenCalledWith(
      '/api/v1/petition/signatures/list?offset=50&limit=50&sort=email&order=asc',
      getToken,
    );
  });

  it('passes the getToken function through to apiRequest', async () => {
    const empty: AdminSignaturesListResponse = {
      signatures: [],
      total: 0,
      offset: 0,
      limit: 50,
      has_more: false,
    };
    vi.mocked(apiRequest).mockResolvedValue(empty);
    await getAdminSignatures(getToken);
    expect(apiRequest).toHaveBeenCalledWith(expect.any(String), getToken);
  });
});

describe('downloadSignaturesCsv', () => {
  const getToken = vi.fn(async () => 'csv-token');
  const originalFetch = globalThis.fetch;
  const originalCreateObjectURL = globalThis.URL.createObjectURL;
  const originalRevokeObjectURL = globalThis.URL.revokeObjectURL;

  let createObjectURLMock: ReturnType<typeof vi.fn>;
  let revokeObjectURLMock: ReturnType<typeof vi.fn>;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    getToken.mockClear();

    createObjectURLMock = vi.fn(() => 'blob:mock-url');
    revokeObjectURLMock = vi.fn();
    globalThis.URL.createObjectURL = createObjectURLMock as unknown as typeof URL.createObjectURL;
    globalThis.URL.revokeObjectURL = revokeObjectURLMock as unknown as typeof URL.revokeObjectURL;

    fetchMock = vi.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    globalThis.URL.createObjectURL = originalCreateObjectURL;
    globalThis.URL.revokeObjectURL = originalRevokeObjectURL;
  });

  it('triggers a download with filename signatures.csv on success', async () => {
    fetchMock.mockResolvedValue(
      new Response(new Blob(['a,b\n1,2'], { type: 'text/csv' }), { status: 200 }),
    );

    const anchor = {
      href: '',
      download: '',
      click: vi.fn(),
      remove: vi.fn(),
    } as unknown as HTMLAnchorElement;
    const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(anchor);
    const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);

    await downloadSignaturesCsv(getToken);

    expect(anchor.download).toBe('signatures.csv');
    expect(anchor.click).toHaveBeenCalledTimes(1);

    createElementSpy.mockRestore();
    appendChildSpy.mockRestore();
  });

  it('revokes the object URL on success', async () => {
    fetchMock.mockResolvedValue(
      new Response(new Blob(['ok'], { type: 'text/csv' }), { status: 200 }),
    );

    const anchor = {
      href: '',
      download: '',
      click: vi.fn(),
      remove: vi.fn(),
    } as unknown as HTMLAnchorElement;
    vi.spyOn(document, 'createElement').mockReturnValue(anchor);
    vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);

    await downloadSignaturesCsv(getToken);

    expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:mock-url');
  });

  it('throws and revokes the object URL on non-2xx response', async () => {
    fetchMock.mockResolvedValue(new Response('forbidden', { status: 403 }));

    await expect(downloadSignaturesCsv(getToken)).rejects.toThrow();
    // No object URL should have been created if the request failed early.
    // If implementation creates one before checking status, it must still be revoked.
    if (createObjectURLMock.mock.calls.length > 0) {
      expect(revokeObjectURLMock).toHaveBeenCalled();
    }
  });

  it('sends the Bearer token from getToken in the Authorization header', async () => {
    fetchMock.mockResolvedValue(
      new Response(new Blob(['ok'], { type: 'text/csv' }), { status: 200 }),
    );
    const anchor = {
      href: '',
      download: '',
      click: vi.fn(),
      remove: vi.fn(),
    } as unknown as HTMLAnchorElement;
    vi.spyOn(document, 'createElement').mockReturnValue(anchor);
    vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);

    await downloadSignaturesCsv(getToken);

    expect(getToken).toHaveBeenCalled();
    const [, init] = fetchMock.mock.calls[0];
    const headers = (init?.headers ?? {}) as Record<string, string>;
    expect(headers.Authorization ?? headers.authorization).toBe('Bearer csv-token');
  });
});
