import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrutallyMinimalHeroHeadingCard } from '@/components/sections/BrutallyMinimalHeroHeadingCard';

describe('BrutallyMinimalHeroHeadingCard', () => {
  describe('headingLevel prop', () => {
    it('renders h1 by default', () => {
      render(
        <BrutallyMinimalHeroHeadingCard
          title="Test Title"
          description="Test description"
        />
      );

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Test Title');
    });

    it('renders h1 when headingLevel is explicitly set to h1', () => {
      render(
        <BrutallyMinimalHeroHeadingCard
          title="Test Title"
          headingLevel="h1"
        />
      );

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
    });

    it('renders div instead of h1 when headingLevel is div', () => {
      render(
        <BrutallyMinimalHeroHeadingCard
          title="Test Title"
          headingLevel="div"
        />
      );

      // Should not find an h1
      const h1 = document.querySelector('h1');
      expect(h1).not.toBeInTheDocument();

      // Should find a div with the title text
      const div = document.querySelector('div');
      expect(div).toBeInTheDocument();
      expect(div).toHaveTextContent('Test Title');
    });

    it('renders same visible text regardless of headingLevel', () => {
      const { rerender } = render(
        <BrutallyMinimalHeroHeadingCard
          title="Community Discussion"
          description="Connect with neighbors"
          headingLevel="h1"
        />
      );

      const h1Text = screen.getByText('Community Discussion').textContent;

      rerender(
        <BrutallyMinimalHeroHeadingCard
          title="Community Discussion"
          description="Connect with neighbors"
          headingLevel="div"
        />
      );

      const divText = screen.getByText('Community Discussion').textContent;
      expect(divText).toBe(h1Text);
    });

    it('renders description when headingLevel is div', () => {
      render(
        <BrutallyMinimalHeroHeadingCard
          title="Discussion"
          description="Connect with neighbors"
          headingLevel="div"
        />
      );

      expect(screen.getByText('Connect with neighbors')).toBeInTheDocument();
    });
  });
});
