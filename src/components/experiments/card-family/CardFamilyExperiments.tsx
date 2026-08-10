'use client';

import { useState } from 'react';
import type { PostSummary } from '@/lib/blog/types';
import { cn } from '@/lib/utils';
import DuotoneFilter from '@/components/blog/DuotoneFilter';
import BlogCard from '@/components/ui/BlogCard';
import BlogPostCell from '@/components/blog/BlogPostCell';
import { CARD_FAMILY_OPTIONS } from './options';
import { SURFACE_LABEL, type Surface } from './kit';
import { HOME_POST, LISTING_POST, READNEXT_POST, TEXTLESS_POST } from './fixtures';

/**
 * Card family experiments.
 *
 * Three surfaces show the same kind of thing and were built three separate
 * times: the home page's `BlogCard`, the article page's "Read next" cell, and
 * the `/blog` listing row. They disagree on whether a card has a border, where
 * the date goes, whether a category or a reading time exists at all, and how
 * big a title is.
 *
 * Each option below fixes *one* element vocabulary and applies it to all three,
 * letting the layout differ where the geometry demands it. Every option shares
 * the plate, the title link, and the date helpers from `kit.tsx`; anything an
 * option has to reinvent is a signal that the family does not hold.
 *
 * Nothing here is wired to production. Winners get promoted into `BlogCard` and
 * `BlogPostCell` afterwards.
 */

type Casting = 'mixed' | 'long' | 'textless';

const CASTINGS: Array<{ id: Casting; label: string; note: string }> = [
  { id: 'mixed', label: 'Typical', note: 'Different post per surface, as the site would show them.' },
  { id: 'long', label: 'Long title', note: 'One post everywhere: a title that wraps to three lines.' },
  { id: 'textless', label: 'No image', note: 'The post with no hero. The only cell that runs as text.' },
];

function castFor(casting: Casting, surface: Surface): PostSummary {
  if (casting === 'long') return LISTING_POST;
  if (casting === 'textless') return TEXTLESS_POST;
  return surface === 'home' ? HOME_POST : surface === 'readnext' ? READNEXT_POST : LISTING_POST;
}

/**
 * Each surface rendered on the ground it actually sits on in production: bone
 * graph paper for the home section and the listing, sage-light for the
 * "Read next" band. Half the perceived drift between these cards is the ground
 * behind them, so comparing them on a neutral panel would hide it.
 */
function SurfaceGround({
  surface,
  children,
}: {
  surface: Surface;
  children: React.ReactNode;
}) {
  const onSage = surface === 'readnext';

  return (
    <div className="min-w-0">
      <p className="mb-2 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-forest/70">
        {SURFACE_LABEL[surface]}
      </p>
      <div
        className={cn(
          'relative isolate overflow-hidden rounded-lg p-4',
          onSage ? 'bg-sage-light' : 'bg-bone'
        )}
      >
        {!onSage && (
          <div
            className="texture-grid-page pointer-events-none absolute inset-0 -z-10 opacity-50"
            aria-hidden="true"
          />
        )}
        {children}
      </div>
    </div>
  );
}

/** The three columns of one option, on their real grounds. */
function OptionRow({
  casting,
  render,
}: {
  casting: Casting;
  render: (post: PostSummary, surface: Surface) => React.ReactNode;
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,340px)_minmax(0,300px)_minmax(0,1fr)]">
      {(['home', 'readnext', 'listing'] as const).map((surface) => (
        <SurfaceGround key={surface} surface={surface}>
          {render(castFor(casting, surface), surface)}
        </SurfaceGround>
      ))}
    </div>
  );
}

function SectionHeading({
  number,
  name,
  hypothesis,
  stretch,
  shipped,
}: {
  number: string;
  name: string;
  hypothesis: string;
  stretch?: string;
  shipped?: boolean;
}) {
  return (
    <div className="mb-4 max-w-[68ch]">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-mono text-[0.75rem] tabular-nums text-forest/70">{number}</span>
        <h3 className="font-display text-[1.375rem] leading-tight text-forest">{name}</h3>
        {shipped && (
          <span className="rounded bg-forest px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-bone">
            Shipped
          </span>
        )}
        {stretch && (
          <span className="rounded bg-amber/20 px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-amber-dark">
            Stretch
          </span>
        )}
      </div>
      <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-forest/70">{hypothesis}</p>
      {stretch && <p className="mt-1 text-[0.75rem] leading-relaxed text-amber-dark">{stretch}</p>}
    </div>
  );
}

