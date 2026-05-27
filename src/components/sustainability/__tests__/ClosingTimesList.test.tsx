import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ClosingTimesList from '../ClosingTimesList';

describe('ClosingTimesList', () => {
  it('renders the section heading', () => {
    render(<ClosingTimesList />);
    expect(screen.getByText(/Things that close overnight in Mangere Bridge/i)).toBeInTheDocument();
  });

  it('renders the library, dairy, and harbour entries', () => {
    render(<ClosingTimesList />);
    expect(screen.getByText(/Mangere Bridge Library/i)).toBeInTheDocument();
    expect(screen.getByText(/dairy on Coronation Road/i)).toBeInTheDocument();
    expect(screen.getByText(/Manukau Harbour, the tide/i)).toBeInTheDocument();
  });

  it('lists CGRS as the final entry, not the headline', () => {
    render(<ClosingTimesList />);
    const items = screen.getAllByRole('listitem');
    // CGRS should be in the LAST list item.
    expect(items[items.length - 1].textContent).toContain('CGRS, the website');
  });

  it('renders each row with its hours in monospace', () => {
    const { container } = render(<ClosingTimesList />);
    const monoSpans = container.querySelectorAll('.font-mono');
    // One mono span per institution.
    expect(monoSpans.length).toBeGreaterThanOrEqual(5);
  });
});
