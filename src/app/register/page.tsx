'use client';

import { useState } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/sections/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [showPasswords, setShowPasswords] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSubmitted(true);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeToTerms: false,
      });
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Register Account"
        description="Create a new resident account to access community resources and stay connected with your neighbors."
        eyebrow="Resident Portal"
        backgroundImage="/images/mangere-mountain.jpg"
      />

      <section className="section">
        <div className="container">
          <div className="max-w-lg mx-auto py-12">
            {/* Registration Card */}
            <Card className="p-8">
              <h2 className="font-display text-3xl font-medium mb-4">
                Create Resident Account
              </h2>
              <p className="opacity-70 mb-8">
                Complete the form below to create your resident account. You'll need to verify your email before accessing your portal.
              </p>

              {isSubmitted ? (
                <div className="text-center py-12">
                  <Icon name="user" size="xl" className="text-forest/50 mb-4" />
                  <div className="text-5xl mb-4">✓</div>
                  <h3 className="font-display text-2xl font-medium mb-2">
                    Registration Successful
                  </h3>
                  <p className="opacity-70">
                    Your account has been created successfully! Please check your email for verification instructions.
                  </p>
                  <div className="space-y-4 mt-6">
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => setIsSubmitted(false)}
                      className="w-full"
                    >
                      Check Email
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setIsSubmitted(false)}
                      className="w-full"
                    >
                      Back to Login
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name Fields */}
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium mb-2">
                        First Name <span className="text-terracotta">*</span>
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => {
                          setFormData({ ...formData, firstName: e.target.value });
                          if (errors.firstName) setErrors({ ...errors, firstName: undefined });
                        }}
                        placeholder="John"
                        className={`w-full px-4 py-3 bg-white border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-terracotta/50 focus:border-terracotta ${
                          errors.firstName ? 'border-terracotta' : 'border-sage/30'
                        }`}
                        required
                      />
                      {errors.firstName && (
                        <p className="mt-1 text-sm text-terracotta">{errors.firstName}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium mb-2">
                        Last Name <span className="text-terracotta">*</span>
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => {
                          setFormData({ ...formData, lastName: e.target.value });
                          if (errors.lastName) setErrors({ ...errors, lastName: undefined });
                        }}
                        placeholder="Smith"
                        className={`w-full px-4 py-3 bg-white border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-terracotta/50 focus:border-terracotta ${
                          errors.lastName ? 'border-terracotta' : 'border-sage/30'
                        }`}
                        required
                      />
                      {errors.lastName && (
                        <p className="mt-1 text-sm text-terracotta">{errors.lastName}</p>
                      )}
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="mb-6">
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Email Address <span className="text-terracotta">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (errors.email) setErrors({ ...errors, email: undefined });
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

                  {/* Password Fields */}
                  <div className="mb-6">
                    <div className="mb-6">
                      <label htmlFor="password" className="block text-sm font-medium mb-2">
                        Password <span className="text-terracotta">*</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type={showPasswords ? 'text' : 'password'}
                          id="password"
                          value={formData.password}
                          onChange={(e) => {
                            setFormData({ ...formData, password: e.target.value });
                            if (errors.password) setErrors({ ...errors, password: undefined });
                          }}
                          placeholder="•••••••••"
                          className={`w-full px-4 py-3 bg-white border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-terracotta/50 focus:border-terracotta ${
                            errors.password ? 'border-terracotta' : 'border-sage/30'
                          }`}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(!showPasswords)}
                          className="text-sm text-forest hover:text-terracotta"
                        >
                          {showPasswords ? 'Hide' : 'Show'}
                        </button>
                      </div>
                    </div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                      Confirm Password <span className="text-terracotta">*</span>
                    </label>
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      id="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={(e) => {
                        setFormData({ ...formData, confirmPassword: e.target.value });
                        if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                      }}
                      placeholder="•••••••••"
                      className={`w-full px-4 py-3 bg-white border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-terracotta/50 focus:border-terracotta ${
                        errors.confirmPassword ? 'border-terracotta' : 'border-sage/30'
                      }`}
                      required
                    />
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-terracotta">{errors.confirmPassword}</p>
                    )}
                    {errors.password && (
                      <p className="mt-1 text-sm text-terracotta">{errors.password}</p>
                    )}
                  </div>

                  {/* Terms & Submit */}
                  <div className="flex items-start gap-3 mb-6">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        id="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onChange={(e) => {
                          setFormData({ ...formData, agreeToTerms: e.target.checked });
                          if (errors.agreeToTerms) setErrors({ ...errors, agreeToTerms: undefined });
                        }}
                        className="w-5 h-5 rounded border-sage/30 text-forest focus:ring-2 focus:ring-terracotta/50"
                      />
                      <span className="text-sm">
                        I agree to the <a href="/guidelines" className="text-terracotta hover:underline">Community Guidelines</a> and <a href="/contact" className="text-terracotta hover:underline">Terms of Service</a>
                      </span>
                    </label>
                    {errors.agreeToTerms && (
                      <p className="mt-1 text-sm text-terracotta">{errors.agreeToTerms}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? 'Creating Account...' : 'Create Account'}
                  </Button>

                  {/* Back to Login */}
                  <div className="text-center mt-6">
                    <p className="text-sm opacity-70 mb-2">
                      Already have an account?
                    </p>
                    <Button variant="ghost" asChild>
                      <Link href="/login" className="flex items-center gap-2">
                        <Icon name="arrow-right" size="sm" />
                        Sign In Instead
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
