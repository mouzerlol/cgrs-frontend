'use client';

import { useState } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/sections/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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
      setIsSubmitted(true);
      setFormData({ email: '', password: '' });
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Resident Login"
        description="Access your resident account to manage your account, view statements, and update your details."
        eyebrow="Resident Portal"
        backgroundImage="/images/mangere-mountain.jpg"
      />

      <section className="section">
        <div className="container">
          <div className="max-w-md mx-auto py-12">
            {/* Login Card */}
            <Card className="p-8">
              <h2 className="font-display text-3xl font-medium mb-4">
                Sign In
              </h2>
              <p className="opacity-70 mb-8">
                Enter your email address and password to access your resident portal.
              </p>

              {isSubmitted ? (
                <div className="text-center py-12">
                  <Icon name="calendar" size="xl" className="text-forest/50 mb-4" />
                  <div className="text-5xl mb-4">✓</div>
                  <h3 className="font-display text-2xl font-medium mb-2">
                    Login Successful
                  </h3>
                  <p className="opacity-70">
                    You have successfully logged in. Redirecting to your portal...
                  </p>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => setIsSubmitted(false)}
                    className="mt-6"
                  >
                    Continue to Portal
                  </Button>
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

                  {/* Password Field */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <label htmlFor="password" className="block text-sm font-medium">
                        Password <span className="text-terracotta">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-sm text-forest hover:text-terracotta transition-colors"
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    <Link
                      href="/forgot-password"
                      className="text-sm text-forest hover:text-terracotta"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value });
                      if (errors.password) setErrors({ ...errors, password: undefined });
                    }}
                    placeholder="••••••••••"
                    className={`w-full px-4 py-3 bg-white border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-terracotta/50 focus:border-terracotta ${
                      errors.password ? 'border-terracotta' : 'border-sage/30'
                    }`}
                    required
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-terracotta">{errors.password}</p>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? 'Signing In...' : 'Sign In'}
                  </Button>

                  {/* Register Link */}
                  <div className="text-center mt-6">
                    <p className="text-sm opacity-70 mb-2">
                      Don't have an account?
                    </p>
                    <Button variant="outline" asChild>
                      <Link href="/register" className="flex items-center gap-2">
                        <Icon name="user" size="sm" />
                        Register Account
                      </Link>
                    </Button>
                  </div>

                  {/* Contact Support */}
                  <div className="mt-6 pt-6 border-t border-sage/20">
                    <p className="text-center text-sm opacity-70 mb-2">
                      Need help logging in?
                    </p>
                    <Button variant="ghost" asChild className="w-full">
                      <Link href="/contact?subject=login-help" className="flex items-center gap-2">
                        <Icon name="mail" size="sm" />
                        Contact Support
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
