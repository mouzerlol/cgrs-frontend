import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

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

export default clerkMiddleware(async (auth, req) => {
  // Allow public routes to pass through without auth
  if (isPublicRoute(req)) return;
  
  // Protect restricted routes
  if (isProtectedRoute(req)) await auth.protect();
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
