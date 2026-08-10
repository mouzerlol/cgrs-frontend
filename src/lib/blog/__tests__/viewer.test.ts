import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/**
 * Who passes the gate, and what happens when the question cannot be answered.
 *
 * The failure cases matter more than the happy one. The API is cold outside the
 * keep-warm window and can time out on the first request of the morning; every
 * one of those paths has to land on "does not pass", because a gate that opens
 * when the backend hiccups is not a gate.
 */

const getToken = vi.fn<[], Promise<string | null>>();

vi.mock('@clerk/nextjs/server', () => ({
  auth: async () => ({ getToken }),
}));

// `cache()` from React dedupes per request. Outside a request there is nothing
// to key on, so it is the identity wrapper here — each test calls the real
// function rather than a memoised answer from the test before.
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react');
  return { ...actual, cache: <T,>(fn: T) => fn };
});

async function loadModule() {
  vi.resetModules();
  return import('../viewer');
}

function respond(body: unknown, ok = true, status = 200) {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValue({
    ok,
    status,
    json: async () => body,
  } as Response);
}

beforeEach(() => {
  getToken.mockReset();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('who passes the gate', () => {
  it.each(['owner', 'society_manager', 'committee_member', 'committee_chairperson'])(
    'admits %s',
    async (role) => {
      getToken.mockResolvedValue('a-token');
      respond({ membership: { role }, is_superadmin: false });
      const { canViewGatedPosts } = await loadModule();

      expect(await canViewGatedPosts()).toBe(true);
    }
  );

  it.each(['resident', 'contact'])('refuses %s', async (role) => {
    getToken.mockResolvedValue('a-token');
    respond({ membership: { role }, is_superadmin: false });
    const { canViewGatedPosts } = await loadModule();

    expect(await canViewGatedPosts()).toBe(false);
  });

  it('refuses a user with no membership at all', async () => {
    getToken.mockResolvedValue('a-token');
    respond({ membership: null, is_superadmin: false });
    const { canViewGatedPosts } = await loadModule();

    expect(await canViewGatedPosts()).toBe(false);
  });

  it('admits a superadmin whatever their community role', async () => {
    getToken.mockResolvedValue('a-token');
    respond({ membership: { role: 'resident' }, is_superadmin: true });
    const { canViewGatedPosts } = await loadModule();

    expect(await canViewGatedPosts()).toBe(true);
  });

  it('refuses a signed-out visitor without asking the API', async () => {
    getToken.mockResolvedValue(null);
    const fetchSpy = respond({});
    const { canViewGatedPosts } = await loadModule();

    expect(await canViewGatedPosts()).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

describe('when the role cannot be resolved', () => {
  it('fails closed on a network error', async () => {
    getToken.mockResolvedValue('a-token');
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('ECONNREFUSED'));
    const { canViewGatedPosts } = await loadModule();

    expect(await canViewGatedPosts()).toBe(false);
  });

  it('fails closed on a timeout', async () => {
    getToken.mockResolvedValue('a-token');
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(
      Object.assign(new Error('The operation was aborted'), { name: 'TimeoutError' })
    );
    const { canViewGatedPosts } = await loadModule();

    expect(await canViewGatedPosts()).toBe(false);
  });

  it('fails closed on a non-OK response', async () => {
    getToken.mockResolvedValue('a-token');
    respond({}, false, 503);
    const { canViewGatedPosts } = await loadModule();

    expect(await canViewGatedPosts()).toBe(false);
  });

  it('fails closed on a body it cannot understand', async () => {
    getToken.mockResolvedValue('a-token');
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => {
        throw new SyntaxError('Unexpected token <');
      },
    } as unknown as Response);
    const { canViewGatedPosts } = await loadModule();

    expect(await canViewGatedPosts()).toBe(false);
  });

  it('fails closed when the session itself cannot be read', async () => {
    getToken.mockRejectedValue(new Error('Clerk is not configured'));
    const { canViewGatedPosts } = await loadModule();

    expect(await canViewGatedPosts()).toBe(false);
  });

  it('never caches the answer, which is per-viewer', async () => {
    getToken.mockResolvedValue('a-token');
    const fetchSpy = respond({ membership: { role: 'owner' } });
    const { canViewGatedPosts } = await loadModule();

    await canViewGatedPosts();

    expect(fetchSpy.mock.calls[0]?.[1]).toMatchObject({ cache: 'no-store' });
  });
});
