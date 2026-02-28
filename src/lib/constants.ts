export const SITE_CONFIG = {
  name: 'Coronation Gardens',
  domain: 'cgrs.co.nz',
  description: 'Coronation Gardens Residents Society - Māngere Bridge, Auckland',
  url: 'https://cgrs.co.nz',
  location: 'Māngere Bridge, Auckland',
  established: '2024',
} as const;

/** All nav items in display order. Icons shown only when item appears in More dropdown. */
export const ALL_NAV_ITEMS = [
  { name: 'Discussion', href: '/discussion', icon: 'message' as const },
  { name: 'Report Issue', href: '/management-request', icon: 'lightbulb' as const },
  { name: 'Calendar', href: '/calendar', icon: 'calendar' as const },
  { name: 'Blog', href: '/blog', icon: 'edit' as const },
  { name: 'Management', href: '/work-management', icon: 'document' as const },
  { name: 'About', href: '/about', icon: 'lucide:users' as const },
  { name: 'Map', href: '/map', icon: 'map' as const },
] as const;

/** @deprecated Use ALL_NAV_ITEMS. Kept for mobile menu structure. */
export const NAVIGATION_ITEMS = ALL_NAV_ITEMS.slice(0, 5);

/** @deprecated Use ALL_NAV_ITEMS overflow. Kept for mobile menu structure. */
export const MORE_NAVIGATION_ITEMS = ALL_NAV_ITEMS.slice(5);

export const UTILITY_DOCK_ITEMS = [
  {
    name: 'Notice Board',
    href: '/notice-board',
    icon: '/icons/notice-board-icon.png',
    label: 'Notice\nBoard',
  },
  {
    name: 'Management Request',
    href: '/management-request',
    icon: '/icons/maintenance-request-icon.png',
    label: 'Management\nRequest',
  },
  {
    name: 'Community Events',
    href: '/calendar',
    icon: '/icons/community-events-icon.png',
    label: 'Community\nEvents',
  },
  {
    name: 'Community News',
    href: '/blog',
    icon: '/icons/community-news-icon.png',
    label: 'Community\nNews',
  },
] as const;

export const QUICK_ACCESS_CARDS = [
  {
    title: 'Our Amenities',
    description: 'Pool, gym, spa, lounge & co-working spaces',
    href: '/about#amenities',
    type: 'large',
    backgroundImage: 'https://placehold.co/800x800/40916c/white?text=Amenities',
  },
  {
    title: 'Book Amenities',
    description: 'Reserve spaces & facilities',
    href: '/contact?subject=booking',
    type: 'simple',
    icon: 'calendar',
  },
  {
    title: 'Resident Portal',
    description: 'Manage your account & details',
    href: '/login',
    type: 'simple',
    icon: 'user',
  },
  {
    title: 'Documents',
    description: 'Rules, forms & policies',
    href: '/guidelines',
    type: 'simple',
    icon: 'document',
  },
  {
    title: 'Payments',
    description: 'Fees, invoices & history',
    href: '/contact?subject=payments',
    type: 'simple',
    icon: 'card',
  },
  {
    title: 'Contact Committee',
    description: 'Get in touch with our team',
    href: '/contact',
    type: 'accent',
    icon: 'mail',
  },
] as const;

export const EMERGENCY_CONTACT = {
  label: '24/7 Emergency Line',
  phone: '0800 4 BRIDGE',
  tel: '08004274337',
} as const;
