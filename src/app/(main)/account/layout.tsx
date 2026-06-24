'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth, useUser, SignInButton } from '@clerk/nextjs';
import { Menu } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useCurrentUserQuery, useVerificationStatusQuery } from '@/hooks/useProfileData';
import ProfileSkeleton from '@/components/profile/ProfileSkeleton';
import ProfileSideNav from '@/components/profile/ProfileSideNav';
import ProfileIdentityCard from '@/components/profile/ProfileIdentityCard';
import ProfileDetailsSection from '@/components/profile/sections/ProfileDetailsSection';
import ReportedIssuesSection from '@/components/profile/sections/ReportedIssuesSection';
import MyPropertySection from '@/components/profile/sections/MyPropertySection';
import BookmarksSection from '@/components/profile/sections/BookmarksSection';
import SocietySection from '@/components/profile/sections/SocietySection';
import SocietyDocumentsSection from '@/components/profile/sections/SocietyDocumentsSection';
import GroundReportSection from '@/components/profile/sections/GroundReportSection';
import MobileAccountNav from '@/components/profile/MobileAccountNav';
import { SiteBreadcrumbs } from '@/components/ui/breadcrumb';
import { isReportedIssueDetailPath, isSquareAccountTab } from '@/lib/account-routes';
import { canViewSocietyRecord, canViewGroundReport } from '@/lib/auth';
import { cn } from '@/lib/utils';

const TAB_ITEMS = [
  { id: 'details', href: '/account/profile', label: 'Profile Details' },
  { id: 'my-property', href: '/account/my-property', label: 'My Property' },
  { id: 'reported-issues', href: '/account/reported-issues', label: 'Reported Issues' },
  { id: 'bookmarks', href: '/account/bookmarks', label: 'Bookmarks' },
  { id: 'society', href: '/account/society', label: 'Society' },
  { id: 'ground-report', href: '/account/ground-report', label: 'Ground Report' },
] as const;

