import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Switch } from '@/components/ui/Switch';

describe('Switch', () => {
  it('renders switch label', () => {
    render(
      <Switch 
        label="Enable notifications" 
        checked={false} 
        onChange={vi.fn()} 
      />
    );
    expect(screen.getByText('Enable notifications')).toBeInTheDocument();
  });

  it('renders switch description', () => {
    render(
      <Switch 
        label="Enable notifications" 
        description="Receive email updates"
        checked={false} 
        onChange={vi.fn()} 
      />
    );
    expect(screen.getByText('Receive email updates')).toBeInTheDocument();
  });

  it('renders in unchecked state by default', () => {
    render(
      <Switch 
        label="Enable notifications" 
        checked={false} 
        onChange={vi.fn()} 
      />
    );
    const switchElement = screen.getByRole('switch');
    expect(switchElement).not.toBeChecked();
  });

  it('renders in checked state when checked prop is true', () => {
    render(
      <Switch 
        label="Enable notifications" 
        checked={true} 
        onChange={vi.fn()} 
      />
    );
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeChecked();
  });

  it('calls onChange when clicked', () => {
    const handleChange = vi.fn();
    render(
      <Switch 
        label="Enable notifications" 
        checked={false} 
        onChange={handleChange} 
      />
    );
    const switchElement = screen.getByRole('switch');
    fireEvent.click(switchElement);
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('calls onChange with true when unchecked switch is clicked', () => {
    const handleChange = vi.fn();
    render(
      <Switch 
        label="Enable notifications" 
        checked={false} 
        onChange={handleChange} 
      />
    );
    const switchElement = screen.getByRole('switch');
    fireEvent.click(switchElement);
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('calls onChange with false when checked switch is clicked', () => {
    const handleChange = vi.fn();
    render(
      <Switch 
        label="Enable notifications" 
        checked={true} 
        onChange={handleChange} 
      />
    );
    const switchElement = screen.getByRole('switch');
    fireEvent.click(switchElement);
    expect(handleChange).toHaveBeenCalledWith(false);
  });

  it('is disabled when disabled prop is true', () => {
    render(
      <Switch 
        label="Enable notifications" 
        checked={false} 
        onChange={vi.fn()} 
        disabled={true}
      />
    );
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeDisabled();
  });

  it('does not call onChange when disabled', () => {
    const handleChange = vi.fn();
    render(
      <Switch 
        label="Enable notifications" 
        checked={false} 
        onChange={handleChange} 
        disabled={true}
      />
    );
    const switchElement = screen.getByRole('switch');
    fireEvent.click(switchElement);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(
      <Switch 
        label="Enable notifications" 
        checked={false} 
        onChange={vi.fn()} 
        className="custom-switch"
      />
    );
    const container = document.querySelector('.custom-switch');
    expect(container).toBeInTheDocument();
  });
});
