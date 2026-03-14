import type { Task, TaskImage, TaskLocation } from './work-management';

/**
 * Management Request Types
 * Types for the resident management request portal
 */

/**
 * Category IDs for management request types
 */
export type ManagementCategoryId =
  | 'maintenance'
  | 'waste'
  | 'parking'
  | 'general'
  | 'complaints';

/**
 * Management request category configuration
 */
export interface ManagementCategory {
  id: ManagementCategoryId;
  name: string;
  description: string;
  icon: string; // Iconify icon name (e.g., "lucide:wrench")
}

/**
 * Location data from the location picker
 */
export interface RequestLocation {
  lat: number;
  lng: number;
}

/**
 * Form data for management request submission
 */
export interface ManagementRequestFormData {
  category: ManagementCategoryId;
  fullName: string;
  email: string;
  subject: string;
  description: string;
  photos: File[];
  location: RequestLocation | null;
}

export type ManagementRequestStatus = 'open' | 'closed';

/**
 * Submitted management request with generated ID
 */
export interface ManagementRequest {
  id: string;
  category: ManagementCategoryId;
  fullName: string;
  email: string;
  linkedTaskId: string | null;
  status: ManagementRequestStatus;
  closedReason?: string | null;
  submittedAt: string;
  updatedAt: string;
}

export interface ManagementRequestWithTask {
  request: ManagementRequest;
  task: Task;
}

export interface ManagementRequestImagePayload extends TaskImage {}

export interface ManagementRequestLocationPayload extends TaskLocation {}

/**
 * Validation errors for form fields
 */
export interface ManagementRequestErrors {
  fullName?: string;
  email?: string;
  subject?: string;
  description?: string;
  photos?: string;
}

/**
 * Form state for managing the request form
 */
export interface ManagementRequestFormState {
  data: ManagementRequestFormData;
  errors: ManagementRequestErrors;
  isSubmitting: boolean;
  isSubmitted: boolean;
  submittedId: string | null;
}
