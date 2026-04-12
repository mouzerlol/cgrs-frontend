'use client';

import Image from 'next/image';
import { Mail, Phone } from 'lucide-react';
import { isNonOptimizableImageSrc } from '@/lib/image';
import { PortfolioMember } from '@/types/portfolio';
import SectionWrapper from './SectionWrapper';

interface PeopleSectionProps {
  lead: PortfolioMember;
  coLead?: PortfolioMember;
  members: PortfolioMember[];
  isEditingLayout: boolean;
  isLoading?: boolean;
}

function MemberRow({ member, badge }: { member: PortfolioMember; badge?: string }) {
  const initials = member.name.split(' ').map(n => n[0]).join('');

  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-9 h-9 rounded-full bg-forest/10 flex items-center justify-center text-xs font-semibold text-forest shrink-0 overflow-hidden">
        {member.avatar ? (
          <Image
            src={member.avatar}
            alt={member.name}
            width={36}
            height={36}
            unoptimized={isNonOptimizableImageSrc(member.avatar)}
            className="w-full h-full object-cover"
          />
        ) : (
          initials
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-forest truncate">{member.name}</span>
          {badge && (
            <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-terracotta/10 text-terracotta rounded">
              {badge}
            </span>
          )}
        </div>
        <span className="text-xs text-forest/50">{member.role}</span>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {member.email && (
          <a href={`mailto:${member.email}`} className="p-1 text-forest/30 hover:text-terracotta transition-colors">
            <Mail className="w-3.5 h-3.5" />
          </a>
        )}
        {member.phone && (
          <a href={`tel:${member.phone}`} className="p-1 text-forest/30 hover:text-terracotta transition-colors">
            <Phone className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}

export default function PeopleSection({ lead, coLead, members, isEditingLayout, isLoading = false }: PeopleSectionProps) {
  return (
    <SectionWrapper title="People" isEditingLayout={isEditingLayout} isLoading={isLoading}>
      <div className="divide-y divide-sage/10">
        <MemberRow member={lead} badge="Lead" />
        {coLead && <MemberRow member={coLead} badge="Co-Lead" />}
        {members.map(member => (
          <MemberRow key={member.id} member={member} />
        ))}
      </div>
      {members.length === 0 && !coLead && (
        <p className="text-xs text-forest/40 mt-2">No additional members yet.</p>
      )}
    </SectionWrapper>
  );
}
