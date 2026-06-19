import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Trees,
  Car,
  Volume2,
  Home,
  PawPrint,
  Mail,
  AlertTriangle,
  Coins,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';
import PageHeader from '@/components/sections/PageHeader';
import GuidelinesSideNav, { type SideNavItem } from './GuidelinesSideNav';

export const metadata: Metadata = {
  title: 'Community Rules | Coronation Gardens',
  description:
    "The Coronation Gardens Residents' Society rules — communal facilities, parking, behaviour, property upkeep, and pets — for owners, tenants, and visitors.",
};

type Rule = string | { text: string; sub: string[] };

interface Callout {
  tone: 'warning' | 'info';
  icon: LucideIcon;
  title: string;
  body: string;
}

interface Section {
  id: string;
  navLabel: string;
  eyebrow: string;
  title: string;
  icon: LucideIcon;
  intro?: string;
  rules: Rule[];
  callout?: Callout;
}

const SECTIONS: Section[] = [
  {
    id: 'communal',
    navLabel: 'Communal',
    eyebrow: 'Shared spaces',
    title: 'Communal Facilities',
    icon: Trees,
    intro:
      'Our communal facilities are the roads, playground, car parks, bin areas, bike storage, and any other green or open space within the development.',
    rules: [
      'Only use these for the purpose for which they are designed.',
      'Respect our facilities and use them appropriately.',
      'There is to be no dumping of any item anywhere, and no rubbish, unwanted, or broken items left in the bin areas.',
      'Rubbish, recycling, and food scraps are to be separated and put into the correct bin.',
      'Do not prevent others from enjoying the communal areas.',
      'Do not place anything in the communal facilities without the approval of the Committee.',
      'Do not drop litter anywhere in the development.',
      'Children must be supervised at all times.',
      'Do not vandalise or destroy any communal property.',
    ],
  },
  {
    id: 'parking',
    navLabel: 'Parking',
    eyebrow: 'Where to park',
    title: 'Parking',
    icon: Car,
    intro:
      'To increase safety and visibility and to reduce wear and tear on our communal facilities, do not park in any of these places:',
    rules: [
      'On footpaths',
      'On grass berms',
      'On grassed areas',
      'In the playground or in front of the playground',
      'In designated No Parking places',
      'In private car parks',
    ],
    callout: {
      tone: 'warning',
      icon: AlertTriangle,
      title: 'Vehicles in violation may be towed',
      body: 'Any vehicle found in violation of these parking directions may be ticketed or removed (towed) without warning, at any time, by a towing company authorised by CGRS. The owner or user of the vehicle is solely responsible for paying the towing company’s removal and storage costs.',
    },
  },
  {
    id: 'behaviour',
    navLabel: 'Behaviour',
    eyebrow: 'How we live',
    title: 'Behaviour & Use',
    icon: Volume2,
    rules: [
      'Do not annoy or disturb other residents’ quiet enjoyment. This includes loud music, party noise, vehicles, or unsupervised children.',
      'No burning of any material or substance within CGRS (this does not include BBQs).',
      'Do not do anything that could create a fire hazard or contravene Fire Regulations.',
      'No liquor is to be consumed in shared spaces, and laws about consuming liquor in public spaces are to be followed.',
      'Rubbish is to be disposed of in the correct areas.',
      'No fireworks are to be lit or discharged within the CGRS development.',
    ],
  },
  {
    id: 'property',
    navLabel: 'Property',
    eyebrow: 'Your property',
    title: 'General Rules',
    icon: Home,
    intro: 'General rules about property management, safety, and maintenance.',
    rules: [
      'Properties must be well maintained and in an attractive condition.',
      'Do not let rubbish or materials accumulate within your property.',
      'All grass is to be cut regularly.',
      'Gardens are to be watered and fertilised, trees pruned, and weeds and rubbish removed.',
      'Fences, buildings, and driveways are to be well maintained.',
      'No property is to be used for any purpose other than what is permitted under current local planning requirements.',
      'No signs are to be erected within CGRS. The only exception is a For Sale sign if your property is on the market.',
      'Ensure your home is secure at all times, especially if your property is empty.',
      'No washing lines or laundry drying racks are to be placed in the front yard of your property.',
      'All roofs, gutters, and eaves that overhang between neighbouring properties are to be maintained, repaired, kept clear of debris or blockage, and kept clean.',
      'All conditions listed in the group Insurance policy are strictly adhered to.',
    ],
    callout: {
      tone: 'info',
      icon: Coins,
      title: 'Pay what you owe on time',
      body: 'Rates, insurance, Residents’ Society levies, and any other costs owed to CGRS are to be paid on time.',
    },
  },
  {
    id: 'pets',
    navLabel: 'Pets',
    eyebrow: 'Pets & animals',
    title: 'Pets & Animals',
    icon: PawPrint,
    rules: [
      'No animal, bird, or pet is to cause a nuisance to any other member.',
      'The number and size of pets must be reasonable given the size of your property and the high-density urban environment within CGRS.',
      'When outside your property, all pets must be under control and supervised.',
      'All dogs are to be on a leash.',
      'All pet droppings are to be picked up immediately and disposed of into the correct bin.',
      'No pet shall make any noise that disturbs others or causes a nuisance.',
      'All pets are maintained in a healthy and clean condition.',
      {
        text: 'All laws and regulations related to keeping pets are complied with:',
        sub: ['Desexing', 'Registration', 'Pet Register to be completed'],
      },
      'No dangerous pets are kept within your property.',
      'Each owner is responsible for the cost of repairing any damage caused by their pets, or their tenants’ pets.',
      'No property is to be infested by vermin or insects.',
    ],
  },
];

