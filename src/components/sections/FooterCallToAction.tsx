'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth, useUser } from '@clerk/nextjs';
import { KeyRound, UserRound } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

/**
 * Button renders a span when `asChild` is set, so the focus ring has to follow the anchor inside it.
 */
const focusWithinRing =
  'focus-within:ring-2 focus-within:ring-terracotta focus-within:ring-offset-2 focus-within:ring-offset-bone';

/** The anchor fills the button span, so the icon and label align inside it rather than beside it. */
const actionLink = 'inline-flex items-center gap-2 focus:outline-none';

/**
 * Closing band on every community page: an invitation to create an account when signed out,
 * a way back into the account area when signed in.
 *
 * Mirrors PageHeader's signature (photograph + bone plate + terracotta eyebrow pill), but the
 * plate is anchored right and flush to the footer rather than left and flush to the fold, so a
 * page opens and closes on the same material. The plate also keeps the band's visual mass light
 * where the forest footer immediately below is dark.
 */
export default function FooterCallToAction() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const [revealRef, isVisible] = useIntersectionObserver<HTMLDivElement>({ threshold: 0.2 });

  // Clerk briefly reports signed-out while it rehydrates; hold the last known answer so a
  // returning member never sees "Create an account" flash before their own copy arrives.
  const lastSignedInRef = useRef(isSignedIn);
  if (isLoaded) lastSignedInRef.current = isSignedIn;
  const signedIn = lastSignedInRef.current;

  const firstName = user?.firstName?.trim();
  const ActionIcon = signedIn ? UserRound : KeyRound;

  // Surfaces where the band would repeat what the page already offers: the sign-up and sign-in
  // pages carry the real form, and the account area is where the signed-in button points.
  const pathname = usePathname();
  const isRedundantHere = ['/register', '/login', '/account'].some((route) =>
    pathname?.startsWith(route),
  );
  if (isRedundantHere) return null;

  return (
    <section className="relative isolate overflow-hidden" aria-labelledby="footer-cta-heading">
      {/* Full-bleed photograph. Below the fold on every page, so it loads lazily. */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/huri-street.png"
          alt=""
          aria-hidden
          fill
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-forest/30" />
      </div>

      {/* Gutters mirror `.container` (1rem, 1.5rem from md) so the plate lines up with the hero
          heading card on every width; from sm it sits in the container, anchored right. */}
      <div className="mx-auto flex min-h-[17rem] w-full max-w-[1400px] items-end justify-center px-4 pt-28 sm:pt-20 md:justify-end md:px-6">
        <div
          ref={revealRef}
          className={`fade-up relative w-full max-w-lg rounded-t-2xl bg-bone px-7 pb-8 pt-7 text-forest sm:px-10 sm:pb-9 sm:pt-8 ${isVisible ? 'visible' : ''}`}
        >
          {/* Paper tooth, matching the sign-in and register cards. */}
          <div className="texture-grain pointer-events-none absolute inset-0 rounded-t-2xl opacity-50 mix-blend-multiply" />

          <div
            className={`relative transition-opacity duration-200 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            aria-hidden={!isLoaded}
          >
            <h2
              id="footer-cta-heading"
              className="mb-3 text-balance font-display text-3xl font-medium leading-none md:text-4xl"
            >
              {signedIn
                ? firstName
                  ? `Welcome back, ${firstName}.`
                  : 'Welcome back.'
                : 'Residents see more.'}
            </h2>

            <p className="mb-6 max-w-[46ch] font-sans text-sm leading-relaxed text-forest/75">
              {signedIn
                ? 'Your reported issues and where each one is up to, the threads you have bookmarked, and your property on the record.'
                : 'The discussion boards, the requests you report and follow, and the committee ground reports are all for residents with an account.'}
            </p>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              {signedIn ? (
                <Button asChild className={focusWithinRing}>
                  <Link href="/account/profile" tabIndex={isLoaded ? undefined : -1} className={actionLink}>
                    <ActionIcon className="h-4 w-4 shrink-0" aria-hidden />
                    Go to my account
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild className={focusWithinRing}>
                    <Link href="/register" tabIndex={isLoaded ? undefined : -1} className={actionLink}>
                      <ActionIcon className="h-4 w-4 shrink-0" aria-hidden />
                      Create an account
                    </Link>
                  </Button>
                  <p className="text-sm text-forest/70">
                    Already a member?{' '}
                    {/* Forest text with a terracotta underline: terracotta text on bone measures
                        about 3.3:1, which does not reach AA at this size. */}
                    <Link
                      href="/login"
                      tabIndex={isLoaded ? undefined : -1}
                      className="font-medium text-forest underline decoration-terracotta decoration-2 underline-offset-4 transition-colors hover:decoration-terracotta-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2"
                    >
                      Log in
                    </Link>
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
