'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import QRScanResult from './QRScanResult';
import { scanQRCode } from '@/lib/api/verification';

interface QRScanClientProps {
  token: string;
}

type ScanState = 'loading' | 'success' | 'error';

export default function QRScanClient({ token }: QRScanClientProps) {
  const { getToken, isLoaded } = useAuth();
  const router = useRouter();
  const [state, setState] = useState<ScanState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [roleAssigned, setRoleAssigned] = useState<string | null>(null);

  useEffect(() => {
    async function handleScan() {
      if (!isLoaded) return;

      try {
        const jwtToken = await getToken();
        if (!jwtToken) {
          // Not authenticated - redirect to login with return URL
          const returnUrl = encodeURIComponent(`/verify/scan/${token}`);
          router.push(`/login/?redirect_url=${returnUrl}`);
          return;
        }

        const result = await scanQRCode(token, async () => jwtToken);
        setRoleAssigned(result.role_assigned);
        setState('success');

        // Redirect to profile after a short delay
        setTimeout(() => {
          router.push('/profile');
        }, 3000);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Verification failed');
        setState('error');
      }
    }

    handleScan();
  }, [token, isLoaded, getToken, router]);

  return (
    <QRScanResult
      state={state}
      error={error}
      roleAssigned={roleAssigned}
      onRetry={() => router.refresh()}
    />
  );
}
