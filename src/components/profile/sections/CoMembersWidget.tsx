'use client';

import { Avatar } from '@/components/ui/Avatar';

interface CoMember {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}

interface CoMembersWidgetProps {
  members: CoMember[];
  type: 'owner' | 'resident';
}

function getMemberName(member: CoMember): string {
  const first = member.first_name || '';
  const last = member.last_name || '';
  if (first && last) {
    return `${first} ${last}`.trim();
  }
  if (first) {
    return first;
  }
  return 'Unknown';
}

export default function CoMembersWidget({ members, type }: CoMembersWidgetProps) {
  const label = type === 'owner' ? 'Property Owners' : 'Property Residents';

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-forest/60 uppercase tracking-wide">
        {label}
      </span>
      <div className="flex flex-col gap-2">
        {/* We assume the current user is part of the property conceptually, but this widget specifically shows the fetched co-members.
            Wait, if members list is empty, should we show current user? 
            The previous implementation showed "Only you verified here" if members.length === 0.
            The plan says: "just show heading with only the current user" -> but we don't have the current user's name/avatar in this component props! 
            Ah, "Remove the 'Only you verified here' text (just show heading with only the current user)". 
            Wait, the prompt says: "It should just show a heading saying property owners, and then you show the avatar and the user's name for each co-owner."
            "In fact, we already have a sort of subheading. Instead of saying owner of street address, it should say plural owners if there are co-owners, otherwise, just keep the same."
            If I don't have current user, maybe I should just show the co_members if length > 0, else show nothing or show the heading and that's it?
            Actually, the plan says: "Remove the 'Only you verified here' text (just show heading with only the current user)" which might imply just removing it and if there are co-members they will render. 
            If there are 0 members, we render nothing under the heading. */}
        {members.map((member) => (
          <div key={member.user_id} className="flex items-center gap-2">
            <div className="relative rounded-full shrink-0">
              <Avatar
                src={member.avatar_url}
                name={getMemberName(member)}
                size="sm"
                className="h-7 w-7"
              />
            </div>
            <span className="text-sm text-forest truncate">{getMemberName(member)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
