import { NEIGHBOURHOOD_CLOSING_TIMES } from '@/data/neighbourhood-closing-times';

/**
 * Renders the "Things that close overnight in Mangere Bridge" list. The CGRS
 * entry is the last row by convention; it gets a subtle terracotta-tinted
 * background so visitors notice they are reading about themselves without us
 * making the list feel like an ad.
 */
export default function ClosingTimesList() {
  return (
    <section aria-labelledby="closing-times-heading" className="border-t border-sage/30 pt-xl">
      <p
        id="closing-times-heading"
        className="text-xs font-body font-semibold uppercase tracking-[0.15em] text-terracotta mb-md"
      >
        Things that close overnight in Mangere Bridge
      </p>

      <ul className="font-body">
        {NEIGHBOURHOOD_CLOSING_TIMES.map((item) => (
          <li
            key={item.name}
            className={[
              'flex items-baseline justify-between gap-md py-3 border-b border-sage/20 last:border-b-0',
              item.isOurs ? 'bg-terracotta/[0.04] -mx-md px-md rounded' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <span className="text-forest text-base">{item.name}</span>
            <span className="font-mono text-sm text-forest/70 whitespace-nowrap">{item.hours}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
