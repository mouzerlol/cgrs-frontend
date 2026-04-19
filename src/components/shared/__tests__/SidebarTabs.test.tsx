import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SidebarTabs, type SidebarCategory } from '@/components/shared/SidebarTabs';

describe('SidebarTabs', () => {
  const categories: SidebarCategory[] = [
    { id: 'ann', name: 'Announcements', icon: 'lucide:megaphone', count: 4 },
  ];

  it('keeps label and count on one row with a wider sidebar and no ellipsis on the title', () => {
    const { container } = render(
      <SidebarTabs categories={categories} activeCategory={null} onCategoryChange={vi.fn()} />
    );

    const nav = container.querySelector('nav[aria-label="Categories"]');
    expect(nav?.className).toContain('w-80');

    const tab = screen.getByRole('tab', { name: /Announcements/i });
    const badge = within(tab).getByText('4');
    expect(badge).toHaveAttribute('data-tab-count');

    const row = badge.parentElement;
    expect(row?.className).toContain('flex-row');
    expect(row?.className).toContain('justify-between');

    const labelSpan = row?.firstElementChild;
    expect(labelSpan?.textContent).toBe('Announcements');
    expect(labelSpan?.className).not.toContain('text-ellipsis');
    expect(labelSpan?.className).not.toContain('overflow-hidden');
  });

  it('invokes onCategoryChange when a tab is activated', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SidebarTabs categories={categories} activeCategory={null} onCategoryChange={onChange} />);

    await user.click(screen.getByRole('tab', { name: /Announcements/i }));
    expect(onChange).toHaveBeenCalledWith('ann');
  });
});
