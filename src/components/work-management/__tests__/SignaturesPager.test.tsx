import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SignaturesPager } from '../SignaturesPager';

describe('SignaturesPager', () => {
  it('renders nothing when total is less than or equal to the page size', () => {
    const { container } = render(
      <SignaturesPager total={42} offset={0} limit={50} hasMore={false} onChangeOffset={() => {}} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders accurate summary mid-dataset', () => {
    render(
      <SignaturesPager
        total={137}
        offset={50}
        limit={50}
        hasMore={true}
        onChangeOffset={() => {}}
      />,
    );
    expect(screen.getByText('Showing 51–100 of 137')).toBeInTheDocument();
    expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();
  });

  it('disables previous on first page', () => {
    render(
      <SignaturesPager
        total={137}
        offset={0}
        limit={50}
        hasMore={true}
        onChangeOffset={() => {}}
      />,
    );
    expect(screen.getByRole('button', { name: /previous page/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /next page/i })).not.toBeDisabled();
  });

  it('disables next on final page (hasMore=false)', () => {
    render(
      <SignaturesPager
        total={137}
        offset={100}
        limit={50}
        hasMore={false}
        onChangeOffset={() => {}}
      />,
    );
    expect(screen.getByRole('button', { name: /previous page/i })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: /next page/i })).toBeDisabled();
  });

  it('calls onChangeOffset with offset - limit on previous', () => {
    const onChangeOffset = vi.fn();
    render(
      <SignaturesPager
        total={137}
        offset={50}
        limit={50}
        hasMore={true}
        onChangeOffset={onChangeOffset}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /previous page/i }));
    expect(onChangeOffset).toHaveBeenCalledWith(0);
  });

  it('calls onChangeOffset with offset + limit on next', () => {
    const onChangeOffset = vi.fn();
    render(
      <SignaturesPager
        total={137}
        offset={50}
        limit={50}
        hasMore={true}
        onChangeOffset={onChangeOffset}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /next page/i }));
    expect(onChangeOffset).toHaveBeenCalledWith(100);
  });

  it('shows last page summary correctly', () => {
    render(
      <SignaturesPager
        total={137}
        offset={100}
        limit={50}
        hasMore={false}
        onChangeOffset={() => {}}
      />,
    );
    expect(screen.getByText('Showing 101–137 of 137')).toBeInTheDocument();
    expect(screen.getByText('Page 3 of 3')).toBeInTheDocument();
  });
});
