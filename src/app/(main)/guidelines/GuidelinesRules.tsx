'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

/**
 * Post-it "power pink", the iconic neon page-flag colour, kept slightly
 * translucent like the real flag's film so the bone page reads through it.
 */
const FLAG_FILL = 'rgba(237, 46, 142, 0.88)';

/**
 * A digital Post-it arrow flag. Faithful to the physical product: a translucent
 * neon tab with a notched arrow-tail in the margin and a pointed head aimed RIGHT,
 * at the rule it marks. No keyline, flush to the page. We keep the product's FORM
 * and one of its real flag colours; opacity (faint when offered, full when planted)
 * carries the two states rather than fill vs outline.
 */
function ArrowFlag() {
  return (
    <svg
      viewBox="0 0 100 34"
      className="h-[1.55rem] w-[3.35rem] shrink-0"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      {/* notched tail at left, pointed head at right */}
      <path d="M4 4 L80 4 L98 17 L80 30 L4 30 L18 17 Z" fill={FLAG_FILL} />
    </svg>
  );
}

/**
 * Marker state for the shareable Community Rules. A single terracotta arrow flag
 * is "planted" on at most one rule at a time (the One Voice Rule: terracotta stays
 * scarce). It is seeded from the URL hash on landing and moved on share; it
 * persists for the whole visit and clears only on navigate-away (unmount).
 */
type MarkerSource = 'hash' | 'share';

interface MarkerContextValue {
  activeId: string | null;
  source: MarkerSource;
  /** Plant the flag on a rule in response to a share click. */
  share: (id: string, label: string) => void;
}

const MarkerContext = createContext<MarkerContextValue | null>(null);

/**
 * Wraps the rule sections. Owns the single-active flag, the hash-landing logic,
 * and the one `aria-live` region that announces the marked rule to assistive tech.
 * Server-rendered section content is passed through as `children`; context still
 * flows to the client `RuleBullet`s nested inside.
 */
export function MarkerProvider({
  rules,
  children,
}: {
  rules: { id: string; text: string }[];
  children: React.ReactNode;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [source, setSource] = useState<MarkerSource>('hash');
  const [message, setMessage] = useState('');

  const labels = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of rules) map.set(r.id, r.text);
    return map;
  }, [rules]);

  // Land on a rule when the URL hash matches a known rule id. Section anchors
  // (single-segment ids like `#parking`) are not in the map, so they scroll
  // natively and plant nothing.
  useEffect(() => {
    const apply = () => {
      const hash = window.location.hash.slice(1);
      if (hash && labels.has(hash)) {
        setActiveId(hash);
        setSource('hash');
        setMessage(`Showing rule: ${labels.get(hash)}`);
      }
    };
    apply();
    window.addEventListener('hashchange', apply);
    return () => window.removeEventListener('hashchange', apply);
  }, [labels]);

  const share = useCallback((id: string, label: string) => {
    setActiveId(id);
    setSource('share');
    setMessage(`Showing rule: ${label}`);
  }, []);

  return (
    <MarkerContext.Provider value={{ activeId, source, share }}>
      {children}
      <div aria-live="polite" className="sr-only">
        {message}
      </div>
    </MarkerContext.Provider>
  );
}

interface RuleBulletProps {
  id: string;
  text: string;
  sub?: string[];
}

/**
 * One top-level rule. The arrow flag is the single affordance in two states: an
 * outline flag ("mark this") that reveals on hover/focus (desktop) or sits faint
 * at all times (touch), and a solid terracotta flag ("marked") that plants into
 * the left margin, aimed at the rule, on share or on landing. Sharing copies an
 * absolute anchored URL to the clipboard only; the address bar is left untouched.
 */
export function RuleBullet({ id, text, sub }: RuleBulletProps) {
  const marker = useContext(MarkerContext);
  const ref = useRef<HTMLLIElement>(null);
  const [copied, setCopied] = useState(false);

  const isActive = marker?.activeId === id;

  // On a hash landing, scroll the rule clear of the sticky chrome and move focus
  // to it. Share clicks plant the flag without stealing focus or scrolling.
  useEffect(() => {
    if (!isActive || marker?.source !== 'hash') return;
    ref.current?.scrollIntoView({ block: 'start' });
    ref.current?.focus({ preventScroll: true });
  }, [isActive, marker?.source]);

  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}/guidelines#${id}`;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      }
    } catch {
      // Insecure context or denied: fail silently, still plant the flag below.
    }
    marker?.share(id, text);
  }, [id, text, marker]);

  return (
    <li
      ref={ref}
      id={id}
      tabIndex={-1}
      className="group/rule relative flex scroll-mt-[calc(var(--chrome-offset,72px)+2rem)] items-start gap-3 pl-12 text-forest/85 focus:outline-none lg:pl-0"
    >
      <button
        type="button"
        onClick={handleShare}
        aria-label="Copy link to this rule"
        className={`absolute left-0 top-0 z-30 flex h-11 w-12 items-start justify-end pt-[1px] pr-2 transition-opacity duration-200 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/40 lg:left-auto lg:right-full lg:mr-2 lg:pr-0 ${
          isActive
            ? 'opacity-100 [filter:drop-shadow(0_5px_8px_rgba(26,34,24,0.20))]'
            : 'opacity-0 group-hover/rule:opacity-60 focus-visible:opacity-60 [@media(hover:none)]:opacity-40'
        } ${copied ? 'animate-optimistic-pulse' : ''}`}
      >
        <ArrowFlag />
        {copied ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-full z-40 mt-1 -translate-x-1/2 whitespace-nowrap rounded bg-forest px-2 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-bone"
          >
            Copied
          </span>
        ) : null}
      </button>

      <span className="mt-2.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-terracotta" />

      <span className="leading-relaxed">
        {/* Highlight wash. Bleeds ~3px each side via box-shadow (not padding +
            negative margin), so it adds ZERO layout width and can never push the
            line to wrap. box-decoration-clone keeps the wash intact if the rule
            itself wraps across lines. */}
        <span
          className={
            isActive
              ? 'box-decoration-clone rounded-[2px] bg-[rgba(237,46,142,0.16)] [box-shadow:-0.2rem_0_0_rgba(237,46,142,0.16),0.2rem_0_0_rgba(237,46,142,0.16)]'
              : undefined
          }
        >
          {text}
        </span>
        {sub ? (
          <ul className="mt-2 space-y-1.5 pl-1">
            {sub.map((item) => (
              <li key={item} className="flex items-start gap-2 text-forest/70">
                <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-forest/40" />
                {item}
              </li>
            ))}
          </ul>
        ) : null}
      </span>
    </li>
  );
}
