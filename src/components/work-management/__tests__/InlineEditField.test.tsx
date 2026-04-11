import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import InlineEditField from '../InlineEditField';

describe('InlineEditField', () => {
  it('uses square corners on textarea editing surface', () => {
    const onSave = vi.fn();
    render(<InlineEditField type="textarea" value="Hello" onSave={onSave} />);
    fireEvent.click(screen.getByText('Hello'));
    expect(screen.getByRole('textbox')).toHaveClass('rounded-none');
  });

  it('uses square corners on text input when editing', () => {
    const onSave = vi.fn();
    render(<InlineEditField type="text" value="Title" onSave={onSave} />);
    fireEvent.click(screen.getByText('Title'));
    expect(screen.getByRole('textbox')).toHaveClass('rounded-none');
  });
});
