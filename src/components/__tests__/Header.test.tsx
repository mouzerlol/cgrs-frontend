import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Header from '@/components/layout/Header';
import { NAVIGATION_ITEMS } from '@/lib/constants';

describe('Header', () => {
  beforeEach(() => {
    vi.stubGlobal('ResizeObserver', class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    });
  });

  it('renders logo link', () => {
    render(<Header />);
    const logoLink = document.querySelector('a.nav-logo');
    expect(logoLink).toBeInTheDocument();
    expect(logoLink).toHaveTextContent('CORONATION');
  });

  it('renders navigation items on desktop', () => {
    render(<Header />);
    const navLinks = document.querySelectorAll('nav a.nav-link');
    expect(navLinks).toHaveLength(NAVIGATION_ITEMS.length);
  });

  it('renders login button', () => {
    render(<Header />);
    const loginButton = document.querySelector('a.nav-button');
    expect(loginButton).toBeInTheDocument();
    expect(loginButton).toHaveTextContent('Resident Login');
  });

  it('renders hamburger menu button on mobile', () => {
    render(<Header />);
    expect(screen.getByLabelText('Toggle navigation')).toBeInTheDocument();
  });

  it('opens mobile menu when hamburger button is clicked', async () => {
    render(<Header />);
    const menuButton = screen.getByLabelText('Toggle navigation');
    menuButton.click();
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  it('shows navigation items in mobile menu when opened', async () => {
    render(<Header />);
    const menuButton = screen.getByLabelText('Toggle navigation');
    menuButton.click();
    
    await waitFor(() => {
      // Check for dialog with nav links inside
      const dialog = screen.getByRole('dialog');
      const linksInDialog = dialog.querySelectorAll('a');
      expect(linksInDialog.length).toBeGreaterThan(NAVIGATION_ITEMS.length);
    });
  });

  it('closes mobile menu when Escape key is pressed', async () => {
    render(<Header />);
    const menuButton = screen.getByLabelText('Toggle navigation');
    menuButton.click();
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    
    // Simulate Escape key press
    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    document.dispatchEvent(event);
    
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('logo links to home page', () => {
    render(<Header />);
    const logoLink = document.querySelector('a.nav-logo');
    expect(logoLink).toBeInTheDocument();
    expect(logoLink).toHaveAttribute('href', '/');
  });

  it('mobile menu contains login button', async () => {
    render(<Header />);
    const menuButton = screen.getByLabelText('Toggle navigation');
    menuButton.click();
    
    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveTextContent('Resident Login');
    });
  });

  it('does not show mobile menu dialog initially', () => {
    render(<Header />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('has correct aria attributes on menu button', () => {
    render(<Header />);
    const menuButton = screen.getByLabelText('Toggle navigation');
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('header has correct nav class', () => {
    render(<Header />);
    const header = document.querySelector('header.nav');
    expect(header).toBeInTheDocument();
  });

  it('contains CORONATION GARDENS text', () => {
    render(<Header />);
    expect(document.body).toHaveTextContent('CORONATION');
    expect(document.body).toHaveTextContent('GARDENS');
  });
});
