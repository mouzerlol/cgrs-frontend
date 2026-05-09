'use client';

import { cn } from '@/lib/utils';
import Card from '@/components/ui/Card';

const SIGS = 89;
const GOAL = 125;

function fmt(n: number) {
  return n.toLocaleString();
}

function clampPct(n: number, g: number) {
  return Math.min(100, Math.round((n / g) * 100));
}

// ── 1. Minimal Lines ──────────────────────────────────────────────────────────
// Ultra-sparse. A single hairline bar, numbers only. Bone bg, no radius.
function V1MinimalLines() {
  const p = clampPct(SIGS, GOAL);
  return (
    <div className="bg-bone border border-forest/10 p-6">
      <div className="flex items-baseline justify-between mb-5">
        <span className="font-display text-5xl text-forest font-semibold tracking-tight">{fmt(SIGS)}</span>
        <span className="text-xs text-forest/35 font-mono uppercase tracking-[0.2em]">/ {fmt(GOAL)}</span>
      </div>
      <div className="relative h-px bg-forest/10 mb-3">
        <div className="absolute inset-y-0 left-0 bg-terracotta" style={{ width: `${p}%` }} />
        <div
          className="absolute top-1/2 -translate-y-1/2 h-3 w-px bg-forest/25"
          style={{ left: '100%' }}
        />
      </div>
      <div className="flex justify-between">
        <span className="font-mono text-[10px] text-terracotta">{p}% of goal</span>
        <span className="font-mono text-[10px] text-forest/30">{fmt(GOAL - SIGS)} remaining</span>
      </div>
    </div>
  );
}

// ── 2. Block Segments ─────────────────────────────────────────────────────────
// Discrete filled blocks. Sage-light bg, friendly feel.
function V2BlockSegments() {
  const totalBlocks = 25;
  const filledBlocks = Math.round((SIGS / GOAL) * totalBlocks);
  return (
    <div className="bg-sage-light p-6 rounded-xl">
      <div className="flex items-baseline gap-2 mb-4">
        <span className="font-display text-4xl text-forest font-semibold">{fmt(SIGS)}</span>
        <span className="text-sm text-forest/40">/ {fmt(GOAL)} signatures</span>
      </div>
      <div className="flex gap-0.5 mb-2">
        {Array.from({ length: totalBlocks }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-6 flex-1 transition-colors',
              i === 0 && 'rounded-l-sm',
              i === totalBlocks - 1 && 'rounded-r-sm',
              i < filledBlocks ? 'bg-terracotta' : 'bg-sage/25'
            )}
          />
        ))}
      </div>
      <div className="text-right text-xs text-forest/40 font-mono">{fmt(GOAL - SIGS)} to goal</div>
    </div>
  );
}

// ── 3. Circular Donut ─────────────────────────────────────────────────────────
// SVG arc progress on forest-dark bg. Strong visual weight.
function V3CircularDonut() {
  const p = clampPct(SIGS, GOAL);
  const r = 46;
  const circ = 2 * Math.PI * r;
  const offset = circ - (p / 100) * circ;
  return (
    <div className="bg-forest p-6 rounded-xl flex items-center gap-5">
      <div className="relative shrink-0">
        <svg width="110" height="110" viewBox="0 0 110 110">
          <circle cx="55" cy="55" r={r} fill="none" stroke="rgba(168,181,160,0.12)" strokeWidth="9" />
          <circle
            cx="55" cy="55" r={r}
            fill="none"
            stroke="#D95D39"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={`${circ}`}
            strokeDashoffset={offset}
            transform="rotate(-90 55 55)"
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-xl text-bone font-semibold">{p}%</span>
        </div>
      </div>
      <div>
        <div className="font-display text-3xl text-bone font-semibold">{fmt(SIGS)}</div>
        <div className="text-xs text-bone/40 mt-0.5 mb-3">of {fmt(GOAL)} goal</div>
        <div className="px-2 py-1 bg-terracotta/15 rounded text-xs text-terracotta/90 inline-block">
          {SIGS >= GOAL ? 'Goal reached!' : `${fmt(GOAL - SIGS)} more needed`}
        </div>
      </div>
    </div>
  );
}

// ── 4. Forest Light — Vertical Bar ────────────────────────────────────────────
// Tall vertical gauge column on left, text stacked on right. Forest Light bg.
function V4ForestLightVertical() {
  const p = clampPct(SIGS, GOAL);
  return (
    <div className="bg-forest-light p-6 rounded-xl flex items-stretch gap-5">
      <div className="relative w-4 bg-bone/10 rounded-full shrink-0 h-36 self-center">
        <div
          className="absolute bottom-0 left-0 right-0 bg-terracotta rounded-full transition-all duration-500"
          style={{ height: `${p}%` }}
        />
        <div className="absolute left-0 right-0 h-px bg-bone/20" style={{ bottom: '100%' }} />
      </div>
      <div className="flex flex-col justify-between flex-1">
        <div>
          <div className="font-display text-4xl text-bone font-semibold leading-none">{fmt(SIGS)}</div>
          <div className="text-xs text-bone/40 mt-1.5">signatures collected</div>
        </div>
        <div>
          <div className="text-xs text-bone/30 mb-1 uppercase tracking-wider">Progress</div>
          <div className="font-mono text-2xl text-sage font-semibold">{p}%</div>
          <div className="text-xs text-bone/25 mt-0.5">Goal: {fmt(GOAL)}</div>
        </div>
      </div>
    </div>
  );
}

