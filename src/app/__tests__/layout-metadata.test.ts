import { describe, it, expect, vi } from 'vitest';

// Mock next/font/google before importing layout
vi.mock('next/font/google', () => ({
  Fraunces: vi.fn(() => ({
    variable: '--font-fraunces',
    className: 'mock-fraunces',
  })),
  Manrope: vi.fn(() => ({
    variable: '--font-manrope',
    className: 'mock-manrope',
  })),
}));

import { metadata } from '../layout';

describe('Root Layout Metadata', () => {
  it('exports metadata with required SEO fields', () => {
    expect(metadata).toBeDefined();
    expect(metadata.title).toBeTruthy();
    expect(metadata.description).toBeTruthy();
    expect(metadata.keywords).toBeTruthy();
    expect(metadata.authors).toBeTruthy();
  });

  it('has a title under 60 characters for SEO', () => {
    const title = metadata.title as string;
    expect(title.length).toBeLessThanOrEqual(60);
  });

  it('has a description of at least 50 characters', () => {
    const description = metadata.description as string;
    expect(description.length).toBeGreaterThanOrEqual(50);
  });

  it('includes metadataBase with correct URL', () => {
    expect(metadata.metadataBase).toBeDefined();
    expect(metadata.metadataBase).toBeInstanceOf(URL);
    expect((metadata.metadataBase as URL).href).toBe(
      'https://coronationgardens.co.nz/'
    );
  });

  it('includes alternates.canonical for auto-generated canonical URLs', () => {
    expect(metadata.alternates).toBeDefined();
    expect(metadata.alternates!.canonical).toBe('./');
  });

  it('includes OpenGraph tags', () => {
    expect(metadata.openGraph).toBeDefined();
    expect(metadata.openGraph!.title).toBeTruthy();
    expect(metadata.openGraph!.description).toBeTruthy();
    expect(metadata.openGraph!.type).toBe('website');
    expect(metadata.openGraph!.locale).toBe('en_NZ');
  });

  it('includes OpenGraph image with correct dimensions', () => {
    const og = metadata.openGraph as {
      images: Array<{
        url: string;
        width: number;
        height: number;
        alt: string;
      }>;
    };
    expect(og.images).toBeDefined();
    expect(og.images).toHaveLength(1);
    expect(og.images[0].url).toBe('/images/og-default.jpg');
    expect(og.images[0].width).toBe(1200);
    expect(og.images[0].height).toBe(630);
    expect(og.images[0].alt).toBeTruthy();
  });

  it('includes favicon icons', () => {
    expect(metadata.icons).toBeDefined();
    const icons = metadata.icons as Record<string, unknown>;
    expect(icons.icon).toBeTruthy();
    expect(icons.shortcut).toBeTruthy();
    expect(icons.apple).toBeTruthy();
  });

  it('does not include Font Awesome CDN reference', () => {
    // Font Awesome CDN was removed since Iconify handles FA icons
    const metaStr = JSON.stringify(metadata);
    expect(metaStr).not.toContain('font-awesome');
    expect(metaStr).not.toContain('cdnjs.cloudflare.com');
  });
});
