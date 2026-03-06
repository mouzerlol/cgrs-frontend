import { BoardColor } from './work-management';

export interface PortfolioMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
  email?: string;
  phone?: string;
}

export type SectionType =
  | 'mission'
  | 'people'
  | 'services'
  | 'service-providers'
  | 'systems'
  | 'relationships'
  | 'budget'
  | 'documents'
  | 'linked-boards'
  | 'work-in-flight';

export interface SectionTypeConfig {
  type: SectionType;
  label: string;
  icon: string;
  defaultSize: { w: number; h: number };
  minSize?: { w: number; h: number };
}

export interface ServiceItem {
  id: string;
  name: string;
  description?: string;
}

export interface ServiceProvider {
  id: string;
  name: string;
  service: string;
  email?: string;
  phone?: string;
  contractType?: string;
}

export interface SystemItem {
  id: string;
  name: string;
  type: 'digital' | 'governance' | 'documentation' | 'other';
  description?: string;
  url?: string;
}

export interface RelationshipItem {
  id: string;
  name: string;
  type: string;
  description?: string;
}

export interface DocumentItem {
  id: string;
  name: string;
  type: 'policy' | 'report' | 'certificate' | 'contract' | 'other';
  url?: string;
  updatedAt?: string;
}

export interface BudgetData {
  allocated: number;
  spent: number;
  currency: string;
}

export interface DashboardSection {
  id: string;
  sectionType: SectionType;
  title: string;
  gridPosition: { x: number; y: number };
  gridSize: { w: number; h: number };
  visible: boolean;
  content: Record<string, unknown>;
}

export interface Portfolio {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: BoardColor;
  tag: string;
  lead: PortfolioMember;
  coLead?: PortfolioMember;
  members: PortfolioMember[];
  sections: DashboardSection[];
  linkedBoardIds: string[];
  createdAt: string;
  updatedAt: string;
}
