import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/** Routes that require sign-in; unauthenticated users are redirected to sign-in. */
const isProtectedRoute = createRouteMatcher([
  '/work-management(.*)',
  '/discussion/new(.*)',
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

const clerkAuthMiddleware = clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return;
  if (isProtectedRoute(req)) await auth.protect();
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
