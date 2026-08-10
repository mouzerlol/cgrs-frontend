import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/**
 * The revalidation route.
 *
 * It only ever invalidates a cache — it cannot read or change content — but it
 * still has to be closed, because an open endpoint would let anyone force every
 * visitor's next request to miss cache.
 */

const revalidateTag = vi.hoisted(() => vi.fn());

vi.mock('next/cache', () => ({ revalidateTag }));

const SECRET = 'BLOG_REVALIDATE_SECRET';
let original: string | undefined;

beforeEach(() => {
  original = process.env[SECRET];
  revalidateTag.mockClear();
});

afterEach(() => {
  if (original === undefined) delete process.env[SECRET];
  else process.env[SECRET] = original;
});

function request(body: unknown, headers: Record<string, string> = {}) {
  return new Request('https://cgrs.co.nz/api/blog/revalidate', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
}

describe('POST /api/blog/revalidate', () => {
  it('invalidates the manifest when the secret matches', async () => {
    process.env[SECRET] = 'shared';
    const { POST } = await import('../route');

    const response = await POST(request({ secret: 'shared' }));

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ revalidated: true });
    expect(revalidateTag).toHaveBeenCalledWith('blog-manifest');
  });

  it('accepts the secret in a header as well as in the body', async () => {
    process.env[SECRET] = 'shared';
    const { POST } = await import('../route');

    const response = await POST(request({}, { 'x-blog-revalidate-secret': 'shared' }));

    expect(response.status).toBe(200);
    expect(revalidateTag).toHaveBeenCalled();
  });

  it('refuses a wrong secret and invalidates nothing', async () => {
    process.env[SECRET] = 'shared';
    const { POST } = await import('../route');

    const response = await POST(request({ secret: 'wrong' }));

    expect(response.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it('refuses a missing secret', async () => {
    process.env[SECRET] = 'shared';
    const { POST } = await import('../route');

    const response = await POST(request({}));

    expect(response.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it('is closed rather than open when no secret is configured', async () => {
    delete process.env[SECRET];
    const { POST } = await import('../route');

    const response = await POST(request({ secret: 'anything' }));

    expect(response.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it('refuses a malformed body without throwing', async () => {
    process.env[SECRET] = 'shared';
    const { POST } = await import('../route');

    const malformed = new Request('https://cgrs.co.nz/api/blog/revalidate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: 'not json',
    });

    const response = await POST(malformed);

    expect(response.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it('says nothing about whether a secret is configured', async () => {
    process.env[SECRET] = 'shared';
    const { POST } = await import('../route');
    const wrong = await (await POST(request({ secret: 'wrong' }))).json();

    delete process.env[SECRET];
    vi.resetModules();
    const { POST: POST2 } = await import('../route');
    const unconfigured = await (await POST2(request({ secret: 'wrong' }))).json();

    expect(wrong).toEqual(unconfigured);
  });
});
