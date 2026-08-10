import PageHeader from '@/components/sections/PageHeader';
import { SiteBreadcrumbs } from '@/components/ui/breadcrumb';

/**
 * The one degraded state the reading path can reach: nothing has ever been
 * fetched and the content origin is unreachable.
 *
 * A transient failure never gets here — a failed refetch keeps serving the last
 * good manifest, because a blip on a public page is not worth an outage. This is
 * a cold cache and a down origin at the same time, which is rare enough to be
 * worth stating plainly rather than dressing up as an empty archive.
 *
 * Contained to blog surfaces by construction: it is a component this route
 * renders, not an error thrown up to the layout, so every other page is
 * unaffected.
 */
export default function BlogUnavailable() {
  return (
    <div className="relative isolate">
      <PageHeader
        title="Committee Blog"
        description="Updates, reminders, and notices from the people running the society."
        eyebrow="Updates"
        eyebrowIconKey="newspaper"
        variant="compact"
        backgroundImage="/images/mangere-mountain.jpg"
        showBreadcrumbs={false}
      />

      <SiteBreadcrumbs variant="belowHero" />

      <div className="container pb-14 pt-4 md:pb-20 md:pt-6">
        <div className="rounded-card border border-sage/40 bg-white/60 px-5 py-16 md:py-24">
          <p className="font-display text-heading-md text-forest">
            The blog is temporarily unavailable.
          </p>
          <p className="mt-3 max-w-[52ch] text-forest/70">
            Posts could not be loaded just now. Nothing has been lost — this is a problem
            reaching them, not with the posts themselves. Try again in a few minutes.
          </p>
        </div>
      </div>
    </div>
  );
}
