'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import {
  ManagementRequestFormData,
  ManagementRequestErrors,
  ManagementCategoryId,
} from '@/types/management-request';
import { createManagementRequest } from '@/lib/api/management-requests';
import { ApiError, isLocalApi } from '@/lib/api/client';
import { MANAGEMENT_CATEGORIES, getCategoryById } from '@/data/management-categories';
import { validateFormData, getInitialFormData } from '@/lib/management-request';
import { SidebarLayout } from '@/components/shared/SidebarLayout';
import type { SidebarCategory } from '@/components/shared/SidebarLayout';
import { RequestFormFields } from './RequestFormFields';
import { SuccessConfirmation } from './SuccessConfirmation';

/**
 * Field IDs in order of appearance for scroll-to-error functionality.
 * Maps error keys to their corresponding input element IDs.
 */
const FIELD_ORDER: (keyof ManagementRequestErrors)[] = [
  'full_name',
  'email',
  'subject',
  'description',
  'photos',
];

/**
 * Scroll to the first field with an error.
 * Uses smooth scrolling with offset for fixed header.
 */
function scrollToFirstError(errors: ManagementRequestErrors) {
  for (const fieldKey of FIELD_ORDER) {
    if (errors[fieldKey]) {
      const element = document.getElementById(fieldKey);
      if (element) {
        // Scroll with offset for fixed header (approximately 100px)
        const offset = 120;
        const elementPosition = element.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
          top: elementPosition - offset,
          behavior: 'smooth',
        });
        // Focus the element for accessibility
        element.focus({ preventScroll: true });
        return;
      }
    }
  }
}

/**
 * Main management request form container.
 * Handles form state, validation, and submission.
 * Uses folder-tab navigation on desktop, dropdown on mobile.
 */
