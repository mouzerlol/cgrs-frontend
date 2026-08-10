'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Building2, FileText, Landmark, LayoutGrid, ClipboardList, MapPinned, Newspaper, Scale, ScrollText, ShieldCheck, Users } from 'lucide-react';
import WorkManagementNavBar from '@/components/work-management/WorkManagementNavBar';
import { BrutallyMinimalHubCard } from '@/components/ui/experimental-cards/BrutallyMinimalWorkCards';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { isVerificationReviewer } from '@/hooks/useVerificationReview';
import { canAccessManagement } from '@/lib/auth';
import portfoliosData from '@/data/portfolios.json';
import boardsData from '@/data/boards.json';
import decisionsData from '@/data/decisions.json';

type HubFeature = {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color: 'forest' | 'terracotta' | 'sage' | 'amber';
  count?: number;
  countLabel?: string;
};

const baseFeatures: HubFeature[] = [
  {
    id: 'users',
    name: 'Users',
    description: 'View and manage community members, roles, and verification status',
    icon: Users,
    href: '/admin/users',
    color: 'forest' as const,
  },
  {
    id: 'portfolios',
    name: 'Portfolios',
    description: 'Define ownership, scope, and services for each area of committee work',
    icon: ClipboardList,
    href: '/admin/portfolios',
    color: 'terracotta' as const,
    count: portfoliosData.portfolios.length,
    countLabel: 'portfolios',
  },
  {
    id: 'boards',
    name: 'Boards',
    description: 'Track tasks and manage workflows across your projects',
    icon: LayoutGrid,
    href: '/admin/boards',
    color: 'sage' as const,
    count: boardsData.boards.length,
    countLabel: 'boards',
  },
  {
    id: 'decisions',
    name: 'Decision Register',
    description: 'Record and track formal committee resolutions and motions',
    icon: Scale,
    href: '/admin/decisions',
    color: 'amber' as const,
    count: decisionsData.resolutions.length,
    countLabel: 'resolutions',
  },
];

const signaturesFeature: HubFeature = {
  id: 'signatures',
  name: 'Signatures',
  description: 'Review and export petition signatures collected from residents',
  icon: ScrollText,
  href: '/admin/signatures',
  color: 'terracotta',
};

const verificationsFeature: HubFeature = {
  id: 'verifications',
  name: 'Verifications',
  description: 'Review pending resident & owner verification requests and manage property members',
  icon: ShieldCheck,
  href: '/admin/verifications',
  color: 'forest',
};

const propertiesFeature: HubFeature = {
  id: 'properties',
  name: 'Properties',
  description: 'Browse properties and see their verified residents and owners',
  icon: Building2,
  href: '/admin/properties',
  color: 'sage',
};

const societyFeature: HubFeature = {
  id: 'society',
  name: 'Society',
  description: "Maintain the society's incorporated registration record shown to members",
  icon: Landmark,
  href: '/admin/society',
  color: 'forest',
};

const documentsFeature: HubFeature = {
  id: 'documents',
  name: 'Society Documents',
  description: 'Upload and manage governance documents — minutes, agendas, and financial records',
  icon: FileText,
  href: '/admin/documents',
  color: 'sage',
};

const blogFeature: HubFeature = {
  id: 'blog',
  name: 'Blog',
  description: 'Write, preview, and publish posts to the community noticeboard — no deployment needed',
  icon: Newspaper,
  href: '/admin/blog',
  color: 'amber',
};

const groundReportFeature: HubFeature = {
  id: 'ground-report',
  name: 'Ground Report',
  description: 'Author location-tagged photo reports of the development, by zone, for members to view',
  icon: MapPinned,
  href: '/admin/ground-report',
  color: 'terracotta',
};

const colorMap = {
  forest: {
    bg: 'bg-forest/5',
    iconBg: 'bg-forest/10',
    iconColor: 'text-forest',
    border: 'border-forest/20',
    hover: 'hover:shadow-[0_20px_40px_rgba(26,34,24,0.15)] hover:-translate-y-1 hover:border-forest/40',
    badge: 'bg-forest/10 text-forest',
  },
  terracotta: {
    bg: 'bg-[#FBEBE6]',
    iconBg: 'bg-terracotta/10',
    iconColor: 'text-terracotta',
    border: 'border-terracotta/20',
    hover: 'hover:shadow-[0_20px_40px_rgba(217,93,57,0.15)] hover:-translate-y-1 hover:border-terracotta/40',
    badge: 'bg-terracotta/10 text-terracotta-dark',
  },
  sage: {
    bg: 'bg-sage-light',
    iconBg: 'bg-forest/10',
    iconColor: 'text-forest',
    border: 'border-sage/30',
    hover: 'hover:shadow-[0_20px_40px_rgba(168,181,160,0.3)] hover:-translate-y-1 hover:border-sage',
    badge: 'bg-forest/10 text-forest',
  },
  amber: {
    bg: 'bg-amber/10',
    iconBg: 'bg-amber/15',
    iconColor: 'text-amber-dark',
    border: 'border-amber/20',
    hover: 'hover:shadow-[0_20px_40px_rgba(212,160,90,0.2)] hover:-translate-y-1 hover:border-amber/40',
    badge: 'bg-amber/10 text-amber-dark',
  },
};

export default function WorkManagementHub() {
  const { data: currentUser } = useCurrentUser();
  const isSuperadmin = currentUser?.is_superadmin ?? false;
  const isReviewer = isVerificationReviewer(currentUser?.membership?.role, isSuperadmin);

  const canEditSociety = canAccessManagement(currentUser?.membership?.role, isSuperadmin);

  const features = [
    ...baseFeatures,
    ...(isReviewer ? [verificationsFeature, propertiesFeature] : []),
    ...(isSuperadmin ? [signaturesFeature] : []),
    ...(canEditSociety ? [societyFeature, documentsFeature, blogFeature, groundReportFeature] : []),
  ];

  return (
    <div className="h-full w-full overflow-hidden flex flex-col bg-bone">
      <WorkManagementNavBar title="Administration" />

      <main className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-6 md:p-8 lg:p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-sage-light/50 border border-black rounded-none p-6 md:p-8 mb-8">
              <h1 className="font-display text-3xl md:text-4xl font-semibold text-forest mb-2">
                Administration
              </h1>
              <p className="text-forest/70">
                Tools for managing your society&apos;s operations, governance, and projects
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                  <motion.div
                    key={feature.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <BrutallyMinimalHubCard
                      name={feature.name}
                      description={feature.description}
                      icon={feature.icon}
                      href={feature.href}
                      count={feature.count}
                      countLabel={feature.countLabel}
                    />
                  </motion.div>
                ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
