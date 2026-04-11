import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TaskComments from '../TaskComments';

vi.mock('@clerk/nextjs', () => ({
  useUser: () => ({ user: null }),
}));

vi.mock('@/hooks/useCurrentUser', () => ({
  useCurrentUser: () => ({ data: { user: { id: 'u1', first_name: 'T', last_name: 'E', avatar_url: null } } }),
}));

vi.mock('@/hooks/useTasks', () => ({
  useAddTaskComment: () => ({ mutate: vi.fn(), isPending: false }),
  useUpdateTaskComment: () => ({ mutate: vi.fn(), isPending: false }),
  useDeleteTaskComment: () => ({ mutate: vi.fn(), isPending: false }),
}));

describe('TaskComments', () => {
  it('renders empty state with square corners', () => {
    render(<TaskComments taskId="task-1" comments={[]} />);
    const empty = screen.getByText(/No comments yet/i).closest('div');
    expect(empty).toHaveClass('rounded-none');
  });

  it('uses square corners on new comment textarea', () => {
    render(<TaskComments taskId="task-1" comments={[]} />);
    expect(screen.getByLabelText('New comment')).toHaveClass('rounded-none');
  });
});
