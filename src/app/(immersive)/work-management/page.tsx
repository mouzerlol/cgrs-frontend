'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { LayoutGrid, ClipboardList, Scale } from 'lucide-react';
import WorkManagementNavBar from '@/components/work-management/WorkManagementNavBar';
import { BrutallyMinimalHubCard } from '@/components/ui/experimental-cards/BrutallyMinimalWorkCards';
import portfoliosData from '@/data/portfolios.json';
import boardsData from '@/data/boards.json';
import decisionsData from '@/data/decisions.json';

const features = [
  {
    id: 'portfolios',
    name: 'Portfolios',
    description: 'Define ownership, scope, and services for each area of committee work',
    icon: ClipboardList,
    href: '/work-management/portfolios',
    color: 'terracotta' as const,
    count: portfoliosData.portfolios.length,
    countLabel: 'portfolios',
  },
  {
    id: 'boards',
    name: 'Boards',
    description: 'Track tasks and manage workflows across your projects',
    icon: LayoutGrid,
    href: '/work-management/boards',
    color: 'sage' as const,
    count: boardsData.boards.length,
    countLabel: 'boards',
  },
  {
    id: 'decisions',
    name: 'Decision Register',
    description: 'Record and track formal committee resolutions and motions',
    icon: Scale,
    href: '/work-management/decisions',
    color: 'amber' as const,
    count: decisionsData.resolutions.length,
    countLabel: 'resolutions',
  },
];

const colorMap = {
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
  return (
    <div className="h-full w-full overflow-hidden flex flex-col bg-bone">
      <WorkManagementNavBar title="Work Management" />

      <main className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-6 md:p-8 lg:p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-sage-light/50 rounded-[20px] p-6 md:p-8 mb-8">
              <h1 className="font-display text-3xl md:text-4xl font-semibold text-forest mb-2">
                Work Management
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
