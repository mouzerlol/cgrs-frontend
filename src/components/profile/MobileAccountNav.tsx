'use client';

import DrawerShell from '@/components/shared/DrawerShell';
import ProfileSideNav from './ProfileSideNav';
import type { CurrentUserResponse } from '@/hooks/useCurrentUser';

interface MobileAccountNavProps {
  open: boolean;
  onClose: () => void;
  activeCategory: string | null;
  onCategoryChange: (id: string) => void;
  hasPendingVerification: boolean;
  canViewSociety: boolean;
  canViewGroundReport?: boolean;
  user?: CurrentUserResponse['user'];
  membership?: CurrentUserResponse['membership'];
  clerkFallback?: { firstName?: string; lastName?: string; imageUrl?: string; email?: string };
}

/**
 * Slide-in account navigation for screens below `lg`, where the folder-tab
 * sidebar is hidden. Reuses ProfileSideNav (mobile variant) so the items,
 * icons, badges and feature-flag logic stay single-source, inside the shared
 * DrawerShell which owns the overlay, animation and accessibility behaviour.
 * Selecting an item navigates and closes the drawer.
 */
export default function MobileAccountNav({
  open,
  onClose,
  activeCategory,
  onCategoryChange,
  hasPendingVerification,
  canViewSociety,
  canViewGroundReport = false,
  user,
  membership,
  clerkFallback,
}: MobileAccountNavProps) {
  return (
    <DrawerShell open={open} onClose={onClose} title="Account" ariaLabel="Account navigation" id="account-mobile-nav">
      <ProfileSideNav
        variant="mobile"
        activeCategory={activeCategory}
        onCategoryChange={onCategoryChange}
        onNavigate={onClose}
        hasPendingVerification={hasPendingVerification}
        canViewSociety={canViewSociety}
        canViewGroundReport={canViewGroundReport}
        user={user}
        membership={membership}
        clerkFallback={clerkFallback}
      />
    </DrawerShell>
  );
}