export function ManagementRequestForm() {
  const [formData, setFormData] = useState<ManagementRequestFormData>(
    getInitialFormData()
  );
  const [errors, setErrors] = useState<ManagementRequestErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [submittedRequestHref, setSubmittedRequestHref] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [requiresCaptcha, setRequiresCaptcha] = useState<boolean>(true);
  const formContainerRef = useRef<HTMLDivElement>(null);
  const { getToken, isSignedIn, userId } = useAuth();
  const { user } = useUser();

  // Show CAPTCHA for:
  // - Signed-out users (always)
  // - Signed-in users who require CAPTCHA based on their role (from backend)
  const showCaptcha = !isSignedIn || requiresCaptcha;
  const isVerifiedUser = isSignedIn && !requiresCaptcha;

  const activeCategory = getCategoryById(formData.category);

  // When user signs in, pre-fill their name and email from Clerk user object
  useEffect(() => {
    if (isSignedIn && user) {
      const fullName = user.fullName || undefined;
      const email = user.primaryEmailAddress?.emailAddress || undefined;
      if (fullName || email) {
        setFormData((prev) => ({
          ...prev,
          full_name: fullName || prev.full_name,
          email: email || prev.email,
        }));
      }
    }
  }, [isSignedIn, user]);

  // Fetch requires_captcha from backend API (determines if user needs CAPTCHA based on role)
  useEffect(() => {
    if (isSignedIn && userId) {
      getToken({ skipCache: true }).then(async (token) => {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (res.ok) {
            const userData = await res.json();
            setRequiresCaptcha(userData.requires_captcha ?? true);
          }
        } catch {
          // Silently fail - CAPTCHA will be shown by default
        }
      });
    }
  }, [isSignedIn, userId, getToken]);

  const handleCategoryChange = useCallback((categoryId: ManagementCategoryId) => {
    setFormData((prev) => ({
      ...prev,
      category: categoryId,
    }));
    // Clear errors when switching categories
    setErrors({});
  }, []);

  const handleFieldChange = useCallback(
    <K extends keyof ManagementRequestFormData>(
      field: K,
      value: ManagementRequestFormData[K]
    ) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
      // Clear specific field error when user starts typing
      if (errors[field as keyof ManagementRequestErrors]) {
        setErrors((prev) => ({
          ...prev,
          [field]: undefined,
        }));
      }
    },
    [errors]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Validate form
      const validationErrors = validateFormData(formData);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        // Scroll to first error field
        setTimeout(() => scrollToFirstError(validationErrors), 100);
        return;
      }

      // Require CAPTCHA for non-verified users (not signed in or contact role)
      if (showCaptcha && !captchaToken) {
        setErrors({
          description: 'Please complete the CAPTCHA verification.',
        });
        return;
      }

      if (!isSignedIn && !isLocalApi) {
        setErrors({
          description: 'Please sign in to submit a management request.',
        });
        return;
      }

      setIsSubmitting(true);

      try {
        const submissionData = {
          ...formData,
          captchaToken: showCaptcha ? captchaToken : undefined,
        };
        const created = await createManagementRequest(submissionData, getToken);

        // Mark as submitted
        setSubmittedId(created.request.id);
        setSubmittedRequestHref(`/profile/reported-issues/${created.request.id}`);
        setIsSubmitted(true);
        // Do not scroll here: the form is replaced by a shorter success view, so smooth scroll races
        // with layout; SuccessConfirmation handles scroll + focus to avoid focus jumping to footer buttons.
      } catch (error) {
        console.error('Submission error:', error);
        setErrors({
          description:
            error instanceof ApiError
              ? 'Failed to submit request. Please check your details and try again.'
              : 'Failed to submit request. Please try again.',
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, getToken, isSignedIn, showCaptcha, captchaToken]
  );

  const handleSubmitAnother = useCallback(() => {
    setFormData(getInitialFormData());
    setErrors({});
    setIsSubmitted(false);
    setSubmittedId(null);
    setSubmittedRequestHref(null);
    setCaptchaToken(null);
    // Scroll to top of page when starting a new request
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Show success confirmation if submitted
  if (isSubmitted && submittedId && activeCategory) {
    return (
      <SuccessConfirmation
        issueId={submittedId}
        categoryName={activeCategory.name}
        onSubmitAnother={handleSubmitAnother}
        viewRequestHref={submittedRequestHref}
      />
    );
  }

  // Map management categories to sidebar format
  const sidebarCategories: SidebarCategory[] = MANAGEMENT_CATEGORIES.map((c) => ({
    id: c.id,
    name: c.name,
    icon: c.icon,
  }));

  return (
    <div ref={formContainerRef}>
      <SidebarLayout
        compact
        categories={sidebarCategories}
        activeCategory={formData.category}
        onCategoryChange={(id) => {
          if (id) handleCategoryChange(id as ManagementCategoryId);
        }}
        ariaLabel="Request categories"
      >
        {/* Form Header */}
        {activeCategory && (
          <div className="flex items-start gap-sm pb-sm mb-sm border-b border-sage-light max-sm:flex-col max-sm:items-center max-sm:text-center sm:gap-md sm:pb-md sm:mb-md">
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-terracotta rounded-lg sm:rounded-xl text-bone shrink-0">
              <Icon icon={activeCategory.icon} width={24} height={24} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-lg sm:text-xl font-medium text-forest mb-0.5 sm:mb-1">
                {activeCategory.name}
              </h3>
              <p className="text-sm text-forest/70 leading-snug sm:leading-relaxed">
                {activeCategory.description}
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <RequestFormFields
            data={formData}
            errors={errors}
            onChange={handleFieldChange}
            isSubmitting={isSubmitting}
            categoryId={formData.category}
            isVerifiedUser={isVerifiedUser}
            showCaptcha={showCaptcha}
            captchaToken={captchaToken}
            onCaptchaChange={setCaptchaToken}
          />

          {/* Submit Button */}
          <div className="flex justify-end mt-lg pt-md border-t border-sage-light">
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                'inline-flex items-center justify-center gap-sm',
                'py-3.5 px-8 min-h-[52px]',
                'bg-terracotta rounded-xl',
                'font-body text-base font-semibold text-bone',
                'cursor-pointer border-none',
                'transition-all duration-[250ms] ease-out-custom',
                'hover:bg-terracotta-dark',
                'disabled:opacity-70 disabled:cursor-not-allowed',
                isSubmitting && 'bg-forest-light'
              )}
            >
              {isSubmitting ? (
                <>
                  <Icon
                    icon="lucide:loader-2"
                    width={20}
                    height={20}
                    className="animate-spin"
                  />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Icon icon="lucide:send" width={20} height={20} />
                  <span>Submit Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </SidebarLayout>
    </div>
  );
}
