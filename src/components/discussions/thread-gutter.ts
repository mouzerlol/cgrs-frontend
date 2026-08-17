/**
 * The thread card's left gutter — one definition, used by every row that lines up with it.
 *
 * The category plate is the gutter column and carries the rule on its right edge; the title sits
 * just past the rule, and the byline and body indent to that same edge so the card reads as one
 * column of text rather than three loose rows.
 *
 * The width and the indent are two numbers that must stay equal, and they were written out twice
 * in two files. Widening the column to fit ANNOUNCEMENTS moved the title 16px right and left the
 * byline and body behind, which is what a hard-coded copy of a measurement always eventually does.
 * Change the gutter here and every row follows.
 *
 * Written as whole Tailwind class strings, not composed at runtime, so the compiler still sees
 * them in the source and emits the CSS.
 */

/** The category column itself: 9rem, sized to hold the longest label on one line. */
export const THREAD_GUTTER_COLUMN = 'sm:w-36';

/** The air between the label and the rule. Part of the indent below. */
export const THREAD_GUTTER_RULE_GAP = 'sm:pr-5';

/**
 * The indent every row below the title takes: the column plus the gap, so the text starts on the
 * title's left edge. Equal to `sm:w-36` + `sm:pr-5` = 9rem + 1.25rem.
 */
export const THREAD_GUTTER_INDENT = 'sm:pl-[calc(9rem_+_1.25rem)]';
