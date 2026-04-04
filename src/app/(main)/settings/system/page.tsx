'use client';

import { useState } from 'react';
import { Settings, AlertCircle } from 'lucide-react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useAllFeatureFlags, useFeatureFlagContext } from '@/hooks/useFeatureFlag';
import { canAccessManagement } from '@/lib/auth';
import {
  FEATURE_FLAG_IDS,
  FLAG_LABELS,
  FLAG_GROUPS,
  type FeatureFlagId,
  type FlagGroup,
} from '@/lib/feature-flags';
import Button from '@/components/ui/Button';
import { SectionLabel } from '@/components/ui/SectionLabel';
import PageHeader from '@/components/sections/PageHeader';
import Layout from '@/components/layout/Layout';

interface FlagCardProps {
  flagId: FeatureFlagId;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  isUpdating: boolean;
}

function FlagCard({ flagId, enabled, onToggle, isUpdating }: FlagCardProps) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-white/50 p-4 border border-sage/20">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-forest truncate">{FLAG_LABELS[flagId]}</p>
        <p className="text-sm text-forest/60">{flagId}</p>
      </div>
      <button
        type="button"
        onClick={() => onToggle(!enabled)}
        disabled={isUpdating}
        className={`
          relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent
          transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2
          focus-visible:ring-sage focus-visible:ring-offset-2
          ${enabled ? 'bg-sage' : 'bg-bone/50'}
          ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        role="switch"
        aria-checked={enabled}
        aria-label={`Toggle ${FLAG_LABELS[flagId]}`}
      >
        <span
          className={`
            pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg
            ring-0 transition duration-200 ease-in-out
            ${enabled ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </button>
    </div>
  );
}

interface FlagGroupSectionProps {
  group: FlagGroup;
  flags: readonly FeatureFlagId[];
  flagValues: Record<string, boolean>;
  onToggle: (flagId: string, enabled: boolean) => Promise<void>;
  updatingFlags: Set<string>;
}

function FlagGroupSection({ group, flags, flagValues, onToggle, updatingFlags }: FlagGroupSectionProps) {
  const groupLabels: Record<FlagGroup, string> = {
    navigation: 'Navigation',
    footer: 'Footer',
    homepage: 'Homepage',
    profile: 'Profile',
  };

  return (
    <section className="mb-8">
      <SectionLabel as="h3" className="mb-4">
        {groupLabels[group]}
      </SectionLabel>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {flags.map((flagId) => (
          <FlagCard
            key={flagId}
            flagId={flagId}
            enabled={flagValues[flagId] ?? true}
            onToggle={(enabled) => onToggle(flagId, enabled)}
            isUpdating={updatingFlags.has(flagId)}
          />
        ))}
      </div>
    </section>
  );
}

function NoAccessContent() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 rounded-full bg-terracotta/10 p-4">
        <AlertCircle className="h-12 w-12 text-terracotta" />
      </div>
      <h1 className="mb-2 font-display text-2xl text-forest">Access Denied</h1>
      <p className="mb-6 max-w-md text-forest/70">
        You do not have permission to access System Settings. This area is only available to committee
        members, the committee chairperson, and superadmins.
      </p>
      <Button variant="outline" onClick={() => (window.location.href = '/')}>
        Return Home
      </Button>
    </div>
  );
}

function LoadingContent() {
  return (
    <div className="space-y-4 py-12">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-20 animate-pulse rounded-xl bg-bone/50" />
      ))}
    </div>
  );
}

export default function SystemSettingsPage() {
  const { data: currentUser, isLoading: isUserLoading } = useCurrentUser();
  const featureFlags = useAllFeatureFlags();
  const { updateFlag } = useFeatureFlagContext();
  const [updatingFlags, setUpdatingFlags] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const isLoading = isUserLoading;
  const isFlagsLoading = Object.keys(featureFlags).length === 0;

  const role = currentUser?.membership?.role;
  const isSuperadmin = currentUser?.is_superadmin ?? false;
  const hasAccess = canAccessManagement(role, isSuperadmin);

  const handleToggle = async (flagId: string, enabled: boolean) => {
    setUpdatingFlags((prev) => new Set(prev).add(flagId));
    setError(null);

    try {
      await updateFlag(flagId, enabled);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update flag');
    } finally {
      setUpdatingFlags((prev) => {
        const next = new Set(prev);
        next.delete(flagId);
        return next;
      });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <PageHeader title="System Settings" description="Configure feature visibility" />
          <LoadingContent />
        </div>
      </Layout>
    );
  }

  if (!hasAccess) {
    return (
      <Layout>
        <div className="container mx-auto px-4">
          <NoAccessContent />
        </div>
      </Layout>
    );
  }

  if (isFlagsLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <PageHeader title="System Settings" description="Configure feature visibility" />
          <LoadingContent />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title="System Settings"
          description="Control which features are visible in the navigation and across the site"
        />

        {error && (
          <div className="mb-6 rounded-lg bg-terracotta/10 border border-terracotta/20 p-4 text-terracotta">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </div>
        )}

        <div className="mb-6 flex items-center justify-between rounded-xl bg-sage/10 p-4 border border-sage/20">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-sage/20 p-2">
              <Settings className="h-5 w-5 text-sage" />
            </div>
            <div>
              <p className="font-medium text-forest">Feature Flags</p>
              <p className="text-sm text-forest/60">
                Toggle features on or off. Changes apply immediately to navigation and UI.
              </p>
            </div>
          </div>
        </div>

        <FlagGroupSection
          group="navigation"
          flags={FLAG_GROUPS.navigation}
          flagValues={featureFlags}
          onToggle={handleToggle}
          updatingFlags={updatingFlags}
        />

        <FlagGroupSection
          group="footer"
          flags={FLAG_GROUPS.footer}
          flagValues={featureFlags}
          onToggle={handleToggle}
          updatingFlags={updatingFlags}
        />

        <FlagGroupSection
          group="homepage"
          flags={FLAG_GROUPS.homepage}
          flagValues={featureFlags}
          onToggle={handleToggle}
          updatingFlags={updatingFlags}
        />

        <FlagGroupSection
          group="profile"
          flags={FLAG_GROUPS.profile}
          flagValues={featureFlags}
          onToggle={handleToggle}
          updatingFlags={updatingFlags}
        />
      </div>
    </Layout>
  );
}
