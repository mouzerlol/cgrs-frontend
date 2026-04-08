import { describe, it, expect } from 'vitest';
import { discussionKeys } from '@/lib/discussion-keys';

describe('discussionKeys', () => {
  it('bookmarkedThreads returns a stable key under threads', () => {
    expect(discussionKeys.bookmarkedThreads()).toEqual(['discussions', 'threads', 'bookmarked']);
  });
});
