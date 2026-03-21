'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useAuth, useUser, SignInButton } from '@clerk/nextjs';
import { Icon } from '@iconify/react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import ProfileHero from '@/components/profile/ProfileHero';
import ProfileSkeleton from '@/components/profile/ProfileSkeleton';
import ProfileSideNav from '@/components/profile/ProfileSideNav';
import MobileDrawer from '@/components/profile/MobileDrawer';
import { SiteBreadcrumbs } from '@/components/ui/breadcrumb';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  const { user: clerkUser } = useUser();
  const { data, isLoading, error } = useCurrentUser();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const clerkFallback =
    clerkUser && (clerkUser.firstName || clerkUser.lastName || clerkUser.imageUrl)
      ? {
          firstName: clerkUser.firstName ?? undefined,
          lastName: clerkUser.lastName ?? undefined,
          imageUrl: clerkUser.imageUrl ?? undefined,
        }
      : undefined;

  // Not loaded yet
  if (!isLoaded || isLoading) {
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
          <div className="rounded-card bg-white p-8 text-center shadow-[0_8px_32px_rgba(26,34,24,0.08)]">
            <h2 className="mb-4 font-display text-2xl text-forest">Sign in to view your profile</h2>
            <p className="mb-6 text-forest/70">Access your community membership and manage your account.</p>
            <SignInButton mode="redirect">
              <button className="rounded bg-terracotta px-6 py-3 font-medium text-bone transition-colors hover:bg-terracotta/90">
                Sign In
              </button>
            </SignInButton>
          </div>
        </div>
      </section>
    );
  }

  // Error or no data
  if (error || !data) {
    return (
      <section className="section bg-bone">
        <div className="container max-w-3xl">
          <div className="rounded-card bg-terracotta/10 p-8 text-center shadow-[0_8px_32px_rgba(26,34,24,0.08)]">
            <p className="text-terracotta">We couldn&apos;t load your profile. Please try again.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section bg-bone">
      <div className="container max-w-5xl">
        {/* Hero */}
        <ProfileHero user={data.user} membership={data.membership} clerkFallback={clerkFallback} />

        <SiteBreadcrumbs variant="belowHero" />

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

        {/* Mobile drawer */}
        <MobileDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <div className="flex items-center justify-between border-b border-sage/20 px-4 py-3">
            <span className="text-sm font-semibold text-forest">Profile Menu</span>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="rounded-lg p-1 text-forest/70 transition-colors hover:bg-sage-light/30"
              aria-label="Close navigation menu"
            >
              <Icon icon="lucide:x" className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <ProfileSideNav onNavigate={() => setDrawerOpen(false)} />
        </MobileDrawer>

        {/* Sidebar + content */}
        <div className="mt-6 lg:flex lg:gap-6">
          <div className="hidden w-56 shrink-0 lg:block">
            <ProfileSideNav className="sticky top-24 rounded-card overflow-hidden" />
          </div>
          <div className="min-w-0 flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={prefersReducedMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
