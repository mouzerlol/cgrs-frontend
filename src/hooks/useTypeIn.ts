'use client';

import { useEffect, useState } from 'react';

/**
 * Reveal a string one character at a time over `perCharMs` per character.
 * Used by the cold-start banner's "slow letter" effect.
 *
 * If `skip` is true (reduced motion, or already-played) the full string is
 * returned immediately and the hook reports as complete.
 */
export function useTypeIn(
  target: string,
  perCharMs: number,
  skip: boolean,
): { text: string; isComplete: boolean } {
  const [text, setText] = useState(skip ? target : '');

  useEffect(() => {
    if (skip) {
      setText(target);
      return;
    }
    setText('');
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setText(target.slice(0, i));
      if (i >= target.length) clearInterval(id);
    }, perCharMs);
    return () => clearInterval(id);
  }, [target, perCharMs, skip]);

  return { text, isComplete: text.length >= target.length };
}
