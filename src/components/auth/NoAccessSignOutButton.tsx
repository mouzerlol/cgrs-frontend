'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth, useClerk } from '@clerk/nextjs';
import Button from '@/components/ui/Button';
import { getAfterSignOutUrl } from '@/lib/app-url';

/**
 * No-access recovery: clears Clerk session when one exists, then always navigates to /login with
 * redirect_url. If the user was never signed in (or the session is already invalid), we skip
 * signOut and go straight to login — signOut alone does not redirect in that case.
 */
export default function NoAccessSignOutButton() {
  const { signOut } = useClerk();
  const { isSignedIn, isLoaded } = useAuth();
  const [loginUrl, setLoginUrl] = useState(() => getAfterSignOutUrl());
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const o = window.location.origin;
    setLoginUrl(`${o}/login/?redirect_url=${encodeURIComponent(`${o}/`)}`);
  }, []);

  const goToLogin = useCallback(() => {
    window.location.assign(loginUrl);
  }, [loginUrl]);

  const onClick = useCallback(async () => {
    if (pending) return;
    setPending(true);
    try {
      if (isLoaded && isSignedIn) {
        await signOut();
      }
    } catch {
      // Stale or broken session; still send user to login.
    }
    goToLogin();
  }, [goToLogin, isLoaded, isSignedIn, pending, signOut]);

  return (
    <Button variant="primary" type="button" disabled={pending} onClick={() => void onClick()}>
      {pending ? 'Redirecting…' : 'Sign out and sign in again'}
    </Button>
  );
}
