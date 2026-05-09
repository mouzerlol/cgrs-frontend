'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Download, ScrollText } from 'lucide-react';
import WorkManagementNavBar from '@/components/work-management/WorkManagementNavBar';
import Card from '@/components/ui/Card';
import SignaturesTable from '@/components/work-management/SignaturesTable';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { downloadSignaturesCsv, getAdminSignatures } from '@/lib/api/petition';

export default function SignaturesPage() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { data: currentUser, isLoading: isUserLoading } = useCurrentUser();
  const isSuperadmin = currentUser?.is_superadmin ?? false;
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloadError(null);
    setIsDownloading(true);
    try {
      await downloadSignaturesCsv(getToken);
    } catch {
      setDownloadError('Failed to download CSV. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const {
    data: response,
    isLoading: isSignaturesLoading,
  } = useQuery({
    queryKey: ['admin', 'petition-signatures'],
    queryFn: () => getAdminSignatures(getToken),
    enabled: isLoaded && isSignedIn && isSuperadmin,
  });

  if (!isLoaded || isUserLoading) {
    return (
      <div className="h-full w-full overflow-hidden flex flex-col bg-bone">
        <WorkManagementNavBar
          title="Signatures"
          showBackButton
          backHref="/work-management"
          backLabel="Work Management"
        />
        <main className="flex-1 min-h-0 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-6 md:p-8 lg:p-12">
            <div className="bg-white p-6">
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 rounded-lg bg-sage/10 animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!isSignedIn || !isSuperadmin) {
    return (
      <div className="h-full w-full overflow-hidden flex flex-col bg-bone">
        <WorkManagementNavBar
          title="Signatures"
          showBackButton
          backHref="/work-management"
          backLabel="Work Management"
        />
        <main className="flex-1 min-h-0 overflow-y-auto flex items-center justify-center">
          <Card variant="sage" className="p-12 text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="font-display text-2xl text-forest mb-2">Access Denied</h2>
            <p className="text-forest/60">
              {isSignedIn
                ? 'This page is restricted to superadmins.'
                : 'You need to be signed in to view this page.'}
            </p>
          </Card>
        </main>
      </div>
    );
  }

  const signatures = response?.signatures ?? [];

  return (
    <div className="h-full w-full overflow-hidden flex flex-col bg-bone">
      <WorkManagementNavBar
        title="Signatures"
        showBackButton
        backHref="/work-management"
        backLabel="Work Management"
      />

      <main className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 md:p-8 lg:p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white overflow-hidden">
              <div className="px-6 py-5 border-b border-sage/20 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-terracotta/10 flex items-center justify-center">
                    <ScrollText className="w-5 h-5 text-terracotta" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl text-forest">Petition Signatures</h2>
                    <p className="text-sm text-forest/50">
                      {signatures.length} signatures collected
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button
                    type="button"
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-forest text-bone text-sm font-medium hover:bg-forest/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    {isDownloading ? 'Downloading…' : 'Download CSV'}
                  </button>
                  {downloadError && (
                    <p className="text-xs text-terracotta">{downloadError}</p>
                  )}
                </div>
              </div>

              {isSignaturesLoading ? (
                <div className="p-6">
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="h-16 rounded-lg bg-sage/10 animate-pulse" />
                    ))}
                  </div>
                </div>
              ) : (
                <SignaturesTable signatures={signatures} />
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
