import { SectionType, SectionTypeConfig, DashboardSection } from '@/types/portfolio';

export const SECTION_TYPE_CONFIGS: SectionTypeConfig[] = [
  { type: 'mission', label: 'Mission & Scope', icon: 'clipboard-list', defaultSize: { w: 2, h: 1 }, minSize: { w: 1, h: 1 } },
  { type: 'people', label: 'People', icon: 'users', defaultSize: { w: 2, h: 2 }, minSize: { w: 1, h: 2 } },
  { type: 'services', label: 'Services & Responsibilities', icon: 'list-checks', defaultSize: { w: 2, h: 3 }, minSize: { w: 1, h: 2 } },
  { type: 'service-providers', label: 'Service Providers', icon: 'building-2', defaultSize: { w: 2, h: 2 }, minSize: { w: 1, h: 2 } },
  { type: 'systems', label: 'Systems', icon: 'settings', defaultSize: { w: 2, h: 2 }, minSize: { w: 1, h: 2 } },
  { type: 'relationships', label: 'Key Relationships', icon: 'handshake', defaultSize: { w: 1, h: 2 }, minSize: { w: 1, h: 2 } },
  { type: 'budget', label: 'Budget', icon: 'wallet', defaultSize: { w: 1, h: 2 }, minSize: { w: 1, h: 2 } },
  { type: 'documents', label: 'Documents & Policies', icon: 'file-text', defaultSize: { w: 2, h: 2 }, minSize: { w: 1, h: 2 } },
  { type: 'linked-boards', label: 'Linked Boards', icon: 'layout-grid', defaultSize: { w: 1, h: 2 }, minSize: { w: 1, h: 2 } },
  { type: 'work-in-flight', label: 'Work in Flight', icon: 'rocket', defaultSize: { w: 4, h: 2 }, minSize: { w: 2, h: 2 } },
];

export function getSectionConfig(type: SectionType): SectionTypeConfig {
  return SECTION_TYPE_CONFIGS.find(c => c.type === type)!;
}

export function createDefaultSection(
  type: SectionType,
  position: { x: number; y: number }
): DashboardSection {
  const config = getSectionConfig(type);
  return {
    id: `section-${type}-${Date.now()}`,
    sectionType: type,
    title: config.label,
    gridPosition: position,
    gridSize: config.defaultSize,
    visible: true,
    content: getDefaultContent(type),
  };
}

function getDefaultContent(type: SectionType): Record<string, unknown> {
  switch (type) {
    case 'mission':
      return { text: '' };
    case 'people':
      return {};
    case 'services':
      return { items: [] };
    case 'service-providers':
      return { providers: [] };
    case 'systems':
      return { items: [] };
    case 'relationships':
      return { items: [] };
    case 'budget':
      return { allocated: 0, spent: 0, currency: 'NZD' };
    case 'documents':
      return { items: [] };
    case 'linked-boards':
      return {};
    case 'work-in-flight':
      return {};
    default:
      return {};
  }
}

export function generatePortfolioId(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function generatePortfolioTag(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
