import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CoMembersWidget from '@/components/profile/sections/CoMembersWidget';

vi.mock('@/components/ui/Avatar', () => ({
  Avatar: ({ name }: { name?: string }) => (
    <div data-testid="mock-avatar">{name ?? 'Avatar'}</div>
  ),
}));

const mockMembers = [
  { user_id: '1', first_name: 'John', last_name: 'Doe', avatar_url: null },
  { user_id: '2', first_name: 'Jane', last_name: 'Smith', avatar_url: null },
  { user_id: '3', first_name: 'Bob', last_name: 'Wilson', avatar_url: null },
];

describe('CoMembersWidget', () => {
  it('renders property owners label when type is owner', () => {
    render(<CoMembersWidget members={mockMembers} type="owner" />);
    expect(screen.getByText('Property Owners')).toBeInTheDocument();
  });

  it('renders property residents label when type is resident', () => {
    render(<CoMembersWidget members={mockMembers} type="resident" />);
    expect(screen.getByText('Property Residents')).toBeInTheDocument();
  });

  it('renders member names when members exist', () => {
    render(<CoMembersWidget members={mockMembers} type="owner" />);
    // Use getAllByText since names appear in both avatar and names list
    expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Jane Smith').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Bob Wilson').length).toBeGreaterThan(0);
  });

  it('renders heading but no list when no members', () => {
    render(<CoMembersWidget members={[]} type="owner" />);
    expect(screen.getByText('Property Owners')).toBeInTheDocument();
    // Assuming 'Avatar' mock is only rendered when there are members
    expect(screen.queryByTestId('mock-avatar')).not.toBeInTheDocument();
  });

  it('handles member with only first name', () => {
    const singleNameMember = [{ user_id: '1', first_name: 'John', last_name: null, avatar_url: null }];
    render(<CoMembersWidget members={singleNameMember} type="owner" />);
    expect(screen.getAllByText('John').length).toBeGreaterThan(0);
  });

  it('handles member with null first and last name', () => {
    const noNameMember = [{ user_id: '1', first_name: null, last_name: null, avatar_url: null }];
    render(<CoMembersWidget members={noNameMember} type="owner" />);
    expect(screen.getAllByText('Unknown').length).toBeGreaterThan(0);
  });

  it('shows all members even if there are many (no overflow capping)', () => {
    const manyMembers = Array.from({ length: 6 }, (_, i) => ({
      user_id: String(i),
      first_name: `User${i}`,
      last_name: 'Test',
      avatar_url: null,
    }));
    render(<CoMembersWidget members={manyMembers} type="owner" />);
    expect(screen.getAllByText('User5 Test').length).toBeGreaterThan(0);
    expect(screen.queryByText('+2 more')).not.toBeInTheDocument();
  });
});
