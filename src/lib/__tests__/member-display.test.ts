import { describe, expect, it } from 'vitest';
import { memberDisplayName } from '../member-display';
import type { MemberSummaryResponse } from '@/types/authorization';

function baseMember(overrides: Partial<MemberSummaryResponse> = {}): MemberSummaryResponse {
  return {
    id: 'm1',
    community_id: 'c1',
    user_id: 'u1',
    role: 'contact',
    created_at: '2026-01-01T00:00:00.000Z',
    user: {
      id: 'u1',
      clerk_user_id: 'clerk_1',
      email: 'x@y.nz',
      first_name: 'First',
      last_name: 'Last',
      avatar_url: null,
    },
    ...overrides,
  };
}

describe('memberDisplayName', () => {
  it('joins first and last when present', () => {
    expect(memberDisplayName(baseMember())).toBe('First Last');
  });

  it('falls back to email when names missing', () => {
    const m = baseMember({
      user: {
        id: 'u1',
        clerk_user_id: 'clerk_1',
        email: 'only@email.nz',
        first_name: null,
        last_name: null,
        avatar_url: null,
      },
    });
    expect(memberDisplayName(m)).toBe('only@email.nz');
  });

  it('falls back to clerk id when email missing', () => {
    const m = baseMember({
      user: {
        id: 'u1',
        clerk_user_id: 'clerk_fallback',
        email: null,
        first_name: null,
        last_name: null,
        avatar_url: null,
      },
    });
    expect(memberDisplayName(m)).toBe('clerk_fallback');
  });
});
