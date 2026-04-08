import * as fs from 'fs';
import * as path from 'path';
import { describe, it, expect } from 'vitest';

/** Markers from the v3 favicon (32×32 Verdana CG on forest green). */
const V3_MARKERS = ['#2C3E2D', '#E8EDE6', 'Verdana', 'font-size="14"', '>CG</text>', 'rx="10"'] as const;

/** Legacy tab icon used path-drawn letters and this background fill. */
const LEGACY_MARKERS = ['#1A2218', 'M10 10H12.5'] as const;

/** v2 chromatic-aberration design; replaced by v3. */
const V2_MARKERS = ['aberration-main', 'aberration-shadow'] as const;

describe('Favicon assets (v3)', () => {
  const appIconPath = path.resolve(__dirname, '../icon.svg');
  const publicFaviconPath = path.resolve(__dirname, '../../../public/favicon.svg');

  it('app/icon.svg uses the v3 CG design and not legacy or v2 assets', () => {
    const svg = fs.readFileSync(appIconPath, 'utf-8');
    for (const m of V3_MARKERS) {
      expect(svg, `expected app/icon.svg to contain ${m}`).toContain(m);
    }
    for (const m of LEGACY_MARKERS) {
      expect(svg, `app/icon.svg should not contain legacy marker ${m}`).not.toContain(m);
    }
    for (const m of V2_MARKERS) {
      expect(svg, `app/icon.svg should not contain v2 marker ${m}`).not.toContain(m);
    }
  });

  it('public/favicon.svg matches app/icon.svg so /favicon.svg stays in sync with the tab icon', () => {
    const appSvg = fs.readFileSync(appIconPath, 'utf-8');
    const publicSvg = fs.readFileSync(publicFaviconPath, 'utf-8');
    expect(publicSvg).toBe(appSvg);
  });
});
