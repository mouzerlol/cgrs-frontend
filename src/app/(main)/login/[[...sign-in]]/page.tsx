'use client';

import Link from 'next/link';
import PageHeader from '@/components/sections/PageHeader';
import Card from '@/components/ui/Card';
import { SignIn } from '@clerk/nextjs';
import { clerkAppearance } from '@/lib/clerk-appearance';

/**
 * Resident sign-in page. Uses Clerk's SignIn component; redirects to / after sign-in.
 * NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login so "Resident Login" buttons send users here.
 */
export default function LoginPage() {
  return (
    <div className="min-h-screen">
      <PageHeader
        title="Resident Login"
        description="Access your resident account to manage your account, view statements, and update your details."
        eyebrow="Resident Portal"
        backgroundImage="/images/mangere-mountain.jpg"
      />

      <section className="section">
        <div className="container">
          <div className="max-w-md mx-auto py-12 flex flex-col items-center">
            <Card className="p-8 w-full">
              <SignIn
                fallbackRedirectUrl="/"
                signUpUrl="/register"
                appearance={{
                  ...clerkAppearance,
                  elements: {
                    rootBox: 'w-full',
                    card: 'shadow-none w-full',
                  },
                }}
              />
            </Card>
            <p className="mt-6 text-center text-sm text-forest/70">
              Need help? <Link href="/contact?subject=login-help" className="underline hover:text-forest">Contact support</Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
