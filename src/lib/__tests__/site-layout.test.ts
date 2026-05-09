import { afterEach, describe, expect, it, vi } from 'vitest';
import { getFixedSiteHeaderHeight } from '@/lib/site-layout';

describe('getFixedSiteHeaderHeight', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('returns fallback when no header exists', () => {
    expect(getFixedSiteHeaderHeight()).toBe(80);
  });

  it('returns ceil of measured header height', () => {
    const header = document.createElement('header');
    document.body.appendChild(header);
    const rect = {
      height: 72.2,
      width: 0,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect;
    vi.spyOn(header, 'getBoundingClientRect').mockReturnValue(rect);
    expect(getFixedSiteHeaderHeight()).toBe(73);
  });

  it('prefers [data-site-header] over a plain header when both exist', () => {
    const heroHeader = document.createElement('header');
    heroHeader.setAttribute('data-testid', 'hero');
    const siteHeader = document.createElement('header');
    siteHeader.setAttribute('data-site-header', '');
    document.body.appendChild(heroHeader);
    document.body.appendChild(siteHeader);

    const tallRect = { height: 99.1, top: 0, left: 0, right: 0, bottom: 0, width: 0, x: 0, y: 0, toJSON: () => ({}) } as DOMRect;
    const shortRect = { height: 40.0, top: 0, left: 0, right: 0, bottom: 0, width: 0, x: 0, y: 0, toJSON: () => ({}) } as DOMRect;
    vi.spyOn(heroHeader, 'getBoundingClientRect').mockReturnValue(tallRect);
    vi.spyOn(siteHeader, 'getBoundingClientRect').mockReturnValue(shortRect);

    expect(getFixedSiteHeaderHeight()).toBe(40);
  });
});
