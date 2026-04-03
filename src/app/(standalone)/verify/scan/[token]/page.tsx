import type { Metadata } from 'next';
import QRScanClient from '@/components/verify/QRScanClient';

export const metadata: Metadata = {
  title: 'Verify Property | Coronation Gardens',
  description: 'Scan QR code to verify your property address.',
};

export default async function QRScanPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <QRScanClient token={token} />
      </div>
    </div>
  );
}
