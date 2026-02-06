import {
  ManagementRequestFormData,
  ManagementRequestErrors,
  ManagementCategoryId,
} from '@/types/management-request';
import { CATEGORY_ABBREVIATIONS } from '@/data/management-categories';
import { MAP_CENTER } from '@/data/map-data';

/**
 * Generate a unique issue ID for a management request
 * Format: CGRS-[CATEGORY]-[YYYYMMDD]-[4-char random]
 * Example: CGRS-MAINT-20260119-X7K2
 */
export function generateIssueId(category: ManagementCategoryId): string {
  const categoryAbbr = CATEGORY_ABBREVIATIONS[category] || 'REQ';
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');

  // Generate 4-character random alphanumeric string
  const randomPart = crypto.randomUUID().slice(0, 4).toUpperCase();

  return `CGRS-${categoryAbbr}-${dateStr}-${randomPart}`;
}

/**
 * Email validation regex
 * Matches standard email format
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate form data and return any errors
 */
export function validateFormData(
  data: ManagementRequestFormData
): ManagementRequestErrors {
  const errors: ManagementRequestErrors = {};

  // Full Name: Required, 2-100 chars
  if (!data.fullName.trim()) {
    errors.fullName = 'Full name is required';
  } else if (data.fullName.trim().length < 2) {
    errors.fullName = 'Name must be at least 2 characters';
  } else if (data.fullName.trim().length > 100) {
    errors.fullName = 'Name must be under 100 characters';
  }

  // Email: Required, valid format
  if (!data.email.trim()) {
    errors.email = 'Email is required';
  } else if (!EMAIL_REGEX.test(data.email.trim())) {
    errors.email = 'Please enter a valid email address';
  }

  // Subject: Required, 5-150 chars
  if (!data.subject.trim()) {
    errors.subject = 'Subject is required';
  } else if (data.subject.trim().length < 5) {
    errors.subject = 'Subject must be at least 5 characters';
  } else if (data.subject.trim().length > 150) {
    errors.subject = 'Subject must be under 150 characters';
  }

  // Description: Required, 20-2000 chars
  if (!data.description.trim()) {
    errors.description = 'Description is required';
  } else if (data.description.trim().length < 20) {
    errors.description = 'Description must be at least 20 characters';
  } else if (data.description.trim().length > 2000) {
    errors.description = 'Description must be under 2000 characters';
  }

  // Photos: Optional, max 5 files, max 5MB each
  if (data.photos.length > 5) {
    errors.photos = 'Maximum 5 photos allowed';
  } else {
    const MAX_SIZE_MB = 5;
    const oversizedPhoto = data.photos.find(
      (photo) => photo.size > MAX_SIZE_MB * 1024 * 1024
    );
    if (oversizedPhoto) {
      errors.photos = `Each photo must be under ${MAX_SIZE_MB}MB`;
    }
  }

  return errors;
}

/**
 * Check if form data is valid (no errors)
 */
export function isFormValid(data: ManagementRequestFormData): boolean {
  const errors = validateFormData(data);
  return Object.keys(errors).length === 0;
}

/**
 * Get initial form state with defaults
 */
export function getInitialFormData(): ManagementRequestFormData {
  return {
    category: 'maintenance',
    fullName: '',
    email: '',
    subject: '',
    description: '',
    photos: [],
    location: {
      lat: MAP_CENTER[0],
      lng: MAP_CENTER[1],
    },
  };
}

/**
 * Format coordinates for display
 */
export function formatCoordinates(lat: number, lng: number): string {
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}
