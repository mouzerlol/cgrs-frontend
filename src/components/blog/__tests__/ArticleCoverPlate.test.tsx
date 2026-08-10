import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ArticleCoverPlate from '../ArticleCoverPlate';
import type { PostHero } from '@/lib/blog/types';
import { toTitleCase } from '@/lib/blog/title-case';

vi.mock('next/image', () => ({
  default: function MockImage(props: Record<string, unknown>) {
    const { fill, priority, sizes, unoptimized, alt, ...rest } = props;
    return <img {...rest} alt={typeof alt === 'string' ? alt : ''} />;
  },
}));

const hero: PostHero = {
  url: '/a.webp',
  width: 1600,
  height: 900,
  alt: 'The Manukau seen from the western slope',
  caption: 'North over the Manukau from the western slope.',
  credit: 'Photograph by the committee',
};

describe('ArticleCoverPlate', () => {
  it('renders nothing when the post carries neither a photograph nor a rail', () => {
    const { container } = render(<ArticleCoverPlate />);
    expect(container).toBeEmptyDOMElement();
  });

  it('still renders the column for a post with no photograph but facts to show', () => {
    // A post without a hero is ordinary, and its meta rail is not conditional
    // on one.
    // One per layout, as with a photograph: the column at xl and the block
    // below it. Only one is displayed at a given width.
    render(<ArticleCoverPlate railMeta={<p>By the committee</p>} />);
    expect(screen.getAllByText('By the committee')).toHaveLength(2);
  });

  it('names the control by what opening it does', () => {
    render(<ArticleCoverPlate hero={hero} />);
    // One control per layout: the column at xl and the strip below it. Both are
    // in the DOM; only one is displayed at a given width.
    expect(
      screen.getAllByRole('button', {
        name: `View the hero photograph full size: ${hero.caption}`,
      })
    ).toHaveLength(2);
  });

  it('draws the photograph as a print rather than an empty aperture', () => {
    render(<ArticleCoverPlate hero={hero} />);
    // Duotone is a crossfade between two copies of the same picture, so the
    // figure carries the described one and a decorative twin under the filter.
    expect(screen.getAllByAltText(hero.alt).length).toBeGreaterThan(0);
  });

  it('shows the caption and its credit on the ledge, set in title case', () => {
    render(<ArticleCoverPlate hero={hero} />);
    expect(screen.getAllByText(toTitleCase(hero.caption!))).toHaveLength(2);
    // Set copy, not the author's line: what was typed is not what is shown.
    expect(screen.queryByText(hero.caption!)).toBeNull();
    expect(screen.getAllByText(hero.credit!)).toHaveLength(2);
    expect(screen.queryByText('Cover')).toBeNull();
  });

  it('falls back to the alt text when a hero carries no caption', () => {
    render(<ArticleCoverPlate hero={{ ...hero, caption: null, credit: null }} />);
    expect(screen.getAllByText(toTitleCase(hero.alt)).length).toBeGreaterThan(0);
  });

  it('opens the lightbox on the hero alone', async () => {
    const user = userEvent.setup();
    render(<ArticleCoverPlate hero={hero} />);

    await user.click(
      screen.getAllByRole('button', {
        name: `View the hero photograph full size: ${hero.caption}`,
      })[0]
    );

    const dialog = await screen.findByRole('dialog');
    // The bar the print opens onto carries the same set line as the ledge.
    expect(within(dialog).getByText(toTitleCase(hero.caption!))).toBeInTheDocument();
    expect(within(dialog).queryByLabelText('Show image 2')).toBeNull();
  });

  it('renders the rail below the print in both layouts', () => {
    render(<ArticleCoverPlate hero={hero} railMeta={<p>Reading time 4 min</p>} />);

    // The facts run at every width, and in the same order relative to the print
    // in both: the print is the object, the facts are its label.
    const rails = screen.getAllByText('Reading time 4 min');
    expect(rails).toHaveLength(2);

    const prints = screen.getAllByRole('figure');
    expect(prints).toHaveLength(2);
    rails.forEach((rail, index) => {
      expect(
        prints[index].compareDocumentPosition(rail) & Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy();
    });
  });
});
