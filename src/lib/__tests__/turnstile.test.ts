import { describe, expect, it } from 'vitest';

import { normalizeTurnstileSiteKey } from '../turnstile';

describe('normalizeTurnstileSiteKey', () => {
  it('returns undefined for undefined and empty', () => {
    expect(normalizeTurnstileSiteKey(undefined)).toBeUndefined();
    expect(normalizeTurnstileSiteKey('')).toBeUndefined();
    expect(normalizeTurnstileSiteKey('   ')).toBeUndefined();
  });

  it('strips leading and trailing whitespace including newlines', () => {
    const key = '0x4AAAAAACzlklBGZHaxF1fS';
    expect(normalizeTurnstileSiteKey(`  ${key}  `)).toBe(key);
    expect(normalizeTurnstileSiteKey(`${key}\n`)).toBe(key);
    expect(normalizeTurnstileSiteKey(`\r\n${key}\n`)).toBe(key);
  });
});
