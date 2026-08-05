import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ManagementRequestForm } from '../ManagementRequestForm';

// --- Mocks -----------------------------------------------------------------

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const mockUser = {
  fullName: 'Jane Doe',
  primaryEmailAddress: { emailAddress: 'jane@example.com' },
};

vi.mock('@clerk/nextjs', () => ({
  useAuth: () => ({
    getToken: vi.fn().mockResolvedValue('test-token'),
    isSignedIn: true,
    userId: 'user_1',
  }),
  useUser: () => ({ user: mockUser }),
}));

const createManagementRequest = vi.fn().mockResolvedValue({
  request: { id: 'REQ-100' },
});
vi.mock('@/lib/api/management-requests', () => ({
  createManagementRequest: (...args: unknown[]) => createManagementRequest(...args),
}));

// Heavy children that pull in leaflet / turnstile / iconify — stub them out.
vi.mock('../LocationPicker', () => ({ LocationPicker: () => null }));
vi.mock('../TurnstileCaptcha', () => ({ TurnstileCaptcha: () => null }));
vi.mock('@/components/discussions/ThreadForm/ImageUploader', () => ({
  ImageUploader: () => null,
}));
vi.mock('@iconify/react', () => ({ Icon: () => null }));
vi.mock('@/lib/analytics/events', () => ({ track: vi.fn() }));

describe('ManagementRequestForm – Submit Another keeps signed-in user details', () => {
  beforeEach(() => {
    createManagementRequest.mockClear();
    // /users/me lookup → verified user (no captcha)
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ requires_captcha: false }),
    }) as unknown as typeof fetch;
  });

  it('repopulates name and email after clicking "Submit Another"', async () => {
    const user = userEvent.setup();

    render(
      <ManagementRequestForm
        initialData={{
          subject: 'Broken gate latch',
          description: 'The front gate latch is broken and will not close properly at all.',
        }}
      />
    );

    // Name/email prefilled from Clerk on first render.
    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    });

    // Submit the request.
    await user.click(screen.getByRole('button', { name: /Submit Request/i }));

    // Success confirmation appears.
    await waitFor(() => {
      expect(screen.getByText('Request Received')).toBeInTheDocument();
    });
    expect(createManagementRequest).toHaveBeenCalledTimes(1);

    // Click "Submit Another" → returns to a fresh form.
    await user.click(screen.getByRole('button', { name: /Submit Another/i }));

    // BUG: name/email are blanked out. They should still hold the signed-in user's details.
    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    });
  });
});
