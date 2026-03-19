'use client';

import Link from 'next/link';
import PageHeader from '@/components/sections/PageHeader';
import Card from '@/components/ui/Card';
import { SignUp } from '@clerk/nextjs';
import { clerkAppearance } from '@/lib/clerk-appearance';

/**
 * Resident sign-up page. Uses Clerk's SignUp component; redirects to / after sign-up.
 * NEXT_PUBLIC_CLERK_SIGN_UP_URL=/register so users coming from SignIn go here.
 */
export default function RegisterPage() {
  return (
    <div className="min-h-screen relative flex flex-col">
      <PageHeader
        title="Create Account"
        description="Create a new resident account to access community resources and stay connected with your neighbors."
        eyebrow="Resident Portal"
        backgroundImage="/images/mangere-mountain.jpg"
      />

      <section className="section flex-grow flex flex-col items-center justify-center relative z-10 -mt-12">
        <div className="container">
          <div className="max-w-md mx-auto flex flex-col items-center w-full">
            <div className="w-full bg-sage-light rounded-[24px] shadow-[0_20px_60px_rgba(26,34,24,0.1)] border border-sage/30 p-6 sm:p-10 relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none texture-grain opacity-50 mix-blend-multiply"></div>
              
              <div className="relative z-10">
                <SignUp
                  fallbackRedirectUrl="/"
                  signInUrl="/login"
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
              Need help? <Link href="/contact?subject=registration-help" className="text-terracotta hover:text-terracotta/80 underline underline-offset-4 transition-colors">Contact support</Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
