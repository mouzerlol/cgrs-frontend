'use client';

import { useState } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/sections/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ email?: string }>({});

  const validateForm = (): boolean => {
    if (!email.trim()) {
      setErrors({ email: 'Email is required' });
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsSubmitted(true);
      setEmail('');
    } catch (error) {
      console.error('Password reset error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Reset Password"
        description="Recover your account access by resetting your password securely."
        eyebrow="Account Security"
        backgroundImage="/images/mangere-mountain.jpg"
      />

      <section className="section">
        <div className="container">
          <div className="max-w-md mx-auto py-12">
            {/* Password Reset Card */}
            <Card className="p-8">
              <h2 className="font-display text-3xl font-medium mb-4">
                Reset Password
              </h2>
              <p className="opacity-70 mb-8">
                Enter your email address and we'll send you instructions to reset your password.
              </p>

              {isSubmitted ? (
                <div className="text-center py-12">
                  <Icon name="mail" size="xl" className="text-forest/50 mb-4" />
                  <div className="text-5xl mb-4">✓</div>
                  <h3 className="font-display text-2xl font-medium mb-2">
                    Reset Link Sent
                  </h3>
                  <p className="opacity-70">
                    We've sent password reset instructions to your email. Please check your inbox and follow the instructions.
                  </p>
                  <div className="space-y-4 mt-6">
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => setIsSubmitted(false)}
                      className="w-full"
                    >
                      Back to Login
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setIsSubmitted(false)}
                      className="w-full"
                    >
                      Check Email
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Field */}
                  <div className="mb-6">
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Email Address <span className="text-terracotta">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors({ email: undefined });
                      }}
                      placeholder="your.email@example.com"
                      className={`w-full px-4 py-3 bg-white border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-terracotta/50 focus:border-terracotta ${
                        errors.email ? 'border-terracotta' : 'border-sage/30'
                      }`}
                      required
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-terracotta">{errors.email}</p>
                    )}
                  </div>

                  {/* Instructions */}
                  <div className="bg-sage-light border-l border-sage/30 rounded-lg p-6 mb-6">
                    <h4 className="font-medium mb-2">What happens next?</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm opacity-80">
                      <li>Check your email inbox for the password reset link</li>
                      <li>Click the link in the email to create a new password</li>
                      <li>Sign in with your new password</li>
                    </ol>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? 'Sending Reset Link...' : 'Send Reset Link'}
                  </Button>

                  {/* Back to Login */}
                  <div className="text-center mt-6">
                    <Button variant="ghost" asChild>
                      <Link href="/login" className="flex items-center gap-2">
                        <Icon name="arrow-right" size="sm" />
                        Back to Login
                      </Link>
                    </Button>
                  </div>
                </form>
              )}
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
