import type { CardFamilyComponent } from '../kit';
import Option01RuleDeck from './Option01RuleDeck';
import Option02TonalFooter from './Option02TonalFooter';
import Option03DateStamp from './Option03DateStamp';
import Option04Byline from './Option04Byline';
import Option05PlateChip from './Option05PlateChip';
import Option06Ledger from './Option06Ledger';
import Option07SageInset from './Option07SageInset';
import Option08Ascender from './Option08Ascender';
import Option09Filed from './Option09Filed';
import Option10RedLetter from './Option10RedLetter';
import Option11QuietBone from './Option11QuietBone';
import Option12SageBase from './Option12SageBase';
import Option13RedEyebrow from './Option13RedEyebrow';
import Option14AmberRecord from './Option14AmberRecord';
import Option15DeepFooter from './Option15DeepFooter';

export interface CardFamilyOption {
  id: string;
  number: string;
  name: string;
  /** One line: the thing this option is actually testing. */
  hypothesis: string;
  /** Set when the option knowingly breaks a named DESIGN.md rule. */
  stretch?: string;
  /** Set on the first option of a round; renders a divider above it. */
  groupLabel?: string;
  groupNote?: string;
  /** Set on the option that was promoted into production. */
  shipped?: boolean;
  Component: CardFamilyComponent;
}

export const CARD_FAMILY_OPTIONS: CardFamilyOption[] = [
  {
    id: 'rule-deck',
    number: '01',
    name: 'Rule Deck',
    hypothesis:
      'Two hairlines instead of two containers. Header carries what it is, footer carries when and who.',
    Component: Option01RuleDeck,
  },
  {
    id: 'tonal-footer',
    number: '02',
    name: 'Tonal Footer',
    hypothesis:
      'Metadata stops competing with the title once it stands on different ground: a sage band welded to the bottom edge.',
    Component: Option02TonalFooter,
  },
  {
    id: 'date-stamp',
    number: '03',
    name: 'Date Stamp',
    hypothesis:
      'On a noticeboard, when is the second question. A numeral answers it faster than a sentence, and matches how events are filed.',
    Component: Option03DateStamp,
  },
  {
    id: 'byline',
    number: '04',
    name: 'Byline',
    hypothesis:
      'Newspaper furniture: a terracotta full stop for the section, the title at full weight, a hairline-divided byline underneath.',
    Component: Option04Byline,
  },
  {
    id: 'plate-chip',
    number: '05',
    name: 'Plate Chip',
    hypothesis:
      'The text block reads fastest when it holds nothing but text. Both metadata values move onto the picture as opaque paper chips.',
    Component: Option05PlateChip,
  },
  {
    id: 'ledger',
    number: '06',
    name: 'Ledger',
    hypothesis:
      'Make everything but the title stop pretending to be prose. Three aligned key/value rows in fixed-width type.',
    Component: Option06Ledger,
  },
  {
    id: 'sage-inset',
    number: '07',
    name: 'Sage Inset',
    hypothesis:
      'Three tones doing the work three type sizes were doing alone. The excerpt drops into a well as quoted, not primary, text.',
    Component: Option07SageInset,
  },
  {
    id: 'ascender',
    number: '08',
    name: 'Ascender',
    hypothesis:
      'Maximum contrast and maximum air. Title at nearly 3x everything else; the whole record collapses to one 10px line under a short rule.',
    Component: Option08Ascender,
  },
  {
    id: 'filed',
    number: '09',
    name: 'Filed',
    hypothesis:
      'The management identity applied to a blog that is, in fact, a record: square corners, forest header bar, mono footer.',
    stretch: 'Breaks the Dual Radius Doctrine. Adopting it moves the blog across the identity line.',
    Component: Option09Filed,
  },
  {
    id: 'red-letter',
    number: '10',
    name: 'Red Letter',
    hypothesis:
      'Terracotta earns a band rather than an eyebrow, and the rest of the card then needs no accent at all.',
    stretch:
      'Spends the One Voice Rule on card chrome. Type on the band is forest, not bone, because bone on terracotta misses AA.',
    Component: Option10RedLetter,
  },
  {
    id: 'quiet-bone',
    number: '11',
    name: 'Quiet Bone',
    groupLabel: 'Round two: one frame, five tunings',
    groupNote:
      'Structure is fixed from here: plate to the card edges, image left on the listing row, reading time as a chip on the picture, author left and date right in a footer band. These five differ only in colour, scale and weight, so any difference you see is the tuning and not the layout.',
    hypothesis:
      'The restrained reading. No colour beyond the neutrals; the widest tracking in the set on the smallest label.',
    Component: Option11QuietBone,
  },
  {
    id: 'sage-base',
    number: '12',
    name: 'Sage Base',
    hypothesis:
      'Weight instead of colour. Title at Fraunces 500, excerpt a shade darker, footer moved from paper to sage.',
    Component: Option12SageBase,
  },
  {
    id: 'red-eyebrow',
    number: '13',
    name: 'Red Eyebrow',
    hypothesis:
      'One accent, spent on the smallest mark. The footer gives up its fill so nothing competes with it.',
    shipped: true,
    Component: Option13RedEyebrow,
  },
  {
    id: 'amber-record',
    number: '14',
    name: 'Amber Record',
    hypothesis:
      'Widest type range: 24px title against a 12px excerpt, with amber on the two metadata glyphs and nowhere else.',
    Component: Option14AmberRecord,
  },
  {
    id: 'deep-footer',
    number: '15',
    name: 'Deep Footer',
    hypothesis:
      'Solid forest-light footer with bone type. The card is weighted at the bottom and the record reads as a plate it stands on.',
    stretch:
      'Inverts forest inside one component: ink in the title, surface in the footer. Adopting it means amending the Forest Inversion Rule.',
    Component: Option15DeepFooter,
  },
];
