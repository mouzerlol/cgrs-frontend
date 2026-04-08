import { describe, it, expect } from 'vitest';
import {
  generateIssueId,
  validateFormData,
  isFormValid,
  getInitialFormData,
  getPrefilledFormData,
  formatCoordinates,
  type PrefilledSource,
} from '@/lib/management-request';

describe('generateIssueId', () => {
  it('generates issue ID with correct format', () => {
    const id = generateIssueId('maintenance');
    expect(id).toMatch(/^CGRS-MAINT-\d{8}-[A-Z0-9]{4}$/);
  });

  it('uses correct abbreviation for each category', () => {
    const categories: Array<{ id: string; expectedAbbr: string }> = [
      { id: 'maintenance', expectedAbbr: 'MAINT' },
      { id: 'waste', expectedAbbr: 'WASTE' },
      { id: 'parking', expectedAbbr: 'PARK' },
      { id: 'general', expectedAbbr: 'GEN' },
      { id: 'complaints', expectedAbbr: 'COMP' },
      { id: 'website', expectedAbbr: 'WEB' },
    ];

    for (const { id, expectedAbbr } of categories) {
      const issueId = generateIssueId(id as Parameters<typeof generateIssueId>[0]);
      expect(issueId).toContain(`CGRS-${expectedAbbr}-`);
    }
  });
});

describe('validateFormData', () => {
  it('returns errors for empty required fields', () => {
    const errors = validateFormData({
      category: 'maintenance',
      full_name: '',
      email: '',
      subject: '',
      description: '',
      photos: [],
      location: { lat: 0, lng: 0 },
    });

    expect(errors.full_name).toBe('Full name is required');
    expect(errors.email).toBe('Email is required');
    expect(errors.subject).toBe('Subject is required');
    expect(errors.description).toBe('Description is required');
  });

  it('accepts valid data with no errors', () => {
    const errors = validateFormData({
      category: 'maintenance',
      full_name: 'John Doe',
      email: 'john@example.com',
      subject: 'Test subject line here',
      description: 'This is a valid description with enough characters to pass validation.',
      photos: [],
      location: { lat: 0, lng: 0 },
    });

    expect(Object.keys(errors)).toHaveLength(0);
  });

  it('rejects invalid email format', () => {
    const errors = validateFormData({
      category: 'maintenance',
      full_name: 'John Doe',
      email: 'invalid-email',
      subject: 'Test subject line here',
      description: 'This is a valid description with enough characters to pass validation.',
      photos: [],
      location: { lat: 0, lng: 0 },
    });

    expect(errors.email).toBe('Please enter a valid email address');
  });

  it('rejects description shorter than 20 characters', () => {
    const errors = validateFormData({
      category: 'maintenance',
      full_name: 'John Doe',
      email: 'john@example.com',
      subject: 'Test subject',
      description: 'Too short',
      photos: [],
      location: { lat: 0, lng: 0 },
    });

    expect(errors.description).toBe('Description must be at least 20 characters');
  });
});

describe('isFormValid', () => {
  it('returns true for valid data', () => {
    const valid = isFormValid({
      category: 'maintenance',
      full_name: 'John Doe',
      email: 'john@example.com',
      subject: 'Test subject line here',
      description: 'This is a valid description with enough characters.',
      photos: [],
      location: { lat: 0, lng: 0 },
    });

    expect(valid).toBe(true);
  });

  it('returns false for invalid data', () => {
    const valid = isFormValid({
      category: 'maintenance',
      full_name: '',
      email: '',
      subject: '',
      description: '',
      photos: [],
      location: { lat: 0, lng: 0 },
    });

    expect(valid).toBe(false);
  });
});

describe('getInitialFormData', () => {
  it('returns object with default category', () => {
    const data = getInitialFormData();
    expect(data.category).toBe('maintenance');
  });

  it('returns empty strings for text fields', () => {
    const data = getInitialFormData();
    expect(data.full_name).toBe('');
    expect(data.email).toBe('');
    expect(data.subject).toBe('');
    expect(data.description).toBe('');
  });

  it('returns empty photos array', () => {
    const data = getInitialFormData();
    expect(data.photos).toEqual([]);
  });
});

describe('getPrefilledFormData', () => {
  it('returns empty object when no source provided', () => {
    const data = getPrefilledFormData(undefined);
    expect(data).toEqual({});
  });

  it('returns empty object for unknown source', () => {
    const data = getPrefilledFormData('unknown' as PrefilledSource);
    expect(data).toEqual({});
  });

  describe('committee-meeting prefilled data', () => {
    const data = getPrefilledFormData('committee-meeting');

    it('returns prefilled subject', () => {
      expect(data.subject).toBe('Request to Attend Committee Meeting');
    });

    it('returns prefilled description', () => {
      expect(data.description).toContain('I would like to attend the upcoming committee meeting');
      expect(data.description).toContain('Receive updates on community matters');
      expect(data.description).toContain('Voice my opinion on agenda items');
      expect(data.description).toContain('date, time, and location');
    });

    it('does not include category (uses URL param)', () => {
      expect(data.category).toBeUndefined();
    });
  });
});

describe('formatCoordinates', () => {
  it('formats coordinates to 5 decimal places', () => {
    expect(formatCoordinates(-36.84845, 174.76233)).toBe('-36.84845, 174.76233');
  });

  it('handles zero coordinates', () => {
    expect(formatCoordinates(0, 0)).toBe('0.00000, 0.00000');
  });
});