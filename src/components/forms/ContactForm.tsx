'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { FormInput } from '@/components/ui/FormInput';
import { FormTextarea } from '@/components/ui/FormTextarea';
import { TurnstileCaptcha } from '@/components/management-request/TurnstileCaptcha';
import { ContactFormData } from '@/types';
import { submitContactForm } from '@/lib/api/contact';

interface ContactFormProps {
  onSubmit?: (data: ContactFormData) => void;
}

/**
 * Contact form with new design system styling and Cloudflare Turnstile CAPTCHA.
 */
export default function ContactForm({ onSubmit }: ContactFormProps) {
  const { getToken } = useAuth();
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<ContactFormData>>({});
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

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

    // Require CAPTCHA for anonymous users
    if (!captchaToken) {
      setErrors({ message: 'Please complete the CAPTCHA verification.' });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitContactForm(
        {
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          captchaToken,
        },
        getToken,
      );

      onSubmit?.(formData);
      setIsSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setCaptchaToken(null);
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors({ message: 'Failed to send message. Please try again.' });
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

  const handleCaptchaChange = (token: string | null) => {
    setCaptchaToken(token);
    if (errors.message && token) {
      setErrors(prev => ({ ...prev, message: undefined }));
    }
  };

  if (isSubmitted) {
    return (
      <Card className="text-center p-8">
        <div className="text-5xl mb-4">✅</div>
        <h3 className="font-display text-2xl font-medium mb-4">Thank You!</h3>
        <p className="opacity-70 mb-6">
          Your message has been sent successfully. We&apos;ll get back to you as soon as possible.
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
        <FormInput
          label="Name *"
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Your full name"
          error={errors.name}
        />

        <FormInput
          label="Email *"
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="your.email@example.com"
          error={errors.email}
        />

        <FormInput
          label="Subject *"
          type="text"
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          placeholder="What is this about?"
          error={errors.subject}
        />

        <FormTextarea
          label="Message *"
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={5}
          placeholder="Please describe your inquiry or concern..."
          error={errors.message}
        />

        <TurnstileCaptcha onTokenChange={handleCaptchaChange} />

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
