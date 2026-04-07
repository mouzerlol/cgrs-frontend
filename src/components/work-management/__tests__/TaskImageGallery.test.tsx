import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TaskImageGallery from '@/components/work-management/TaskImageGallery';
import type { TaskImage } from '@/types/work-management';

const mockCalls: Array<{ isOpen?: boolean; onClose?: () => void }> = [];
vi.mock('@/components/ui/ImageLightbox', () => ({
  default: vi.fn((props: Record<string, unknown>) => {
    mockCalls.push(props as { isOpen?: boolean; onClose?: () => void });
    return null;
  }),
}));

vi.mock('@clerk/nextjs', () => ({
  useAuth: () => ({ getToken: vi.fn().mockResolvedValue('test-token') }),
}));

vi.mock('@/hooks/useTaskAttachmentImages', () => ({
  useTaskAttachmentImages: (images: TaskImage[]) => ({
    displayImages: images,
    isResolving: false,
  }),
}));

const images: TaskImage[] = [
  { id: 'img-1', url: 'https://example.com/img1.jpg', thumbnail: 'https://example.com/thumb1.jpg', alt: 'Image 1', type: 'image' },
  { id: 'img-2', url: 'https://example.com/img2.jpg', thumbnail: 'https://example.com/thumb2.jpg', alt: 'Image 2', type: 'image' },
  { id: 'img-3', url: 'https://example.com/img3.jpg', thumbnail: 'https://example.com/thumb3.jpg', alt: 'Image 3', type: 'video', duration: 30 },
];

const renderGallery = (override: Partial<Parameters<typeof TaskImageGallery>[0]> = {}) =>
  render(
    <TaskImageGallery
      images={override.images ?? images}
      onChange={override.onChange ?? vi.fn()}
      readonly={override.readonly ?? false}
    />
  );

describe('TaskImageGallery', () => {
  beforeEach(() => {
    vi.stubGlobal('ResizeObserver', class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    });
    mockCalls.length = 0;
  });

  describe('Lightbox', () => {
    it('opens lightbox with isOpen=true when a non-video image is clicked', async () => {
      renderGallery();

      const img1 = screen.getByRole('img', { name: 'Image 1' });
      await act(async () => {
        fireEvent.click(img1);
      });

      await waitFor(() => {
        const lastCall = mockCalls[mockCalls.length - 1];
        expect(lastCall).toMatchObject({ isOpen: true, initialIndex: 0 });
      });
    });

    it('opens lightbox at index 1 when second image is clicked', async () => {
      renderGallery();

      const img2 = screen.getByRole('img', { name: 'Image 2' });
      await act(async () => {
        fireEvent.click(img2);
      });

      await waitFor(() => {
        const lastCall = mockCalls[mockCalls.length - 1];
        expect(lastCall).toMatchObject({ isOpen: true, initialIndex: 1 });
      });
    });

    it('does NOT open lightbox for video images', async () => {
      renderGallery();

      const videoImg = screen.getByRole('img', { name: 'Image 3' });
      await act(async () => {
        fireEvent.click(videoImg);
      });

      // Video opens VideoPlayerModal, not lightbox - lightbox should only be called with isOpen=false (initial render)
      const openCalls = mockCalls.filter((c) => c.isOpen === true);
      expect(openCalls).toHaveLength(0);
    });

    it('passes onClose callback to lightbox when image is clicked', async () => {
      renderGallery();

      const img1 = screen.getByRole('img', { name: 'Image 1' });
      await act(async () => {
        fireEvent.click(img1);
      });

      await waitFor(() => {
        const lastCall = mockCalls[mockCalls.length - 1];
        expect(typeof lastCall?.onClose).toBe('function');
      });
    });
  });

  describe('Display', () => {
    it('renders all images in a grid', () => {
      renderGallery();
      expect(screen.getByRole('img', { name: 'Image 1' })).toBeInTheDocument();
      expect(screen.getByRole('img', { name: 'Image 2' })).toBeInTheDocument();
      expect(screen.getByRole('img', { name: 'Image 3' })).toBeInTheDocument();
    });

    it('does not show remove button when readonly', () => {
      renderGallery({ readonly: true });
      const removeButtons = document.querySelectorAll('button[aria-label*="Remove"]');
      expect(removeButtons).toHaveLength(0);
    });

    it('shows remove button on hover when not readonly', () => {
      renderGallery({ readonly: false });
      const removeButtons = document.querySelectorAll('button[aria-label*="Remove"]');
      expect(removeButtons).toHaveLength(3);
    });

    it('calls onChange without the removed image when remove is clicked', async () => {
      const onChange = vi.fn();
      renderGallery({ onChange });

      const removeBtn = document.querySelector('button[aria-label="Remove Image 1"]');
      await act(async () => {
        fireEvent.click(removeBtn!);
      });

      expect(onChange).toHaveBeenCalledWith([
        expect.objectContaining({ id: 'img-2' }),
        expect.objectContaining({ id: 'img-3' }),
      ]);
    });
  });
});
