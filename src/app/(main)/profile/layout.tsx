'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useAuth, useUser, SignInButton } from '@clerk/nextjs';
import { Icon } from '@iconify/react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import ProfileHero from '@/components/profile/ProfileHero';
import ProfileSkeleton from '@/components/profile/ProfileSkeleton';
import ProfileSideNav from '@/components/profile/ProfileSideNav';
import { cn } from '@/lib/utils';

const PROFILE_NAV_ITEMS = [
  { id: 'details', href: '/profile', label: 'Profile Details', icon: 'lucide:user' },
  { id: 'reported-issues', href: '/profile/reported-issues', label: 'Reported Issues', icon: 'lucide:message-square' },
  { id: 'my-property', href: '/profile/my-property', label: 'My Property', icon: 'lucide:house' },
] as const;

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  const { user: clerkUser } = useUser();
  const { data, isLoading, error } = useCurrentUser();
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const clerkFallback = clerkUser
    ? {
        firstName: clerkUser.firstName ?? undefined,
        lastName: clerkUser.lastName ?? undefined,
        imageUrl: clerkUser.imageUrl ?? undefined,
        email: clerkUser.primaryEmailAddress?.emailAddress ?? undefined,
      }
    : undefined;

  // Derive active category from pathname
  const activeCategory = PROFILE_NAV_ITEMS.find((item) => {
    if (item.href === '/profile') return pathname === '/profile';
    return pathname.startsWith(item.href);
  })?.id ?? null;

  function handleNavChange(id: string | null) {
    const item = PROFILE_NAV_ITEMS.find((item) => item.id === id);
    if (item) router.push(item.href);
  }

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
  if (error || !data) {
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
        <ProfileHero user={data.user} membership={data.membership} clerkFallback={clerkFallback} />

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
          {/* Desktop: Vertical folder-tab sidebar */}
          <ProfileSideNav
            className="hidden lg:flex sticky top-24 self-stretch"
            activeCategory={activeCategory}
            onCategoryChange={handleNavChange}
          />

          {/* Mobile: Dropdown at top of content */}
          <div className="flex lg:hidden mb-4">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-forest-light px-4 py-3 text-sm font-medium text-bone w-full"
            >
              <Icon icon="lucide:menu" className="h-5 w-5" aria-hidden="true" />
              {PROFILE_NAV_ITEMS.find((item) => item.id === activeCategory)?.label || 'Menu'}
            </button>
          </div>

          {/* Content area with sage-light background */}
          <div className="min-w-0 flex-1">
            <div className="bg-sage-light rounded-2xl lg:rounded-l-none lg:rounded-r-2xl p-lg sm:p-lg p-sm">
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
      </div>
    </section>
  );
}
