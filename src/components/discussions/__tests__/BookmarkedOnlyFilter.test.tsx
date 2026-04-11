import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BookmarkedOnlyFilter from '@/components/discussions/BookmarkedOnlyFilter';

describe('BookmarkedOnlyFilter', () => {
  it('toggles via click and updates aria-pressed', async () => {
    const user = userEvent.setup();
    const onPressedChange = vi.fn();

    const { rerender } = render(
      <BookmarkedOnlyFilter pressed={false} onPressedChange={onPressedChange} />,
    );

    const btn = screen.getByRole('button', { name: /show only bookmarked threads/i });
    expect(btn).toHaveAttribute('aria-pressed', 'false');

    await user.click(btn);
    expect(onPressedChange).toHaveBeenCalledWith(true);

    rerender(<BookmarkedOnlyFilter pressed onPressedChange={onPressedChange} />);
    expect(btn).toHaveAttribute('aria-pressed', 'true');
  });

  it('does not call onPressedChange when disabled', async () => {
    const user = userEvent.setup();
    const onPressedChange = vi.fn();

    render(
      <BookmarkedOnlyFilter pressed={false} onPressedChange={onPressedChange} disabled />,
    );

    const btn = screen.getByRole('button');
    await user.click(btn);
    expect(onPressedChange).not.toHaveBeenCalled();
  });
});
