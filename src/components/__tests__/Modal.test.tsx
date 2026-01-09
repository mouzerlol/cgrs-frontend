import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Modal } from '@/components/ui/Modal';

describe('Modal', () => {
  beforeEach(() => {
    vi.stubGlobal('ResizeObserver', class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    });
  });

  it('does not render when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()} title="Test Modal">
        Modal content
      </Modal>
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
  });

  it('renders when isOpen is true', async () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
        Modal content
      </Modal>
    );
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
    });
  });

  it('renders modal content', async () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
        <p>This is the modal content</p>
      </Modal>
    );
    
    await waitFor(() => {
      expect(screen.getByText('This is the modal content')).toBeInTheDocument();
    });
  });

  it('renders modal description', async () => {
    render(
      <Modal 
        isOpen={true} 
        onClose={vi.fn()} 
        title="Test Modal"
        description="This is a description"
      >
        Modal content
      </Modal>
    );
    
    await waitFor(() => {
      expect(screen.getByText('This is a description')).toBeInTheDocument();
    });
  });

  it('does not render title when not provided', async () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()}>
        Content without title
      </Modal>
    );
    
    await waitFor(() => {
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
      expect(screen.getByText('Content without title')).toBeInTheDocument();
    });
  });

  it('renders children content', async () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
        <div data-testid="modal-children">Children content</div>
      </Modal>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('modal-children')).toBeInTheDocument();
    });
  });

  it('renders with title and correct role', async () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="My Modal">
        Content
      </Modal>
    );
    
    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });
  });

  it('closes when Escape key is pressed', async () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test Modal">
        Modal content
      </Modal>
    );
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    
    // Simulate Escape key press
    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    document.dispatchEvent(event);
    
    await waitFor(() => {
      expect(handleClose).toHaveBeenCalled();
    });
  });

  it('renders backdrop with blur effect', async () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
        Modal content
      </Modal>
    );
    
    await waitFor(() => {
      const backdrop = document.querySelector('[class*="backdrop-blur"]');
      expect(backdrop).toBeInTheDocument();
    });
  });

  it('applies rounded corners and shadow', async () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
        Modal content
      </Modal>
    );
    
    await waitFor(() => {
      const panel = screen.getByRole('dialog').querySelector('[class*="rounded"]');
      expect(panel).toBeInTheDocument();
    });
  });
});
