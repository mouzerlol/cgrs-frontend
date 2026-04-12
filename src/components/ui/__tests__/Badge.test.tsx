import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Badge } from '@/components/ui/Badge';

describe('Badge', () => {
  it('applies amber variant styles for role-style badges', () => {
    const { container } = render(<Badge variant="amber">Society manager</Badge>);
    const badge = container.querySelector('span');
    expect(badge).toBeTruthy();
    expect(badge?.className).toContain('text-amber-dark');
    expect(screen.getByText('Society manager')).toBeInTheDocument();
  });
});
