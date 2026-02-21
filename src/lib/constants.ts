export const SITE_CONFIG = {
  name: 'Coronation Gardens',
  domain: 'cgrs.co.nz',
  description: 'Coronation Gardens Residents Society - Māngere Bridge, Auckland',
  url: 'https://cgrs.co.nz',
  location: 'Māngere Bridge, Auckland',
  established: '2024',
} as const;

export const NAVIGATION_ITEMS = [
  { name: 'Discussion', href: '/discussion' },
  { name: 'Report Issue', href: '/management-request' },
  { name: 'Calendar', href: '/calendar' },
  { name: 'Blog', href: '/blog' },
  { name: 'Management', href: '/work-management' },
] as const;

export const MORE_NAVIGATION_ITEMS = [
  { name: 'About', href: '/about', icon: 'users' },
  { name: 'Map', href: '/map', icon: 'map' },
] as const;

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
