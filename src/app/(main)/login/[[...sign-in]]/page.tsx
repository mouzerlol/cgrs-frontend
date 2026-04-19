'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import PageHeader from '@/components/sections/PageHeader';
import Card from '@/components/ui/Card';
import { SignIn } from '@clerk/nextjs';
import { clerkAppearance } from '@/lib/clerk-appearance';

/**
 * Resident sign-in page. Uses Clerk's SignIn component.
 * Supports redirect_url query param to return to the originally requested page after sign-in.
 * NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login so "Resident Login" buttons send users here.
 */
export default function LoginPage() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect_url') ?? '/';

  return (
    <div className="min-h-screen relative flex flex-col">
      <PageHeader
        title="Resident Login"
        description="Access your resident account to manage your account, view statements, and update your details."
        eyebrow="Resident Portal"
        eyebrowIconKey="building2"
        backgroundImage="/images/mangere-mountain.jpg"
      />

      <section className="section flex-grow flex flex-col items-center justify-center relative z-10 -mt-12">
        <div className="container">
          <div className="max-w-md mx-auto flex flex-col items-center w-full">
            {/* Custom Card Wrapper to perfectly match CGRS Design System map menu */}
            <div className="w-full bg-sage-light rounded-[24px] shadow-[0_20px_60px_rgba(26,34,24,0.1)] border border-sage/30 p-6 sm:p-10 relative overflow-hidden">
              {/* Decorative grain overlay inside the card */}
              <div className="absolute inset-0 pointer-events-none texture-grain opacity-50 mix-blend-multiply"></div>

              <div className="relative z-10">
                <SignIn
                  routing="path"
                  fallbackRedirectUrl={redirectUrl}
                  signUpUrl="/register"
                  appearance={{
                    ...clerkAppearance,
                    elements: {
                      ...clerkAppearance.elements,
                      rootBox: 'w-full',
                      cardBox: 'w-full shadow-none',
                      card: 'shadow-none w-full bg-transparent p-0 border-none m-0',
                    },
                  }}
                />
              </div>
            </div>

            <p className="mt-8 text-center text-sm text-forest/70 font-medium">
              Need help? <Link href="/contact?subject=login-help" className="text-terracotta hover:text-terracotta/80 underline underline-offset-4 transition-colors">Contact support</Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
