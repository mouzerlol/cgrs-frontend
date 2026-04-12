import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import BookmarkButton from '../BookmarkButton';

vi.mock('@/components/ui/Tooltip', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('BookmarkButton', () => {
  it('centers icon with symmetric flex alignment (no default horizontal padding)', () => {
    render(<BookmarkButton onBookmark={() => {}} />);
    const btn = screen.getByRole('button', { name: /bookmark thread/i });
    expect(btn.className).toContain('justify-center');
    expect(btn.className).toContain('items-center');
    expect(btn.className).not.toMatch(/\bpl-\d/);
    expect(btn.className).not.toMatch(/\bpr-\d/);
  });

  it('renders bookmark-check icon when saved', () => {
    render(<BookmarkButton isBookmarked onBookmark={() => {}} />);
    const svg = screen.getByRole('button', { name: /remove bookmark/i }).querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});
