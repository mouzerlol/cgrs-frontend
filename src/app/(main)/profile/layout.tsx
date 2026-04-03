'use client';

import { useState, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth, useUser, SignInButton } from '@clerk/nextjs';
import { Icon } from '@iconify/react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useCurrentUserQuery, useVerificationStatusQuery } from '@/hooks/useProfileData';
import ProfileHero from '@/components/profile/ProfileHero';
import ProfileSkeleton from '@/components/profile/ProfileSkeleton';
import ProfileSideNav from '@/components/profile/ProfileSideNav';
import ProfileDetailsSection from '@/components/profile/sections/ProfileDetailsSection';
import VerificationSection from '@/components/profile/sections/VerificationSection';
import ReportedIssuesSection from '@/components/profile/sections/ReportedIssuesSection';
import MyPropertySection from '@/components/profile/sections/MyPropertySection';
import { cn } from '@/lib/utils';

const TAB_ITEMS = [
  { id: 'verification', href: '/profile/verification', label: 'Verification' },
  { id: 'details', href: '/profile', label: 'Profile Details' },
  { id: 'reported-issues', href: '/profile/reported-issues', label: 'Reported Issues' },
  { id: 'my-property', href: '/profile/my-property', label: 'My Property' },
] as const;

type TabId = (typeof TAB_ITEMS)[number]['id'];

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
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

  // Derive active tab from pathname
  const activeTab = (TAB_ITEMS.find((item) => {
    if (item.href === '/profile') return pathname === '/profile';
    return pathname.startsWith(item.href);
  })?.id ?? 'details') as TabId;

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
        {/* Profile Hero - no rounded corners, persistent header */}
        <ProfileHero user={userData.user} membership={userData.membership} clerkFallback={clerkFallback} />

        {/* Mobile hamburger */}
        <div className="mt-4 lg:hidden">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-forest shadow-sm transition-colors hover:bg-sage-light/30"
            aria-label="Open navigation menu"
          >
            <Icon icon="lucide:menu" className="h-5 w-5" aria-hidden="true" />
            Menu
          </button>
        </div>

        {/* Sidebar + content */}
        <div className="mt-6 lg:flex lg:gap-0 lg:items-stretch">
          {/* Desktop: Vertical folder-tab sidebar with prefetch */}
          <ProfileSideNav
            className="hidden lg:flex sticky top-24 self-stretch"
            activeCategory={activeTab}
            onCategoryChange={handleTabChange as (id: string) => void}
            onTabHover={handleTabHover}
            hasPendingVerification={verificationStatus?.has_pending_request ?? false}
          />

          {/* Mobile: Dropdown at top of content */}
          <div className="flex lg:hidden mb-4">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-forest-light px-4 py-3 text-sm font-medium text-bone w-full"
            >
              <Icon icon="lucide:menu" className="h-5 w-5" aria-hidden="true" />
              {TAB_ITEMS.find((item) => item.id === activeTab)?.label || 'Menu'}
            </button>
          </div>

          {/* Content area with sage-light background */}
          <div className="min-w-0 flex-1">
            <div className="bg-sage-light rounded-2xl lg:rounded-l-none lg:rounded-r-2xl p-lg sm:p-lg p-sm">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={prefersReducedMotion ? false : { opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={prefersReducedMotion ? undefined : { opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Render the active section - all sections are rendered but only one is visible */}
                  {activeTab === 'verification' && <VerificationSection />}
                  {activeTab === 'details' && <ProfileDetailsSection />}
                  {activeTab === 'reported-issues' && <ReportedIssuesSection />}
                  {activeTab === 'my-property' && <MyPropertySection />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