type TabId = (typeof TAB_ITEMS)[number]['id'];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  const { user: clerkUser } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isTabSwitching, setIsTabSwitching] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Fetch all profile data at layout level (shared across all sections)
  const { data: userData, isLoading: isUserLoading, error: userError } = useCurrentUserQuery();
  const { data: verificationStatus } = useVerificationStatusQuery();

  const clerkFallback = clerkUser
    ? {
        firstName: clerkUser.firstName ?? undefined,
        lastName: clerkUser.lastName ?? undefined,
        imageUrl: clerkUser.imageUrl ?? undefined,
        email: clerkUser.primaryEmailAddress?.emailAddress ?? undefined,
      }
    : undefined;

  // Derive active tab from pathname. The bare `/account` landing matches no tab,
  // so `activeTab` is null and the layout renders the placeholder page via `children`.
  const activeTab = (TAB_ITEMS.find((item) => {
    if (item.href === '/account/profile') return pathname === '/account/profile';
    return pathname.startsWith(item.href);
  })?.id ?? null) as TabId | null;

  // Prefetch route on hover
  function handleTabHover(href: string) {
    router.prefetch(href);
  }

  // Handle tab change - update URL and trigger animation
  function handleTabChange(id: TabId) {
    const item = TAB_ITEMS.find((item) => item.id === id);
    if (item && item.href !== pathname) {
      setIsTabSwitching(true);
      router.push(item.href);
      // Reset after animation completes
      setTimeout(() => setIsTabSwitching(false), 300);
    }
  }

  // Standard site breadcrumb strip. URL-driven (matches /discussion and
  // /management-request). Rendered in EVERY layout state — loading skeleton,
  // signed-out, error, and the authed view — so a hard refresh (which lands in
  // the skeleton branch first) never shows a breadcrumb-less account page.
  // The `.section` top padding clears the fixed nav, but NOT the beta banner
  // that sits below it — so offset by the banner-height var (collapses to 0
  // when the banner is absent, keeping the snug under-nav gap either way).
  // Negative inline margins cancel the bar's own px so the trail aligns flush
  // with the content panel.
  const breadcrumbStrip = (
    <div className="mt-[calc(var(--site-banner-height,0px)-1rem)]">
      <SiteBreadcrumbs variant="belowHero" className="-mx-4 md:-mx-6" />
    </div>
  );

  // Not loaded yet
  if (!isLoaded || isUserLoading) {
    return (
      <section className="section bg-bone">
        <div className="container max-w-5xl">
          {breadcrumbStrip}
          <div className="mt-4">
            <ProfileSkeleton />
          </div>
        </div>
      </section>
    );
  }

  // Not signed in
  if (!isSignedIn) {
    return (
      <section className="section bg-bone">
        <div className="container max-w-3xl">
          {breadcrumbStrip}
          <div className="mt-4 rounded-2xl bg-white p-8 text-center shadow-[0_8px_32px_rgba(26,34,24,0.08)]">
            <h2 className="mb-4 font-display text-2xl text-forest">Sign in to view your profile</h2>
            <p className="mb-6 text-forest/70">Access your community membership and manage your account.</p>
            <SignInButton mode="redirect">
              <button className="rounded-xl bg-terracotta px-6 py-3 font-medium text-bone transition-colors hover:bg-terracotta/90">
                Sign In
              </button>
            </SignInButton>
          </div>
        </div>
      </section>
    );
  }

  const canViewSociety = canViewSocietyRecord(userData?.membership?.role, userData?.is_superadmin ?? false);
  const canViewGroundReportTab = canViewGroundReport(userData?.membership?.role, userData?.is_superadmin ?? false);

  // Error or no data
  if (userError || !userData) {
    return (
      <section className="section bg-bone">
        <div className="container max-w-3xl">
          {breadcrumbStrip}
          <div className="mt-4 rounded-2xl bg-terracotta/10 p-8 text-center shadow-[0_8px_32px_rgba(26,34,24,0.08)]">
            <p className="text-terracotta">We couldn&apos;t load your profile. Please try again.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section bg-bone">
      <div className="container max-w-5xl">
        {breadcrumbStrip}

        {/* Mobile slide-in navigation drawer (hidden ≥lg where the sidebar shows).
            Identity now lives in the nav (rail + drawer), not a page-top hero. */}
        <MobileAccountNav
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          activeCategory={activeTab}
          onCategoryChange={(id) => handleTabChange(id as TabId)}
          hasPendingVerification={verificationStatus?.has_pending_request ?? false}
          canViewSociety={canViewSociety}
          canViewGroundReport={canViewGroundReportTab}
          user={userData.user}
          membership={userData.membership}
          clerkFallback={clerkFallback}
        />

        {/* Sidebar + content. */}
        <div className="mt-4 lg:flex lg:gap-0 lg:items-stretch">
          {/* Desktop: Vertical folder-tab sidebar with prefetch */}
          <ProfileSideNav
            className="hidden lg:flex sticky top-24 self-stretch"
            activeCategory={activeTab}
            onCategoryChange={handleTabChange as (id: string) => void}
            onTabHover={handleTabHover}
            hasPendingVerification={verificationStatus?.has_pending_request ?? false}
            canViewSociety={canViewSociety}
            canViewGroundReport={canViewGroundReportTab}
            user={userData.user}
            membership={userData.membership}
            clerkFallback={clerkFallback}
          />

          {/* Mobile: identity chip doubles as the trigger that opens the drawer.
              Anchored just below the top nav (--chrome-height) and rides WITH it: when the
              chrome collapses on scroll it sets data-chrome-hidden, and this bar translates
              up-and-away in lockstep, restoring together when the chrome returns. */}
          <div className="flex lg:hidden mb-4 sticky top-[calc(var(--chrome-height,calc(72px_+_var(--site-banner-height)))_+_0.5rem)] z-30 transition-transform duration-300 ease-out-custom motion-reduce:transition-none [html[data-chrome-hidden]_&]:-translate-y-[calc(100%_+_var(--chrome-height,calc(72px_+_var(--site-banner-height)))_+_0.5rem)]">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={drawerOpen}
              aria-controls="account-mobile-nav"
              aria-label="Open account navigation"
              className="flex items-center gap-3 rounded-xl bg-forest-light px-4 py-2.5 text-bone w-full transition-colors hover:bg-forest focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bone"
            >
              <ProfileIdentityCard
                variant="trigger"
                user={userData.user}
                membership={userData.membership}
                clerkFallback={clerkFallback}
              />
              <Menu className="h-5 w-5 shrink-0 text-bone/70" aria-hidden="true" />
            </button>
          </div>

          {/* Content area with sage-light background. Management-identity tabs
              (society, verification, ground-report) square the free edges so the
              panel reads as a filed record; community tabs keep rounded corners. */}
          <div className="min-w-0 flex-1 self-stretch min-h-[500px]">
            <div
              className={cn(
                // Modest top padding above the section heading (reduced ~2/3 from
                // the older generous spacing that stood in for a page heading).
                'bg-sage-light p-sm pt-sm sm:p-lg sm:pt-md',
                isSquareAccountTab(activeTab)
                  ? 'rounded-none'
                  : 'rounded-2xl lg:rounded-l-none lg:rounded-r-2xl',
              )}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab ?? 'dashboard'}
                  initial={prefersReducedMotion ? false : { opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={prefersReducedMotion ? undefined : { opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* No active tab = bare /account landing: render the placeholder page. */}
                  {activeTab === null && children}
                  {/* Render the active section - all sections are rendered but only one is visible */}
                  {activeTab === 'details' && <ProfileDetailsSection />}
                  {activeTab === 'reported-issues' &&
                    (isReportedIssueDetailPath(pathname) ? children : <ReportedIssuesSection />)}
                  {activeTab === 'my-property' && <MyPropertySection />}
                  {activeTab === 'bookmarks' && <BookmarksSection />}
                  {activeTab === 'society' && canViewSociety && (
                    <div className="space-y-6">
                      <SocietySection />
                      <SocietyDocumentsSection />
                    </div>
                  )}
                  {activeTab === 'ground-report' && canViewGroundReportTab && <GroundReportSection />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
