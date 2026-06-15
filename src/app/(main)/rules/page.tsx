import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import PageHeader from '@/components/sections/PageHeader';

/**
 * Placeholder for the community rules. Linked from the My Property page; the
 * full ruleset is being finalised by the committee, so this page sets
 * expectations rather than presenting the rules themselves.
 */
export default function RulesPage() {
  return (
    <div className="min-h-screen">
      <PageHeader
        title="Community Rules"
        description="The shared agreements that keep Coronation Gardens safe and happy for everyone who lives, owns, or visits here."
        eyebrow="Residents' Society"
        eyebrowIconKey="scale"
        backgroundImage="/images/mangere-mountain.jpg"
      />

      <section className="section bg-bone">
        <div className="container max-w-2xl">
          <div className="bg-white p-8 shadow-[0_8px_32px_rgba(26,34,24,0.08)] sm:p-10">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-forest/45">
              Coming soon
            </p>
            <h2 className="mt-3 font-display text-2xl text-forest sm:text-3xl">
              We&apos;re writing these down properly.
            </h2>
            <div className="mt-5 space-y-4 text-forest/75">
              <p className="max-w-[65ch]">
                Every property in Coronation Gardens is part of the residents&apos; society, and the
                society runs on a small set of shared rules: how we look after shared spaces, how we
                handle noise and parking, and how decisions get made when they affect everyone.
              </p>
              <p className="max-w-[65ch]">
                The committee is finalising the full ruleset for publication here. Until then, if you
                have a question about what&apos;s allowed, reach out and a committee member will help.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 bg-terracotta px-5 py-3 font-medium text-bone transition-colors hover:bg-terracotta-dark"
              >
                Meet the committee
              </Link>
              <Link
                href="/account/my-property"
                className="group inline-flex items-center gap-1.5 text-sm font-semibold text-forest transition-colors hover:text-terracotta"
              >
                <ArrowLeft
                  className="h-4 w-4 transition-transform group-hover:-translate-x-0.5 motion-reduce:transition-none"
                  aria-hidden="true"
                />
                Back to my property
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