const CONTACTS = [
  {
    label: 'CGRS Property Manager',
    desc: 'Oaks Property — day-to-day management of the development.',
    email: 'bc@oaksproperty.co.nz',
  },
  {
    label: 'CGRS Committee',
    desc: 'The residents’ committee, for questions about the rules and the society.',
    email: 'cgrscommittee@gmail.com',
  },
];

const NAV_ITEMS: SideNavItem[] = [
  ...SECTIONS.map((s, i) => ({
    id: s.id,
    label: s.navLabel,
    num: String(i + 1).padStart(2, '0'),
  })),
  { id: 'contact', label: 'Contact' },
];

/**
 * Section heading — "Refined Current" (variant 08 from /design-experiments):
 * the icon-box + title pattern, tightened with a terracotta eyebrow over the
 * title and a hairline rule underneath.
 */
function SectionHeading({
  eyebrow,
  title,
  icon: Icon,
}: {
  eyebrow: string;
  title: string;
  icon: LucideIcon;
}) {
  return (
    <div className="border-b border-sage/30 pb-4">
      <div className="flex items-center gap-3.5">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-forest/[0.07] text-forest">
          <Icon className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
        </span>
        <div>
          <span className="block text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-terracotta">
            {eyebrow}
          </span>
          <h2 className="font-display text-2xl leading-tight text-forest">{title}</h2>
        </div>
      </div>
    </div>
  );
}

/** Lead paragraph that sits below a section heading's divider (not in the heading block). */
function SectionIntro({ children }: { children: React.ReactNode }) {
  return <p className="mt-5 text-[1.0625rem] leading-relaxed text-forest/75">{children}</p>;
}

function RuleBullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-forest/85">
      <span className="mt-2.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-terracotta" />
      <span className="leading-relaxed">{children}</span>
    </li>
  );
}

/**
 * Community Rules page — a faithful, scannable presentation of the CGRS
 * ruleset (the committee's "CGRS Rules" document). Desktop reads as an
 * asymmetric two-column long-read: a floating scrollspy index on the left,
 * numbered anchored sections on the right, enforcement clauses raised as
 * bordered callouts. Below `lg` the index drops away and the rules read as a
 * single column. This is the single authoritative rules surface (replaces /rules).
 */
