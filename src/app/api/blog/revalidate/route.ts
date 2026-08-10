import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import { BLOG_CACHE_TAG } from '@/lib/blog/origin';

/**
 * Drop the cached manifest so a just-published post appears immediately.
 *
 * This is an accelerator, never the mechanism. Correctness rests on the
 * manifest's own freshness window: if this route is never called, is called and
 * fails, or is unreachable from the API entirely, the change still appears once
 * the window elapses. That is why the writer treats a failed call as a warning
 * and never as a failed publish.
 *
 * The secret only permits cache invalidation — it grants no ability to read or
 * change content — but it is still required, because an open endpoint would let
 * anyone force every visitor's next request to miss cache.
 */

export const runtime = 'nodejs';
/** Never prerendered or cached: the whole point is to run on every call. */
export const dynamic = 'force-dynamic';

function refuse() {
  // Deliberately uninformative. A caller with the wrong secret learns only that
  // it was wrong, not whether one is configured or what shape it takes.
  return NextResponse.json({ revalidated: false }, { status: 401 });
}

export async function POST(request: Request) {
  const expected = (process.env.BLOG_REVALIDATE_SECRET ?? '').trim();

  // With no secret configured the route is closed rather than open. An
  // environment that has not been given one cannot be signalled, which is a
  // state the writer already handles by skipping the call.
  if (!expected) return refuse();

  let supplied = request.headers.get('x-blog-revalidate-secret') ?? '';
  if (!supplied) {
    try {
      const body = (await request.json()) as { secret?: string };
      supplied = body?.secret ?? '';
    } catch {
      supplied = '';
    }
  }

  if (supplied !== expected) return refuse();

  revalidateTag(BLOG_CACHE_TAG);

  return NextResponse.json({ revalidated: true, tag: BLOG_CACHE_TAG });
}
