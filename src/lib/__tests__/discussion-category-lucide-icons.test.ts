import { describe, it, expect } from 'vitest';
import { MessageCircle, Calendar } from 'lucide-react';
import {
  getDiscussionCategoryLabel,
  getDiscussionCategoryLucideIcon,
} from '../discussion-category-lucide-icons';

describe('discussion-category-lucide-icons', () => {
  it('returns mapped icon for known slugs', () => {
    expect(getDiscussionCategoryLucideIcon('general')).toBe(MessageCircle);
    expect(getDiscussionCategoryLucideIcon('events')).toBe(Calendar);
  });

  it('falls back to MessageCircle for unknown slugs', () => {
    expect(getDiscussionCategoryLucideIcon('unknown-category')).toBe(MessageCircle);
  });

  it('returns label for known slugs and fallback for unknown', () => {
    expect(getDiscussionCategoryLabel('events')).toBe('Events');
    expect(getDiscussionCategoryLabel('unknown-category')).toBe('General');
  });
});
