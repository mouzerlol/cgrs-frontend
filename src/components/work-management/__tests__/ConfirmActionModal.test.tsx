import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ConfirmActionModal from '../ConfirmActionModal';

describe('ConfirmActionModal', () => {
  const baseProps = {
    isOpen: true,
    title: 'Confirm verification',
    message: 'Verify Jane as resident of 12 Smith St?',
    confirmLabel: 'Confirm verify',
  };

  it('sends nothing when cancelled (spec invariant)', () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    render(<ConfirmActionModal {...baseProps} onConfirm={onConfirm} onClose={onClose} />);

    fireEvent.click(screen.getByText('Cancel'));
    // The invariant: cancelling issues no action. (onClose may also be fired by
    // the underlying Headless UI Dialog, so we only assert it was closed.)
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('fires exactly one action when confirmed', async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();
    render(<ConfirmActionModal {...baseProps} onConfirm={onConfirm} onClose={onClose} />);

    fireEvent.click(screen.getByText('Confirm verify'));
    await waitFor(() => expect(onConfirm).toHaveBeenCalledTimes(1));
  });

  it('passes the note to onConfirm when withNote is enabled', async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    render(
      <ConfirmActionModal
        {...baseProps}
        confirmLabel="Confirm reject"
        withNote
        onConfirm={onConfirm}
        onClose={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Not on the roll' } });
    fireEvent.click(screen.getByText('Confirm reject'));
    await waitFor(() => expect(onConfirm).toHaveBeenCalledWith('Not on the roll'));
  });
});
