import { describe, expect, it } from 'vitest';
import { toTitleCase } from '../title-case';

describe('toTitleCase', () => {
  it('capitalises the first letter of every word', () => {
    expect(toTitleCase('test blog')).toBe('Test Blog');
  });

  it('overrides an author shouting the title', () => {
    expect(toTitleCase('TEST BLOG')).toBe('Test Blog');
  });

  it('overrides mixed casing', () => {
    expect(toTitleCase('tEsT bLOG pOst')).toBe('Test Blog Post');
  });

  it('capitalises small words too', () => {
    expect(toTitleCase('a note on the state of the gardens')).toBe(
      'A Note On The State Of The Gardens',
    );
  });

  it('keeps apostrophes inside a word', () => {
    expect(toTitleCase("don't panic")).toBe("Don't Panic");
    expect(toTitleCase('the residents’ meeting')).toBe('The Residents’ Meeting');
  });

  it('capitalises both halves of a hyphenated word', () => {
    expect(toTitleCase('a well-known problem')).toBe('A Well-Known Problem');
  });

  it('leaves punctuation and spacing alone', () => {
    expect(toTitleCase('notice: the AGM (2026) — what changed?')).toBe(
      'Notice: The AGM (2026) — What Changed?',
    );
  });

  it('keeps listed acronyms upper case whatever the author typed', () => {
    expect(toTitleCase('cgrs and nz law')).toBe('CGRS And NZ Law');
  });

  it('handles an empty title', () => {
    expect(toTitleCase('')).toBe('');
  });
});