export default function GuidelinesPage() {
  return (
    <div className="min-h-screen">
      <PageHeader
        title="Community Rules"
        description="The shared agreements that keep Coronation Gardens safe and welcoming for everyone who lives, owns, or visits here."
        eyebrow="Residents' Society"
        eyebrowIconKey="scale"
        backgroundImage="/images/mangere-mountain.jpg"
      />

      {/* Full-width alternating bands. The sticky index is rendered once as an overlay
          (below) so it floats over the left gutter across every band. */}
      <div className="relative bg-bone">
        {SECTIONS.map((section, index) => (
          <section
            key={section.id}
            id={section.id}
            className={`scroll-mt-[calc(var(--chrome-offset,72px)+2rem)] py-12 sm:py-14 ${
              index % 2 === 0 ? 'bg-bone-light' : 'bg-sage-light'
            }`}
          >
            <div className="container">
              <div className="lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-x-16 xl:gap-x-24">
                <div aria-hidden="true" className="hidden lg:block" />
                <div className="min-w-0">
                  <SectionHeading
                    eyebrow={section.eyebrow}
                    title={section.title}
                    icon={section.icon}
                  />

                  {section.intro ? <SectionIntro>{section.intro}</SectionIntro> : null}

                  <ul className="mt-6 space-y-3">
                    {section.rules.map((rule, i) =>
                      typeof rule === 'string' ? (
                        <RuleBullet key={i}>{rule}</RuleBullet>
                      ) : (
                        <RuleBullet key={i}>
                          {rule.text}
                          <ul className="mt-2 space-y-1.5 pl-1">
                            {rule.sub.map((item) => (
                              <li key={item} className="flex items-start gap-2 text-forest/70">
                                <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-forest/40" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </RuleBullet>
                      )
                    )}
                  </ul>

                  {section.callout && (
                    <aside
                      className={`mt-7 rounded-xl border p-5 ${
                        section.callout.tone === 'warning'
                          ? 'border-terracotta/30 bg-terracotta/10'
                          : 'border-sage/40 bg-bone-light'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <span
                          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${
                            section.callout.tone === 'warning'
                              ? 'bg-terracotta text-bone'
                              : 'bg-forest text-bone'
                          }`}
                        >
                          <section.callout.icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <div>
                          <p className="font-display text-lg font-semibold text-forest">
                            {section.callout.title}
                          </p>
                          <p className="mt-1.5 leading-relaxed text-forest/75">
                            {section.callout.body}
                          </p>
                        </div>
                      </div>
                    </aside>
                  )}
                </div>
              </div>
            </div>
          </section>
        ))}

        {/* Contact — continues the alternation (index 5 → sage-light). */}
        <section
          id="contact"
          className="scroll-mt-[calc(var(--chrome-offset,72px)+2rem)] bg-sage-light py-12 sm:py-14"
        >
          <div className="container">
            <div className="lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-x-16 xl:gap-x-24">
              <div aria-hidden="true" className="hidden lg:block" />
              <div className="min-w-0 max-w-[68ch]">
                <SectionHeading eyebrow="Need help?" title="Contact us" icon={Mail} />

                <SectionIntro>Reach the people who keep the development running.</SectionIntro>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {CONTACTS.map((c) => (
                    <div key={c.email} className="rounded-2xl border border-sage/25 bg-white p-6">
                      <h3 className="font-display text-lg font-medium text-forest">{c.label}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-forest/75">{c.desc}</p>
                      <a
                        href={`mailto:${c.email}`}
                        className="group mt-4 inline-flex items-center gap-1.5 rounded-sm text-sm font-semibold text-terracotta transition-colors hover:text-terracotta-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                      >
                        {c.email}
                        <ArrowRight
                          className="h-4 w-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
                          aria-hidden="true"
                        />
                      </a>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex flex-col items-start gap-4 rounded-2xl bg-bone-light p-6 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-forest/75">
                    Have a question about what’s allowed? A committee member is happy to help.
                  </p>
                  <Link
                    href="/contact"
                    className="inline-flex flex-shrink-0 items-center gap-2 rounded-full bg-terracotta px-5 py-3 font-medium text-bone transition-colors hover:bg-terracotta-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 focus-visible:ring-offset-bone-light"
                  >
                    Get in touch
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sticky scrollspy index — overlaid once across all bands so it floats in the
            left gutter without being clipped to any single band. */}
        <div className="pointer-events-none absolute inset-0 hidden lg:block">
          <div className="container h-full">
            <div className="grid h-full grid-cols-[14rem_minmax(0,1fr)] gap-x-16 xl:gap-x-24">
              <div className="pointer-events-auto h-full">
                <GuidelinesSideNav items={NAV_ITEMS} />
              </div>
              <div />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
