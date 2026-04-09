import { describe, expect, it } from 'vitest';

import { ApiError, threadSubmissionErrorMessage } from '../client';

describe('threadSubmissionErrorMessage', () => {
  it('uses ApiError message for API failures', () => {
    expect(threadSubmissionErrorMessage(new ApiError(403, { detail: 'Community membership required' }))).toBe(
      'API error 403: Community membership required',
    );
  });

  it('surfaces plain Error messages (e.g. R2 PUT / CORS)', () => {
    expect(
      threadSubmissionErrorMessage(new Error('Direct upload to storage failed (Failed to fetch). ...')),
    ).toContain('Direct upload to storage failed');
  });

  it('surfaces RangeError and other Error subclasses', () => {
    expect(threadSubmissionErrorMessage(new RangeError('Image size must be between'))).toContain('Image size');
  });

  it('falls back for non-Error throws', () => {
    expect(threadSubmissionErrorMessage('weird')).toBe('Failed to create thread. Please try again.');
  });
});
