'use client';

import { useState } from 'react';
import Image from 'next/image';
import Button from '@/components/ui/Button';

/**
 * Footer newsletter sign-up section with background image.
 * Features email input and subscribe button with overlay effects.
 */
export default function FooterNewsletter() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsSubmitted(true);
      setEmail('');
    } catch (error) {
      console.error('Newsletter subscription error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      className="relative min-h-[340px] flex items-center justify-center overflow-hidden mt-8 md:mt-16"
    >
      {/* Background Image with overlays */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/huri-street.png"
          alt="Huri Street"
          fill
          className="object-cover"
          priority
        />
        {/* Semi-opaque black mask over image */}
        <div className="absolute inset-0 bg-black/35" />
        {/* Vertical gradient from top */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/50" />
      </div>

      {/* Content */}
      <div className="container relative z-10 py-12 md:py-20">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-bone mb-4">
            Stay Connected
          </h2>
          <p className="text-lg font-medium text-bone/95 mb-8 max-w-xl mx-auto">
            Subscribe to our newsletter for the latest community updates and events.
          </p>

          {isSubmitted ? (
            <div className="bg-bone/95 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="font-display text-xl font-medium text-forest mb-2">
                Thank You!
              </h3>
              <p className="text-forest/70 mb-6">
                You've been successfully subscribed to our newsletter.
              </p>
              <Button
                variant="outline"
                onClick={() => setIsSubmitted(false)}
              >
                Subscribe Another Email
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 px-4 py-3 bg-bone/95 backdrop-blur-sm border border-bone/20 rounded-lg text-forest placeholder:text-forest/50 focus:outline-none focus:ring-2 focus:ring-terracotta/50 focus:border-terracotta transition-all"
                  aria-label="Email address"
                />
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="whitespace-nowrap"
                >
                  {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                </Button>
              </div>
              <p className="text-sm text-bone/80">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
