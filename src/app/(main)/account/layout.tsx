'use client';

import { useState, Suspense, useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAuth, useUser, SignInButton } from '@clerk/nextjs';
import { useQueryClient } from '@tanstack/react-query';
import { Menu } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Skeleton } from '@/components/ui/Skeleton';
import { useCurrentUserQuery, useVerificationStatusQuery } from '@/hooks/useProfileData';
import { useUnreadCount, markReadWithoutHook } from '@/hooks/useNotifications';
import ProfileHero from '@/components/profile/ProfileHero';
import ProfileSkeleton from '@/components/profile/ProfileSkeleton';
import ProfileSideNav from '@/components/profile/ProfileSideNav';
import ProfileDetailsSection from '@/components/profile/sections/ProfileDetailsSection';
import VerificationSection from '@/components/profile/sections/VerificationSection';
import ReportedIssuesSection from '@/components/profile/sections/ReportedIssuesSection';
import MyPropertySection from '@/components/profile/sections/MyPropertySection';
import BookmarksSection from '@/components/profile/sections/BookmarksSection';
import SocietySection from '@/components/profile/sections/SocietySection';
import SocietyDocumentsSection from '@/components/profile/sections/SocietyDocumentsSection';
import MobileAccountNav from '@/components/profile/MobileAccountNav';
import { isReportedIssueDetailPath } from '@/lib/account-routes';
import { canViewSocietyRecord } from '@/lib/auth';

function NotificationReadHandler({ queryClient, getToken }: { queryClient: ReturnType<typeof useQueryClient>; getToken: () => Promise<string | null> }) {
  const searchParams = useSearchParams();
  const processedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const notificationId = searchParams.get('notification_id');
    if (notificationId && !processedRef.current.has(notificationId)) {
      processedRef.current.add(notificationId);
      markReadWithoutHook(getToken, queryClient, notificationId);
    }
  }, [searchParams, queryClient, getToken]);

  return null;
}

const TAB_ITEMS = [
  { id: 'details', href: '/account/profile', label: 'Profile Details' },
  { id: 'my-property', href: '/account/my-property', label: 'My Property' },
  { id: 'reported-issues', href: '/account/reported-issues', label: 'Reported Issues' },
  { id: 'bookmarks', href: '/account/bookmarks', label: 'Bookmarks' },
  { id: 'verification', href: '/account/verification', label: 'Verification' },
  { id: 'society', href: '/account/society', label: 'Society' },
] as const;

type TabId = (typeof TAB_ITEMS)[number]['id'];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const { user: clerkUser } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isTabSwitching, setIsTabSwitching] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Fetch all profile data at layout level (shared across all sections)
  const { data: userData, isLoading: isUserLoading, error: userError } = useCurrentUserQuery();
  const { data: verificationStatus } = useVerificationStatusQuery();
  const { data: unreadCountData } = useUnreadCount();
  const unreadForVerification = unreadCountData?.by_section.find((s) => s.section === 'profile_verification')?.count ?? 0;
  // Show dot if there are unread notifications OR if there's a pending request that hasn't been synced yet
  const hasPendingVerification = unreadForVerification > 0 || (verificationStatus?.has_pending_request ?? false);

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

  // Not loaded yet
  if (!isLoaded || isUserLoading) {
    return (
      <section className="section bg-bone">
        <div className="container max-w-5xl">
          <ProfileSkeleton />
        </div>
      </section>
    );
  }

  // Not signed in
  if (!isSignedIn) {
    return (
      <section className="section bg-bone">
        <div className="container max-w-3xl">
          <div className="rounded-2xl bg-white p-8 text-center shadow-[0_8px_32px_rgba(26,34,24,0.08)]">
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

  // Error or no data
  if (userError || !userData) {
    return (
      <section className="section bg-bone">
        <div className="container max-w-3xl">
          <div className="rounded-2xl bg-terracotta/10 p-8 text-center shadow-[0_8px_32px_rgba(26,34,24,0.08)]">
            <p className="text-terracotta">We couldn&apos;t load your profile. Please try again.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section bg-bone">
      <div className="container max-w-5xl">
        {/* Handle notification deep links - must be in Suspense for static generation */}
        <Suspense fallback={null}>
          <NotificationReadHandler queryClient={queryClient} getToken={getToken} />
        </Suspense>

        {/* Profile Hero - no rounded corners, persistent header */}
        <ProfileHero user={userData.user} membership={userData.membership} clerkFallback={clerkFallback} />

        {/* Mobile slide-in navigation drawer (hidden ≥lg where the sidebar shows) */}
        <MobileAccountNav
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          activeCategory={activeTab}
          onCategoryChange={(id) => handleTabChange(id as TabId)}
          hasPendingVerification={verificationStatus?.has_pending_request ?? false}
          canViewSociety={canViewSociety}
        />

        {/* Sidebar + content */}
        <div className="mt-6 lg:flex lg:gap-0 lg:items-stretch">
          {/* Desktop: Vertical folder-tab sidebar with prefetch */}
          <ProfileSideNav
            className="hidden lg:flex sticky top-24 self-stretch"
            activeCategory={activeTab}
            onCategoryChange={handleTabChange as (id: string) => void}
            onTabHover={handleTabHover}
            hasPendingVerification={verificationStatus?.has_pending_request ?? false}
            canViewSociety={canViewSociety}
          />

          {/* Mobile: single nav trigger that opens the slide-in drawer */}
          <div className="flex lg:hidden mb-4">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={drawerOpen}
              aria-controls="account-mobile-nav"
              className="flex items-center gap-2 rounded-xl bg-forest-light px-4 py-3 text-sm font-medium text-bone w-full transition-colors hover:bg-forest focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bone"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
              <span>{TAB_ITEMS.find((item) => item.id === activeTab)?.label || 'Menu'}</span>
              <span className="ml-auto text-xs font-normal text-bone/60">Switch</span>
            </button>
          </div>

          {/* Content area with sage-light background */}
          <div className="min-w-0 flex-1 self-stretch min-h-[500px]">
            <div className="bg-sage-light rounded-2xl lg:rounded-l-none lg:rounded-r-2xl p-lg sm:p-lg p-sm">
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
                  {activeTab === 'verification' && (
                    <Suspense fallback={<Skeleton className="h-64 w-full rounded-2xl" />}>
                      <VerificationSection />
                    </Suspense>
                  )}
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
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
