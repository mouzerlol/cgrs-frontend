'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type EasterEggPhase = 'idle' | 'active';

interface EasterEggContextValue {
  phase: EasterEggPhase;
  trigger: () => void;
}

const EasterEggContext = createContext<EasterEggContextValue>({
  phase: 'idle',
  trigger: () => {},
});

const EASTER_EGG_DURATION = 4000;

/**
 * Provider for the Easter egg animation state.
 * Wrap the app with this to allow Header to trigger and Hero to respond.
 */
export function EasterEggProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<EasterEggPhase>('idle');

  const trigger = useCallback(() => {
    if (phase !== 'idle') return;

    setPhase('active');

    setTimeout(() => {
      setPhase('idle');
    }, EASTER_EGG_DURATION);
  }, [phase]);

  return (
    <EasterEggContext.Provider value={{ phase, trigger }}>
      {children}
    </EasterEggContext.Provider>
  );
}

/**
 * Hook to access the easter egg animation state and trigger.
 */
export function useEasterEggContext() {
  return useContext(EasterEggContext);
}