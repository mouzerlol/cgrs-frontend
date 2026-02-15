import { describe, it, expect, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// Mock next/font/google since it's a build-time module
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

describe('Font Configuration', () => {
  it('layout.tsx imports fonts from next/font/google', () => {
    const layoutPath = path.resolve(__dirname, '../layout.tsx');
    const layoutSource = fs.readFileSync(layoutPath, 'utf-8');

    expect(layoutSource).toContain("from 'next/font/google'");
    expect(layoutSource).toContain('Fraunces');
    expect(layoutSource).toContain('Manrope');
  });

  it('layout.tsx does not use CSS @import for Google Fonts', () => {
    const globalsCssPath = path.resolve(__dirname, '../globals.css');
    const cssSource = fs.readFileSync(globalsCssPath, 'utf-8');

    expect(cssSource).not.toContain('fonts.googleapis.com');
    expect(cssSource).not.toContain('@import url(');
  });

  it('fonts are configured with display swap', () => {
    const layoutPath = path.resolve(__dirname, '../layout.tsx');
    const layoutSource = fs.readFileSync(layoutPath, 'utf-8');

    // Both font configurations should use display: 'swap'
    const swapMatches = layoutSource.match(/display:\s*['"]swap['"]/g);
    expect(swapMatches).toHaveLength(2);
  });

  it('fonts are configured with latin subset', () => {
    const layoutPath = path.resolve(__dirname, '../layout.tsx');
    const layoutSource = fs.readFileSync(layoutPath, 'utf-8');

    const subsetMatches = layoutSource.match(/subsets:\s*\[['"]latin['"]\]/g);
    expect(subsetMatches).toHaveLength(2);
  });

  it('font CSS variables are applied to html element', () => {
    const layoutPath = path.resolve(__dirname, '../layout.tsx');
    const layoutSource = fs.readFileSync(layoutPath, 'utf-8');

    expect(layoutSource).toContain('fraunces.variable');
    expect(layoutSource).toContain('manrope.variable');
    expect(layoutSource).toMatch(/className=\{`\$\{fraunces\.variable\}\s+\$\{manrope\.variable\}`\}/);
  });

  it('tailwind config references CSS variables for font families', () => {
    const tailwindPath = path.resolve(__dirname, '../../../tailwind.config.js');
    const tailwindSource = fs.readFileSync(tailwindPath, 'utf-8');

    expect(tailwindSource).toContain('var(--font-fraunces)');
    expect(tailwindSource).toContain('var(--font-manrope)');
  });

  it('globals.css uses CSS variables for font families', () => {
    const globalsCssPath = path.resolve(__dirname, '../globals.css');
    const cssSource = fs.readFileSync(globalsCssPath, 'utf-8');

    expect(cssSource).toContain('var(--font-fraunces)');
    expect(cssSource).toContain('var(--font-manrope)');
  });
});
