import { ManagementCategory } from '@/types/management-request';

/**
 * Management request categories configuration
 * Each category represents a type of issue residents can report
 */
export const MANAGEMENT_CATEGORIES: ManagementCategory[] = [
  {
    id: 'maintenance',
    name: 'Maintenance & Repairs',
    description: 'Report issues with common areas, facilities, or infrastructure that need attention.',
    icon: 'lucide:wrench',
  },
  {
    id: 'waste',
    name: 'Waste Management',
    description: 'Report bin collection issues, illegal dumping, or recycling concerns.',
    icon: 'lucide:trash-2',
  },
  {
    id: 'parking',
    name: 'Parking',
    description: 'Report parking violations, visitor pass requests, or parking space concerns.',
    icon: 'lucide:car',
  },
  {
    id: 'general',
    name: 'General Inquiry',
    description: 'Ask questions about community policies, services, or request information.',
    icon: 'lucide:help-circle',
  },
  {
    id: 'complaints',
    name: 'Complaints',
    description: 'Submit formal complaints about noise, neighbor issues, or policy violations.',
    icon: 'lucide:alert-triangle',
  },
];

/**
 * Get a category by its ID
 */
export function getCategoryById(id: string): ManagementCategory | undefined {
  return MANAGEMENT_CATEGORIES.find((cat) => cat.id === id);
}

/**
 * Get the default category (first in list)
 */
export function getDefaultCategory(): ManagementCategory {
  return MANAGEMENT_CATEGORIES[0];
}

/**
 * Category ID abbreviations for issue ID generation
 */
export const CATEGORY_ABBREVIATIONS: Record<string, string> = {
  maintenance: 'MAINT',
  waste: 'WASTE',
  parking: 'PARK',
  general: 'GEN',
  complaints: 'COMP',
};
