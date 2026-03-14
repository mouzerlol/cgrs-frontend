import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

/** Routes that require sign-in; unauthenticated users are redirected to sign-in. */
const isProtectedRoute = createRouteMatcher([
  '/work-management(.*)',
  '/discussion/new(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
