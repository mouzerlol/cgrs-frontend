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
  if (first && last) return `${first} ${last}`.trim();
  if (first) return first;
  return 'A neighbour';
}

/**
 * Named list of the other people tied to a property. Renders nothing when the
 * current user is the only owner/resident on record.
 */
export default function CoMembersWidget({ members, type }: CoMembersWidgetProps) {
  if (members.length === 0) return null;

  const label = type === 'owner' ? 'Also owned by' : 'Also living here';

  return (
    <div data-testid="co-members-widget" data-type={type} className="flex flex-col gap-3">
      <span className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-forest/45">
        {label}
      </span>
      <ul className="flex flex-col gap-2.5">
        {members.map((member) => (
          <li key={member.user_id} className="flex items-center gap-2.5">
            <Avatar
              src={member.avatar_url}
              name={getMemberName(member)}
              size="sm"
              className="h-8 w-8 ring-1 ring-sage/30"
            />
            <span className="text-sm text-forest">{getMemberName(member)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
