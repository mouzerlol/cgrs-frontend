import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Accordion, AccordionItem } from '@/components/ui/Accordion';

const mockItems: AccordionItem[] = [
  {
    title: 'What is the community about?',
    content: 'We are a residential community focused on...',
  },
  {
    title: 'How can I join?',
    content: 'You can join by contacting our committee...',
  },
  {
    title: 'What are the fees?',
    content: 'Our annual fees are...',
  },
];

describe('Accordion', () => {
  it('renders all accordion titles', () => {
    render(<Accordion items={mockItems} />);
    expect(screen.getByText('What is the community about?')).toBeInTheDocument();
    expect(screen.getByText('How can I join?')).toBeInTheDocument();
    expect(screen.getByText('What are the fees?')).toBeInTheDocument();
  });

  it('hides content by default', () => {
    render(<Accordion items={mockItems} />);
    expect(screen.queryByText('We are a residential community focused on...')).not.toBeInTheDocument();
  });

  it('shows content when accordion item is clicked', async () => {
    render(<Accordion items={mockItems} />);
    const button = screen.getByText('What is the community about?');
    fireEvent.click(button);
    expect(await screen.findByText('We are a residential community focused on...')).toBeInTheDocument();
  });

  it('toggles content when clicked multiple times', async () => {
    render(<Accordion items={mockItems} />);
    const button = screen.getByText('What is the community about?');
    
    fireEvent.click(button);
    expect(await screen.findByText('We are a residential community focused on...')).toBeInTheDocument();
    
    fireEvent.click(button);
    expect(screen.queryByText('We are a residential community focused on...')).not.toBeInTheDocument();
  });

  it('allows multiple items to be open at once', async () => {
    render(<Accordion items={mockItems} />);
    
    fireEvent.click(screen.getByText('What is the community about?'));
    fireEvent.click(screen.getByText('How can I join?'));
    
    expect(await screen.findByText('We are a residential community focused on...')).toBeInTheDocument();
    expect(await screen.findByText('You can join by contacting our committee...')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Accordion items={mockItems} className="custom-accordion" />);
    expect(document.querySelector('.custom-accordion')).toBeInTheDocument();
  });
});
