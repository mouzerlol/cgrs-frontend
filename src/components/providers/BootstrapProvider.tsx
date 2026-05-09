'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useBootstrap } from '@/hooks/useBootstrap';

interface BootstrapContextValue {
  isBootstrapReady: boolean;
}

const BootstrapContext = createContext<BootstrapContextValue>({ isBootstrapReady: false });

export function BootstrapProvider({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const { data, isError } = useBootstrap();
  const [isBootstrapReady, setIsBootstrapReady] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    // Signed-out users are never gated — no bootstrap needed.
    if (!isSignedIn) {
      setIsBootstrapReady(true);
      return;
    }
    // Bootstrap resolved (success or cached) or failed — unblock hooks either way.
    if (data !== undefined || isError) {
      setIsBootstrapReady(true);
    }
  }, [isLoaded, isSignedIn, data, isError]);

  return (
    <BootstrapContext.Provider value={{ isBootstrapReady }}>
      {children}
    </BootstrapContext.Provider>
  );
}

export function useBootstrapReady(): boolean {
  return useContext(BootstrapContext).isBootstrapReady;
}
