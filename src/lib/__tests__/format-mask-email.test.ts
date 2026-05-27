import { describe, it, expect } from 'vitest';
import fixture from '../../../../cgrs-api/tests/fixtures/email_masks.json';
import { maskEmail } from '@/lib/format-mask-email';

type Case = { name: string; input: string; expected: string };

describe('maskEmail (shared fixtures with backend)', () => {
  for (const c of fixture.cases as Case[]) {
    it(c.name, () => {
      expect(maskEmail(c.input)).toBe(c.expected);
    });
  }
});
