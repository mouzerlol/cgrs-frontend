/**
 * Serializable keys for PageHeader / BrutallyMinimal eyebrow icons.
 * Server Components cannot pass React component functions into Client Components;
 * use these keys and resolve icons inside client components.
 */
import type { LucideIcon } from 'lucide-react';
import {
  Bookmark,
  BookOpen,
  Building2,
  CalendarDays,
  ClipboardList,
  Info,
  KeyRound,
  Mail,
  Map,
  Megaphone,
  MessageSquare,
  MessageSquarePlus,
  Newspaper,
  Paintbrush,
  Scale,
  ShieldAlert,
  Users,
} from 'lucide-react';

export const EYEBROW_ICONS = {
  bookmark: Bookmark,
  bookOpen: BookOpen,
  building2: Building2,
  calendarDays: CalendarDays,
  clipboardList: ClipboardList,
  info: Info,
  keyRound: KeyRound,
  mail: Mail,
  map: Map,
  megaphone: Megaphone,
  messageSquare: MessageSquare,
  messageSquarePlus: MessageSquarePlus,
  newspaper: Newspaper,
  paintbrush: Paintbrush,
  scale: Scale,
  shieldAlert: ShieldAlert,
  users: Users,
} as const satisfies Record<string, LucideIcon>;

export type EyebrowIconKey = keyof typeof EYEBROW_ICONS;
