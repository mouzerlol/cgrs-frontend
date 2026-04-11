import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TagInput from '../TagInput';

describe('TagInput', () => {
  it('renders tag chips with square corners', () => {
    const onChange = vi.fn();
    render(<TagInput tags={['alpha']} onChange={onChange} />);
    expect(screen.getByText('alpha')).toHaveClass('rounded-none');
  });

  it('adds tags with square chip styling', () => {
    const onChange = vi.fn();
    render(<TagInput tags={[]} onChange={onChange} />);
    const input = screen.getByPlaceholderText('Add tags...');
    fireEvent.change(input, { target: { value: 'newtag' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith(['newtag']);
  });
});
