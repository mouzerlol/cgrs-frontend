'use client';

import { useEffect, useState } from 'react';

export interface SideNavItem {
  id: string;
  label: string;
  /** Two-digit index for rule sections; omitted for the trailing contact link. */
  num?: string;
}

/**
 * Desktop-only floating index for the Community Rules long-read. A sticky vertical
 * rail that scrollspies the anchored sections via IntersectionObserver and raises
 * the active entry. Hidden below `lg` — mobile reads as a single uninterrupted column.
 */
export default function GuidelinesSideNav({ items }: { items: SideNavItem[] }) {
  const [active, setActive] = useState(items[0]?.id ?? '');

  useEffect(() => {
    const targets = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) setActive(visible[0].target.id);
      },
      // Offset the top edge past the fixed site chrome; trip the active state
      // when a section reaches the upper third of the viewport.
      { rootMargin: '-96px 0px -55% 0px', threshold: 0 }
    );

    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav
      aria-label="Rule sections"
      className="hidden h-full lg:block"
    >
      <div className="sticky top-[calc(var(--chrome-offset,72px)+2rem)] pt-12 sm:pt-14">
        <p className="text-eyebrow mb-4">On this page</p>
        <ul className="space-y-0.5">
          {items.map((item) => {
            const isActive = active === item.id;
            return (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  aria-current={isActive ? 'true' : undefined}
                  className={`group flex items-baseline gap-3 rounded-lg px-3 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 ${
                    isActive
                      ? 'bg-terracotta/10 text-terracotta'
                      : 'text-forest/55 hover:bg-sage-light hover:text-forest'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`font-display text-xs tabular-nums transition-colors ${
                      isActive ? 'text-terracotta' : 'text-forest/35 group-hover:text-forest/60'
                    }`}
                  >
                    {item.num ?? '·'}
                  </span>
                  <span className="text-sm font-medium leading-snug">{item.label}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
