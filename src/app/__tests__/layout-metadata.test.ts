import { describe, it, expect } from 'vitest';
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

  it('includes OpenGraph tags', () => {
    expect(metadata.openGraph).toBeDefined();
    expect(metadata.openGraph!.title).toBeTruthy();
    expect(metadata.openGraph!.description).toBeTruthy();
    expect(metadata.openGraph!.type).toBe('website');
    expect(metadata.openGraph!.locale).toBe('en_NZ');
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
