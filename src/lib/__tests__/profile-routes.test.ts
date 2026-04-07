import { describe, it, expect } from 'vitest';
import { isReportedIssueDetailPath } from '@/lib/profile-routes';

describe('isReportedIssueDetailPath', () => {
  it('returns false for the reported issues list (no request id)', () => {
    expect(isReportedIssueDetailPath('/profile/reported-issues')).toBe(false);
    expect(isReportedIssueDetailPath('/profile/reported-issues/')).toBe(false);
  });

  it('returns true for a single issue segment (with optional trailing slash)', () => {
    const id = '28b81a2e-1d4d-4109-981d-d5ee4bba704d';
    expect(isReportedIssueDetailPath(`/profile/reported-issues/${id}`)).toBe(true);
    expect(isReportedIssueDetailPath(`/profile/reported-issues/${id}/`)).toBe(true);
  });

  it('returns false for deeper paths (not handled by [requestId] route)', () => {
    expect(isReportedIssueDetailPath('/profile/reported-issues/uuid/extra')).toBe(false);
  });

  it('returns false for unrelated profile paths', () => {
    expect(isReportedIssueDetailPath('/profile')).toBe(false);
    expect(isReportedIssueDetailPath('/profile/verification')).toBe(false);
    expect(isReportedIssueDetailPath('/profile/my-property')).toBe(false);
    expect(isReportedIssueDetailPath('/')).toBe(false);
  });
});