// ── 5. Forest Light — Editorial ───────────────────────────────────────────────
// Massive typographic number, single hairline bar. Forest Light bg. Magazine feel.
function V5ForestLightEditorial() {
  const p = clampPct(SIGS, GOAL);
  const beyond = Math.max(0, SIGS - GOAL);
  return (
    <div className="bg-forest-light p-6 rounded-xl">
      <div className="text-[10px] font-mono text-sage/50 uppercase tracking-[0.3em] mb-3">
        Petition · Signatures
      </div>
      <div className="font-display text-7xl text-bone font-semibold leading-none">{fmt(SIGS)}</div>
      <div className="text-sm text-sage/60 mt-1 mb-6">of {fmt(GOAL)} needed</div>
      <div className="relative h-px bg-bone/10 mb-3">
        <div className="absolute inset-y-0 left-0 bg-terracotta" style={{ width: `${p}%` }} />
      </div>
      {SIGS >= GOAL ? (
        <div className="text-xs text-terracotta/80">Goal reached · +{beyond} beyond</div>
      ) : (
        <div className="text-xs text-bone/30 font-mono">{p}% · {fmt(GOAL - SIGS)} signatures to go</div>
      )}
    </div>
  );
}

// ── 6. Forest Light — Pip Dots ────────────────────────────────────────────────
// Grid of small dots, filled vs hollow. Forest Light bg. Tactile, countable feel.
function V6ForestLightPips() {
  const totalPips = 30;
  const filledPips = Math.round((SIGS / GOAL) * totalPips);
  return (
    <div className="bg-forest-light p-6 rounded-xl">
      <div className="flex items-baseline gap-2 mb-4">
        <span className="font-display text-4xl text-bone font-semibold">{fmt(SIGS)}</span>
        <span className="text-xs text-sage/50">/ {fmt(GOAL)}</span>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {Array.from({ length: totalPips }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-2.5 w-2.5 rounded-full transition-colors',
              i < filledPips ? 'bg-terracotta' : 'bg-bone/10'
            )}
          />
        ))}
      </div>
      <div className="text-xs text-sage/40 font-mono">
        {filledPips}/{totalPips} milestones · {fmt(GOAL - SIGS)} signatures remaining
      </div>
    </div>
  );
}

