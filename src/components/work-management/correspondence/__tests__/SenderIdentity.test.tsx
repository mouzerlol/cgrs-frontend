import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SenderIdentity, { type CorrespondenceSender } from '../SenderIdentity';

describe('SenderIdentity', () => {
  it('renders user-type chip with avatar and name', () => {
    const sender: CorrespondenceSender = {
      type: 'user',
      name: 'Alex Morgan',
      email: 'alex@example.com',
      avatar_url: 'https://example.com/avatar.png',
    };
    render(<SenderIdentity sender={sender} />);
    expect(screen.getByText('Alex Morgan')).toBeInTheDocument();
    expect(screen.getByLabelText(/sender: user/i)).toBeInTheDocument();
  });

  it('renders claimed contact chip with originally-emailed-as hint', () => {
    const sender: CorrespondenceSender = {
      type: 'contact_claimed',
      name: 'Jamie Lee',
      email: 'jamie@external.com',
      avatar_url: null,
      hint: 'originally emailed as jamie@external.com',
    };
    render(<SenderIdentity sender={sender} />);
    expect(screen.getByText('Jamie Lee')).toBeInTheDocument();
    expect(screen.getByText(/originally emailed as/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sender: claimed contact/i)).toBeInTheDocument();
  });

  it('renders unclaimed contact chip with external badge and initials fallback', () => {
    const sender: CorrespondenceSender = {
      type: 'contact_unclaimed',
      name: 'External Resident',
      email: 'external@gmail.com',
      avatar_url: null,
    };
    render(<SenderIdentity sender={sender} />);
    expect(screen.getByText('External Resident')).toBeInTheDocument();
    // External badge is the all-caps badge text rendered next to the name.
    expect(screen.getByText('External')).toBeInTheDocument();
    expect(screen.getByLabelText(/sender: unclaimed contact/i)).toBeInTheDocument();
  });

  it('renders raw email chip with email only and initials avatar', () => {
    const sender: CorrespondenceSender = {
      type: 'raw',
      name: null,
      email: 'mystery@unknown.com',
      avatar_url: null,
    };
    render(<SenderIdentity sender={sender} />);
    expect(screen.getByText('mystery@unknown.com')).toBeInTheDocument();
    expect(screen.getByLabelText(/sender: raw email/i)).toBeInTheDocument();
  });

  it('falls back to initials when avatar is missing for a user', () => {
    const sender: CorrespondenceSender = {
      type: 'user',
      name: 'Test User',
      email: 'test@example.com',
      avatar_url: null,
    };
    render(<SenderIdentity sender={sender} />);
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });
});
