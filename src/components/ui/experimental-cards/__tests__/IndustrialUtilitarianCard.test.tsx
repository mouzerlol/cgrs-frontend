import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import IndustrialUtilitarianCard from '@/components/ui/experimental-cards/IndustrialUtilitarianCard';

vi.mock('@/hooks/useIntersectionObserver', () => ({
  useIntersectionObserver: () => {
    const ref = { current: null };
    return [ref, true] as const;
  },
}));

describe('IndustrialUtilitarianCard', () => {
  const defaultProps = {
    title: 'Test Card Title',
    description: 'Test card description text',
    href: '/test-page',
  };

  it('renders title and description', () => {
    render(<IndustrialUtilitarianCard {...defaultProps} />);
    expect(screen.getByText('Test Card Title')).toBeInTheDocument();
    expect(screen.getByText('Test card description text')).toBeInTheDocument();
  });

  it('renders link with correct href', () => {
    render(<IndustrialUtilitarianCard {...defaultProps} />);
    const link = screen.getByRole('link', { name: /test card title/i });
    expect(link).toHaveAttribute('href', '/test-page');
  });

  it('displays system ID badge', () => {
    render(<IndustrialUtilitarianCard {...defaultProps} />);
    const idBadge = document.querySelector('.font-mono.text-\\[10px\\]');
    expect(idBadge?.textContent).toMatch(/^ID-SYS-0[1-9]$/);
  });

  it('system ID is deterministic across renders', () => {
    const { container: firstRender } = render(<IndustrialUtilitarianCard {...defaultProps} />);
    const firstIdBadge = firstRender.querySelector('.font-mono.text-\\[10px\\]');
    const firstIdText = firstIdBadge?.textContent;

    const { container: secondRender } = render(<IndustrialUtilitarianCard {...defaultProps} />);
    const secondIdBadge = secondRender.querySelector('.font-mono.text-\\[10px\\]');
    const secondIdText = secondIdBadge?.textContent;

    expect(firstIdText).toBe(secondIdText);
  });

  it('renders with icon when provided', () => {
    render(<IndustrialUtilitarianCard {...defaultProps} icon="arrow-right" />);
    const iconContainer = document.querySelector('.shrink-0.border-2');
    expect(iconContainer).toBeInTheDocument();
  });

  it('renders with image when provided', () => {
    render(<IndustrialUtilitarianCard {...defaultProps} image="/test-image.jpg" />);
    const imageContainer = document.querySelector('.relative.w-full.border-2');
    expect(imageContainer).toBeInTheDocument();
  });

  it('applies large variant classes when variant is large', () => {
    render(<IndustrialUtilitarianCard {...defaultProps} variant="large" />);
    const card = screen.getByRole('link');
    expect(card).toHaveClass('col-span-1', 'md:col-span-2', 'md:row-span-2');
  });

  it('does not use transition: all class', () => {
    render(<IndustrialUtilitarianCard {...defaultProps} />);
    const card = screen.getByRole('link');
    const className = card.className;
    expect(className).not.toContain('transition-all');
  });

  it('renders at standard variant by default', () => {
    render(<IndustrialUtilitarianCard {...defaultProps} />);
    const card = screen.getByRole('link');
    expect(card).not.toHaveClass('col-span-1', 'md:col-span-2', 'md:row-span-2');
  });
});
