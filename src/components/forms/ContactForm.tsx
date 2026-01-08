'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { ContactFormData } from '@/types';

interface ContactFormProps {
  onSubmit: (data: ContactFormData) => void;
}

/**
 * Contact form with new design system styling.
 */
export default function ContactForm({ onSubmit }: ContactFormProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<ContactFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<ContactFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      onSubmit(formData);
      setIsSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name as keyof ContactFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const inputClasses = (hasError: boolean) =>
    `w-full px-4 py-3 bg-white border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-terracotta/50 focus:border-terracotta ${
      hasError ? 'border-terracotta' : 'border-sage/30'
    }`;

  if (isSubmitted) {
    return (
      <Card className="text-center p-8">
        <div className="text-5xl mb-4">✅</div>
        <h3 className="font-display text-2xl font-medium mb-4">Thank You!</h3>
        <p className="opacity-70 mb-6">
          Your message has been sent successfully. We'll get back to you as soon as possible.
        </p>
        <Button variant="primary" onClick={() => setIsSubmitted(false)}>
          Send Another Message
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-6" id="form">
      <h3 className="font-display text-xl font-medium mb-6">Send us a Message</h3>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Name <span className="text-terracotta">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={inputClasses(!!errors.name)}
            placeholder="Your full name"
          />
          {errors.name && <p className="mt-1 text-sm text-terracotta">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email <span className="text-terracotta">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={inputClasses(!!errors.email)}
            placeholder="your.email@example.com"
          />
          {errors.email && <p className="mt-1 text-sm text-terracotta">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-medium mb-2">
            Subject <span className="text-terracotta">*</span>
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className={inputClasses(!!errors.subject)}
            placeholder="What is this about?"
          />
          {errors.subject && <p className="mt-1 text-sm text-terracotta">{errors.subject}</p>}
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium mb-2">
            Message <span className="text-terracotta">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={5}
            className={inputClasses(!!errors.message)}
            placeholder="Please describe your inquiry or concern..."
          />
          {errors.message && <p className="mt-1 text-sm text-terracotta">{errors.message}</p>}
        </div>

        {/* hCaptcha placeholder */}
        <div className="bg-sage-light border border-sage/30 rounded-lg p-6 text-center">
          <p className="text-sm opacity-60 mb-1">hCaptcha will be integrated here</p>
          <p className="text-xs opacity-40">Prevents spam and ensures legitimate submissions</p>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </Button>
      </form>
    </Card>
  );
}
