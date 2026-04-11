import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ViewToggle from '../ViewToggle';

describe('ViewToggle', () => {
  it('calls onChange with card when compact and card is clicked', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<ViewToggle value="compact" onChange={onChange} />);

    await user.click(screen.getByRole('radio', { name: 'Card view' }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('card');
  });

  it('calls onChange with compact when card and compact is clicked', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<ViewToggle value="card" onChange={onChange} />);

    await user.click(screen.getByRole('radio', { name: 'Compact view' }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('compact');
  });

  it('toggles to compact when card is already selected and card is clicked again', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<ViewToggle value="card" onChange={onChange} />);

    await user.click(screen.getByRole('radio', { name: 'Card view' }));
    expect(onChange).toHaveBeenCalledWith('compact');
  });

  it('toggles to card when compact is already selected and compact is clicked again', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<ViewToggle value="compact" onChange={onChange} />);

    await user.click(screen.getByRole('radio', { name: 'Compact view' }));
    expect(onChange).toHaveBeenCalledWith('card');
  });
});
