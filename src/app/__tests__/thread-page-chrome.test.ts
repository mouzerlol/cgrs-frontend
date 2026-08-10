import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const read = (p: string) => readFileSync(join(root, p), 'utf8');

const threadPage = read('src/app/(main)/discussion/thread/[id]/page.tsx');
const middleware = read('src/middleware.ts');

/**
 * SiteChromeBar (header + beta banner) is `fixed top-0`, so any page that does not
 * open with a PageHeader has to clear it itself. The thread page dropped its hero,
 * which is exactly how the card ended up sliding under the nav and the marquee.
 */
describe('thread page chrome clearance', () => {
  it('offsets the page by the fixed chrome height', () => {
    expect(threadPage).toContain('pt-[var(--chrome-height)]');
  });

  it('does not render a PageHeader — the thread title is the page heading', () => {
    expect(threadPage).not.toContain('PageHeader');
  });

  it('uses --chrome-height, which has a CSS default, not the JS-measured offset', () => {
    // --chrome-offset collapses to 0 when the mobile chrome retracts on scroll; using it
    // here would yank the card upward mid-scroll.
    expect(threadPage).not.toContain('--chrome-offset');
  });
});

describe('thread route protection', () => {
  it('gates /discussion/thread behind sign-in', () => {
    const protectedBlock = middleware.slice(
      middleware.indexOf('isProtectedRoute'),
      middleware.indexOf('isPublicRoute'),
    );
    expect(protectedBlock).toContain("'/discussion/thread(.*)'");
  });
});
