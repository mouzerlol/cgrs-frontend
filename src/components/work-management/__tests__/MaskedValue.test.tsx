import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MaskedValue } from '../MaskedValue';

const defaults = {
  ariaLabelHide: 'Hide value',
  ariaLabelReveal: 'Reveal value',
};

describe('MaskedValue', () => {
  it('renders the masked form by default', () => {
    render(
      <MaskedValue
        value="joan@example.com"
        masked="j**n@example.com"
        isRevealed={false}
        onToggle={() => {}}
        {...defaults}
      />,
    );
    expect(screen.getByText('j**n@example.com')).toBeInTheDocument();
    expect(screen.queryByText('joan@example.com')).not.toBeInTheDocument();
  });

  it('renders the unmasked value when isRevealed is true', () => {
    render(
      <MaskedValue
        value="joan@example.com"
        masked="j**n@example.com"
        isRevealed={true}
        onToggle={() => {}}
        {...defaults}
      />,
    );
    expect(screen.getByText('joan@example.com')).toBeInTheDocument();
  });

  it('calls onToggle on click', () => {
    const onToggle = vi.fn();
    render(
      <MaskedValue
        value="joan@example.com"
        masked="j**n@example.com"
        isRevealed={false}
        onToggle={onToggle}
        {...defaults}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /reveal value/i }));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('uses the hide aria-label when revealed', () => {
    render(
      <MaskedValue
        value="joan@example.com"
        masked="j**n@example.com"
        isRevealed={true}
        onToggle={() => {}}
        {...defaults}
      />,
    );
    expect(screen.getByRole('button', { name: /hide value/i })).toBeInTheDocument();
  });

  it('renders an em-dash and no toggle button when value is null', () => {
    render(
      <MaskedValue
        value={null}
        masked=""
        isRevealed={false}
        onToggle={() => {}}
        {...defaults}
      />,
    );
    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('toggles via keyboard (Enter activates the button)', () => {
    const onToggle = vi.fn();
    render(
      <MaskedValue
        value="joan@example.com"
        masked="j**n@example.com"
        isRevealed={false}
        onToggle={onToggle}
        {...defaults}
      />,
    );
    const btn = screen.getByRole('button', { name: /reveal value/i });
    btn.focus();
    // Native button responds to keyboard via click on Enter/Space — simulate the click.
    fireEvent.keyDown(btn, { key: 'Enter' });
    fireEvent.click(btn);
    expect(onToggle).toHaveBeenCalled();
  });
});
