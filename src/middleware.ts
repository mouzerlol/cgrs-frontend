import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/** Routes that require sign-in; unauthenticated users are redirected to sign-in. */
const isProtectedRoute = createRouteMatcher([
  '/admin(.*)',
  '/discussion/new(.*)',
  // Threads are members-only. Gating here sends a signed-out visitor to sign-in with a
  // return URL; without it the thread page loads, the API 401s, and the global query
  // error handler bounces them to /no-access ("Session could not be verified"), which
  // reads as a dead link to someone who simply is not signed in.
  '/discussion/thread(.*)',
  '/account(.*)',
]);

/** Routes that should be publicly accessible (SEO-critical). */
const isPublicRoute = createRouteMatcher([
  '/(robots.txt|sitemap.xml)',
  '/api/health(.*)',
  '/login(.*)',
  '/register(.*)',
]);

/**
 * Clerk's clerkMiddleware asserts publishable + secret keys on every request; if either is unset,
 * it throws and Next.js surfaces a generic "Internal Server Error" with no hint in the browser.
 */
function isClerkConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() && process.env.CLERK_SECRET_KEY?.trim(),
  );
}

/** Readable 503 when env is incomplete (common after clone or new machine). */
function clerkMissingEnvResponse(): NextResponse {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Clerk configuration required</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 42rem; margin: 2rem auto; padding: 0 1rem; line-height: 1.5; color: #1a2218; }
    code, pre { background: #f4f1ea; padding: 0.2em 0.4em; border-radius: 4px; font-size: 0.9em; }
    pre { padding: 1rem; overflow-x: auto; }
    h1 { font-size: 1.25rem; }
  </style>
</head>
<body>
  <h1>Authentication is not configured</h1>
  <p>This app needs Clerk API keys. Add them to <code>.env.local</code> in the project root (copy from the Clerk Dashboard → API Keys):</p>
  <pre>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...</pre>
  <p>Restart <code>npm run dev</code> after saving. If keys are set but you still see this page, ensure the variable names match exactly (no quotes issues, no trailing spaces).</p>
</body>
</html>`;
  return new NextResponse(html, {
    status: 503,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

/**
 * Blog paths served statically to everyone, and dynamically to members.
 *
 * `/blog` and `/blog/[slug]` are prerendered from the public manifest and make
 * no `auth()` call — reading a role inside them would opt the whole segment out
 * of static generation for crawlers and signed-out visitors too, which is most
 * of the traffic. So a signed-in request is rewritten instead, onto sibling
 * routes that render dynamically and resolve the viewer's role themselves.
 *
 * The URL never changes: an owner and a stranger share one link, and it is the
 * route below that decides whether the stranger gets the article or a 404.
 *
 * Only the cheap `userId` check happens here. Resolving the role would mean a
 * network call to Cloud Run from the edge on every blog request, with nowhere to
 * cache the answer.
 */
const isBlogRoute = createRouteMatcher(['/blog', '/blog/(.*)']);

/**
 * Where the rewrite lands. A sibling segment rather than `/blog/members`, which
 * would collide with the `[slug]` space and quietly reserve `members` as a slug
 * nobody could publish under.
 */
const MEMBERS_BLOG_PREFIX = '/blog-members';

const clerkAuthMiddleware = clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return;
  if (isProtectedRoute(req)) await auth.protect();

  if (isBlogRoute(req)) {
    const { userId } = await auth();
    if (userId) {
      const url = req.nextUrl.clone();
      url.pathname = `${MEMBERS_BLOG_PREFIX}${url.pathname.slice('/blog'.length)}`;
      return NextResponse.rewrite(url);
    }
  }
});

export default function middleware(request: NextRequest, event: Parameters<typeof clerkAuthMiddleware>[1]) {
  if (!isClerkConfigured()) {
    if (process.env.NODE_ENV === 'development') {
      console.error(
        '[cgrs] Missing Clerk env: set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY in .env.local (see middleware guard).',
      );
    }
    return clerkMissingEnvResponse();
  }
  return clerkAuthMiddleware(request, event);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