// ── 7. Terracotta Bold ────────────────────────────────────────────────────────
// Inverted: terracotta bg, bone fill bar, big white number. High energy.
function V7TerracottaBold() {
  const p = clampPct(SIGS, GOAL);
  return (
    <div className="bg-terracotta p-6 rounded-xl">
      <div className="text-[10px] font-mono text-bone/50 uppercase tracking-widest mb-3">
        Community support
      </div>
      <div className="font-display text-6xl text-bone font-semibold leading-none mb-1">{fmt(SIGS)}</div>
      <div className="text-sm text-bone/60 mb-5">signatures · goal {fmt(GOAL)}</div>
      <div className="relative h-2 bg-bone/15 rounded-full mb-2">
        <div
          className="absolute inset-y-0 left-0 bg-bone rounded-full transition-all duration-500"
          style={{ width: `${p}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-bone/60">
        <span>{p}% of goal</span>
        <span>{fmt(GOAL - SIGS)} to go</span>
      </div>
    </div>
  );
}

// ── 8. Glassmorphism ──────────────────────────────────────────────────────────
// Frosted inner card over a forest-to-terracotta gradient. Depth through blur.
function V8Glassmorphism() {
  const p = clampPct(SIGS, GOAL);
  return (
    <div
      className="relative p-3 rounded-2xl overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #1A2218 0%, #2C3E2D 50%, #D95D39 130%)' }}
    >
      <div className="backdrop-blur-sm bg-white/5 border border-white/10 p-5 rounded-xl">
        <div className="font-display text-5xl text-white/90 font-semibold leading-none mb-1">{fmt(SIGS)}</div>
        <div className="text-xs text-white/35 mb-4">of {fmt(GOAL)} signatures</div>
        <div className="relative h-1.5 bg-white/10 rounded-full mb-2">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
            style={{
              width: `${p}%`,
              background: 'linear-gradient(90deg, rgba(255,255,255,0.35), rgba(255,255,255,0.8))',
            }}
          />
        </div>
        <div className="text-xs text-white/45 font-mono">{p}% complete · {fmt(GOAL - SIGS)} more needed</div>
      </div>
    </div>
  );
}

// ── 9. Scoreboard Ticker ──────────────────────────────────────────────────────
// Monospaced, dark, mechanical-counter aesthetic. Like a sports scoreboard.
function V9ScoreboardTicker() {
  const p = clampPct(SIGS, GOAL);
  return (
    <div className="bg-[#111111] border border-[#2a2a2a] p-6 rounded-xl">
      <div className="text-[9px] font-mono text-[#444] uppercase tracking-[0.35em] mb-3">
        Signatures collected
      </div>
      <div className="font-mono text-5xl text-terracotta font-bold tracking-wider leading-none mb-1">
        {SIGS.toString().padStart(4, '0')}
      </div>
      <div className="font-mono text-xs text-[#3a3a3a] mb-5">
        GOAL ──── {GOAL.toString().padStart(4, '0')}
      </div>
      <div className="h-2 bg-[#1e1e1e] rounded mb-1.5">
        <div
          className="h-full bg-terracotta rounded transition-all duration-500"
          style={{ width: `${p}%` }}
        />
      </div>
      <div className="flex justify-between">
        <span className="font-mono text-[9px] text-[#444]">0000</span>
        <span className="font-mono text-[9px] text-[#444]">{GOAL.toString().padStart(4, '0')}</span>
      </div>
    </div>
  );
}

// ── 10. Art Déco Geometric ────────────────────────────────────────────────────
// Symmetrical dividers, block-fill progress row, centered typographic layout.
function V10ArtDeco() {
  const p = clampPct(SIGS, GOAL);
  const filledBlocks = Math.round(p / 10);
  return (
    <div className="bg-bone border border-forest/15 p-6">
      <div className="text-center mb-5">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="h-px flex-1 bg-forest/15" />
          <span className="text-[8px] tracking-[0.5em] uppercase font-medium text-forest/35">
            Petition
          </span>
          <div className="h-px flex-1 bg-forest/15" />
        </div>
        <div className="font-display text-6xl text-forest font-semibold leading-none">{fmt(SIGS)}</div>
        <div className="text-[9px] tracking-[0.4em] uppercase text-forest/40 mt-2">Signatures</div>
      </div>
      <div className="flex items-center justify-center gap-1 mb-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-3.5 w-7 border transition-colors',
              i < filledBlocks ? 'bg-forest border-forest' : 'border-forest/15'
            )}
          />
        ))}
      </div>
      <div className="flex items-center justify-center gap-3">
        <div className="h-px flex-1 bg-forest/8" />
        <span className="text-[10px] text-forest/40 font-mono">{p}% · goal {fmt(GOAL)}</span>
        <div className="h-px flex-1 bg-forest/8" />
      </div>
    </div>
  );
}

// ── Wrapper ───────────────────────────────────────────────────────────────────

const VARIANTS = [
  { num: 1, label: 'Minimal Lines', bg: 'bone', Component: V1MinimalLines },
  { num: 2, label: 'Block Segments', bg: 'sage-light', Component: V2BlockSegments },
  { num: 3, label: 'Circular Donut', bg: 'forest', Component: V3CircularDonut },
  { num: 4, label: 'Forest Light — Vertical Bar', bg: 'forest-light', Component: V4ForestLightVertical },
  { num: 5, label: 'Forest Light — Editorial', bg: 'forest-light', Component: V5ForestLightEditorial },
  { num: 6, label: 'Forest Light — Pip Dots', bg: 'forest-light', Component: V6ForestLightPips },
  { num: 7, label: 'Terracotta Bold', bg: 'terracotta', Component: V7TerracottaBold },
  { num: 8, label: 'Glassmorphism', bg: 'gradient', Component: V8Glassmorphism },
  { num: 9, label: 'Scoreboard Ticker', bg: 'dark', Component: V9ScoreboardTicker },
  { num: 10, label: 'Art Déco Geometric', bg: 'bone', Component: V10ArtDeco },
];

export default function GoalMeterExperiments() {
  return (
    <div className="space-y-8">
      <Card className="p-6">
        <h2 className="font-display text-2xl mb-2">Goal Meter Experiments</h2>
        <p className="text-sm opacity-70">
          10 styling iterations of a petition goal meter. Demo data: {SIGS} of {GOAL} signatures ({clampPct(SIGS, GOAL)}%).
          Variants 4, 5, and 6 use Forest Light (#2C3E2D) as the background colour.
        </p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {VARIANTS.map(({ num, label, bg, Component }) => (
          <div key={num}>
            <div className="flex items-center gap-2 mb-2.5">
              <span className="font-mono text-xs text-forest/25">#{num.toString().padStart(2, '0')}</span>
              <span className="text-xs font-medium uppercase tracking-wider text-forest/45">{label}</span>
              {bg === 'forest-light' && (
                <span className="ml-auto text-[9px] font-mono px-1.5 py-0.5 rounded bg-forest-light/15 text-forest/50">
                  forest-light bg
                </span>
              )}
            </div>
            <Component />
          </div>
        ))}
      </div>
    </div>
  );
}
