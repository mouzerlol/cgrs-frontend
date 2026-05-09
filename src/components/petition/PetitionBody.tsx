import { Icon } from '@iconify/react';
import { SectionLabel } from '@/components/ui/SectionLabel';

type Concern = {
  title: string;
  body: string;
};

type ConcernGroup = {
  label: string;
  icon: string;
  items: Concern[];
};

const concernGroups: ConcernGroup[] = [
  {
    label: 'Governance, transparency, accountability',
    icon: 'lucide:scale',
    items: [
      {
        title: 'Governance and conflict of interest',
        body: 'The management contract was not put to a proper committee vote when it was originally established. The Committee has also identified a structural conflict of interest: the society manager has not advocated on behalf of residents in matters where the original developer bears responsibility, including undelivered facilities and unresolved liability for defective construction work.',
      },
      {
        title: 'Transparency and value for money',
        body: 'Decisions including levy increases have been made without adequate resident consultation or clear documentation. Despite rising costs, there has been no corresponding improvement in the quality or accountability of management.',
      },
      {
        title: 'Responsiveness',
        body: 'Requests for repairs and maintenance are routinely ignored or unreasonably delayed.',
      },
    ],
  },
  {
    label: 'Maintenance and shared spaces',
    icon: 'lucide:wrench',
    items: [
      {
        title: 'Common-area maintenance',
        body: 'Rubbish areas are poorly maintained, illegal dumping goes unaddressed, and health and safety standards are not being upheld.',
      },
      {
        title: 'Parking',
        body: 'Persistent parking problems have gone without effective or lasting resolution.',
      },
      {
        title: 'Vandalism and unsupervised activity',
        body: 'Incidents of vandalism in common areas have gone unaddressed, and children and animals are frequently left unsupervised in shared spaces, creating ongoing safety risks and diminishing the quality of life for all residents.',
      },
    ],
  },
  {
    label: 'Community standards',
    icon: 'lucide:users',
    items: [
      {
        title: 'Tenant vetting and relationship management',
        body: 'There has been no evidence of responsibility taken for managing the relationship between property owners, tenants, and the Society, including ensuring tenants are appropriately vetted and that community standards are upheld.',
      },
      {
        title: 'Stray cat population',
        body: 'A growing stray cat population continues to affect hygiene and quality of life, with no meaningful action taken.',
      },
    ],
  },
];

export default function PetitionBody() {
  return (
    <article className="font-body text-forest mb-10 space-y-14 md:space-y-20">
      <section>
        <h2 className="font-display text-xl font-semibold mb-3">Why this petition matters</h2>
        <p className="text-base leading-relaxed">
          The Coronation Gardens Residents Society Committee is seeking to replace Oaks Property as
          our society manager. Despite repeated requests from residents, critical issues have
          remained unresolved. Even after Oaks Property acknowledged past performance failures and
          assigned a new manager to our society, there has been little meaningful change in
          performance, accountability, or enforcement.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold mb-3">What this petition does (and doesn&rsquo;t do)</h2>
        <div className="space-y-3 text-base leading-relaxed">
          <p>
            <span className="font-semibold text-forest">It does</span> give the Committee a clear
            mandate from residents to begin selecting and appointing a new society manager.
          </p>
          <p>
            <span className="font-semibold text-forest">It doesn&rsquo;t</span> commit you, the
            Society, or the Committee to a specific replacement provider. The Committee will
            evaluate alternatives openly and report back before any contract is signed.
          </p>
        </div>
      </section>

      <section className="bg-sage-light rounded-xl border border-sage/30 p-6 md:p-8">
        <h2 className="font-display text-xl font-semibold mb-3">By signing, you are</h2>
        <ul className="space-y-2 text-base leading-relaxed list-disc pl-5 marker:text-terracotta">
          <li>
            Giving the Committee your mandate to pursue a change of society manager on behalf of
            the community.
          </li>
          <li>
            Adding your voice to a collective call for improved maintenance, communication, and
            accountability.
          </li>
          <li>
            Helping ensure any new society manager is chosen with the full backing of the
            community.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold mb-6">The Committee&rsquo;s concerns</h2>
        <div className="space-y-12 md:space-y-16">
          {concernGroups.map((group) => (
            <div key={group.label}>
              <div className="flex items-center gap-2 mb-4">
                <Icon
                  icon={group.icon}
                  className="w-3.5 h-3.5 text-terracotta shrink-0"
                  aria-hidden="true"
                />
                <SectionLabel as="h3">{group.label}</SectionLabel>
              </div>
              <div className="space-y-5">
                {group.items.map((item) => (
                  <p key={item.title} className="text-base leading-relaxed text-forest">
                    <span className="font-bold text-forest">{item.title}.</span>{' '}
                    <span className="text-forest/85">{item.body}</span>
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold mb-3">Our goal</h2>
        <p className="text-base leading-relaxed">
          The Committee has been exploring alternative society management companies and is
          encouraged by what is available to our community: providers who will prioritise
          transparency, responsiveness, enforcement, and the genuine wellbeing of Coronation
          Gardens.
        </p>
        <p className="text-base leading-relaxed mt-3">
          Our goal is{' '}
          <span className="font-semibold text-forest">125 signatures</span>: an undeniable majority
          mandate from Coronation Gardens households. Reaching it gives the Committee a clear
          basis to act on residents&rsquo; behalf.
        </p>
      </section>
    </article>
  );
}
