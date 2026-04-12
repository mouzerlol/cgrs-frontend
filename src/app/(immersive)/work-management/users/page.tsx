'use client';

import { useAuth } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users as UsersIcon } from 'lucide-react';
import WorkManagementNavBar from '@/components/work-management/WorkManagementNavBar';
import Card from '@/components/ui/Card';
import UsersTable from '@/components/work-management/UsersTable';
import { getAdminUsers } from '@/lib/api/admin';

export default function UsersPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => getAdminUsers(getToken),
    enabled: isLoaded && isSignedIn,
  });

  if (!isLoaded) {
    return (
      <div className="h-full w-full overflow-hidden flex flex-col bg-bone">
        <WorkManagementNavBar
          title="Users"
          showBackButton
          backHref="/work-management"
          backLabel="Work Management"
        />
        <main className="flex-1 min-h-0 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-6 md:p-8 lg:p-12">
            <div className="bg-white rounded-[20px] p-6">
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

  if (!isSignedIn) {
    return (
      <div className="h-full w-full overflow-hidden flex flex-col bg-bone">
        <WorkManagementNavBar
          title="Users"
          showBackButton
          backHref="/work-management"
          backLabel="Work Management"
        />
        <main className="flex-1 min-h-0 overflow-y-auto flex items-center justify-center">
          <Card variant="sage" className="p-12 text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="font-display text-2xl text-forest mb-2">Access Denied</h2>
            <p className="text-forest/60">
              You need to be signed in to view this page
            </p>
          </Card>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full w-full overflow-hidden flex flex-col bg-bone">
        <WorkManagementNavBar
          title="Users"
          showBackButton
          backHref="/work-management"
          backLabel="Work Management"
        />
        <main className="flex-1 min-h-0 overflow-y-auto flex items-center justify-center">
          <Card variant="sage" className="p-12 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="font-display text-2xl text-forest mb-2">Failed to load users</h2>
            <p className="text-forest/60 mb-6">
              Please try refreshing the page
            </p>
          </Card>
        </main>
      </div>
    );
  }

  const users = response?.users ?? [];

  return (
    <div className="h-full w-full overflow-hidden flex flex-col bg-bone">
      <WorkManagementNavBar
        title="Users"
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
            <div className="bg-white rounded-[20px] overflow-hidden">
              <div className="px-6 py-5 border-b border-sage/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-terracotta/10 flex items-center justify-center">
                    <UsersIcon className="w-5 h-5 text-terracotta" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl text-forest">All Users</h2>
                    <p className="text-sm text-forest/50">
                      {users.length} {users.length === 1 ? 'member' : 'members'} in your community
                    </p>
                  </div>
                </div>
              </div>

              {isLoading ? (
                <div className="p-6">
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="h-16 rounded-lg bg-sage/10 animate-pulse" />
                    ))}
                  </div>
                </div>
              ) : (
                <UsersTable users={users} />
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