export default function CardFamilyExperiments() {
  const [casting, setCasting] = useState<Casting>('mixed');
  const activeNote = CASTINGS.find((c) => c.id === casting)?.note ?? '';

  return (
    <div className="space-y-10">
      {/* The plates reference this filter by id. */}
      <DuotoneFilter />

      <div className="rounded-card border border-sage/20 bg-white p-6">
        <h2 className="font-display text-2xl text-forest">Card Family</h2>
        <p className="mt-3 max-w-[70ch] text-sm leading-relaxed text-forest/70">
          Ten ways to give the home card, the &ldquo;Read next&rdquo; card, and the{' '}
          <code className="font-mono text-[0.8125rem]">/blog</code> listing row one set of parts.
          Layout still differs where the geometry demands it; what should not differ is what an
          element means, how big it is, and how far it has faded.
        </p>

        <dl className="mt-5 grid gap-x-8 gap-y-2 border-t border-bone-edge pt-4 text-[0.8125rem] sm:grid-cols-2">
          <div className="flex gap-3">
            <dt className="w-24 shrink-0 font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-forest/70">
              Shared
            </dt>
            <dd className="text-forest/70">
              Duotone plate, title link, date helpers. One implementation in{' '}
              <code className="font-mono text-[0.75rem]">kit.tsx</code>.
            </dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-24 shrink-0 font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-forest/70">
              Per option
            </dt>
            <dd className="text-forest/70">
              Arrangement, scale, tone, and which containers exist.
            </dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-24 shrink-0 font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-forest/70">
              Ground
            </dt>
            <dd className="text-forest/70">
              Each column sits on the surface it does in production: bone graph paper, or the
              sage-light band under &ldquo;Read next&rdquo;.
            </dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-24 shrink-0 font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-forest/70">
              Changed
            </dt>
            <dd className="text-forest/70">
              Read next gains an excerpt and the home card gains a category and a reading time, so
              all three carry the same fields.
            </dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-24 shrink-0 font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-forest/70">
              Tone floor
            </dt>
            <dd className="text-forest/70">
              Recessive text is held at <code className="font-mono text-[0.75rem]">forest/70</code>,
              or <code className="font-mono text-[0.75rem]">forest/80</code> on a sage band. Lighter
              greys read better and fail WCAG AA at label size.
            </dd>
          </div>
        </dl>
      </div>

      {/* Casting control. Applies to every option at once, so a wrap or a
          missing image can be checked across all ten without scrolling twice. */}
      <div className="sticky top-20 z-20 rounded-card border border-sage/30 bg-bone-light/95 p-4 backdrop-blur-[6px] md:top-24">
        <fieldset>
          <legend className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-forest/70">
            Content cast
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {CASTINGS.map((option) => {
              const isActive = option.id === casting;
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setCasting(option.id)}
                  className={cn(
                    'min-h-[44px] rounded border px-4 text-sm font-medium transition-colors duration-200',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2',
                    isActive
                      ? 'border-forest bg-forest text-bone'
                      : 'border-sage/40 bg-white text-forest hover:border-sage'
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-[0.75rem] text-forest/70">{activeNote}</p>
        </fieldset>
      </div>

      {/*
       * The live components. This row used to be the baseline the options were
       * argued against: three separate implementations, no border on the home
       * card, the date in three different places, three different title sizes.
       * 13 Red Eyebrow won and was promoted into `BlogPostCell`, so the row now
       * renders what the site actually ships and reads as the control rather
       * than as the problem.
       */}
      <section>
        <SectionHeading
          number="00"
          name="Live components"
          hypothesis="What the site renders today: BlogPostCell in its home, tail and index variants. 13 Red Eyebrow shipped, so this row and that one should match."
        />
        <OptionRow
          casting={casting}
          render={(post, surface) =>
            surface === 'home' ? (
              <BlogCard post={post} />
            ) : (
              <BlogPostCell post={post} variant={surface === 'readnext' ? 'tail' : 'index'} />
            )
          }
        />
      </section>

      {CARD_FAMILY_OPTIONS.map(
        ({ id, number, name, hypothesis, stretch, shipped, groupLabel, groupNote, Component }) => (
          <section key={id}>
            {groupLabel && (
              <div className="mb-8 border-t border-sage/30 pt-6">
                <h3 className="font-display text-[1.5rem] leading-tight text-forest">{groupLabel}</h3>
                {groupNote && (
                  <p className="mt-2 max-w-[70ch] text-[0.8125rem] leading-relaxed text-forest/70">
                    {groupNote}
                  </p>
                )}
              </div>
            )}
            <SectionHeading
              number={number}
              name={name}
              hypothesis={hypothesis}
              stretch={stretch}
              shipped={shipped}
            />
            <OptionRow
              casting={casting}
              render={(post, surface) => <Component post={post} surface={surface} />}
            />
          </section>
        )
      )}
    </div>
  );
}
