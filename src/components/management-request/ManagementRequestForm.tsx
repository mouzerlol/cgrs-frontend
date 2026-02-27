'use client';

import { useState, useCallback, useRef } from 'react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import {
  ManagementRequestFormData,
  ManagementRequestErrors,
  ManagementCategoryId,
} from '@/types/management-request';
import { MANAGEMENT_CATEGORIES, getCategoryById } from '@/data/management-categories';
import {
  validateFormData,
  generateIssueId,
  getInitialFormData,
} from '@/lib/management-request';
import { SidebarLayout } from '@/components/shared/SidebarLayout';
import type { SidebarCategory } from '@/components/shared/SidebarLayout';
import { RequestFormFields } from './RequestFormFields';
import { SuccessConfirmation } from './SuccessConfirmation';

/**
 * Field IDs in order of appearance for scroll-to-error functionality.
 * Maps error keys to their corresponding input element IDs.
 */
const FIELD_ORDER: (keyof ManagementRequestErrors)[] = [
  'fullName',
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
  const formContainerRef = useRef<HTMLDivElement>(null);

  const activeCategory = getCategoryById(formData.category);

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

      setIsSubmitting(true);

      try {
        // Simulate API call (replace with actual API integration)
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Generate issue ID
        const issueId = generateIssueId(formData.category);

        // Mark as submitted
        setSubmittedId(issueId);
        setIsSubmitted(true);

        // Scroll to top to show success message
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (error) {
        console.error('Submission error:', error);
        setErrors({
          description: 'Failed to submit request. Please try again.',
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData]
  );

  const handleSubmitAnother = useCallback(() => {
    setFormData(getInitialFormData());
    setErrors({});
    setIsSubmitted(false);
    setSubmittedId(null);
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
        categories={sidebarCategories}
        activeCategory={formData.category}
        onCategoryChange={(id) => {
          if (id) handleCategoryChange(id as ManagementCategoryId);
        }}
        ariaLabel="Request categories"
      >
        {/* Form Header */}
        {activeCategory && (
          <div className="flex items-start gap-md pb-md mb-md border-b border-sage-light max-sm:flex-col max-sm:items-center max-sm:text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-terracotta rounded-xl text-bone shrink-0">
              <Icon icon={activeCategory.icon} width={24} height={24} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-xl font-medium text-forest mb-1">
                {activeCategory.name}
              </h3>
              <p className="text-sm text-forest/70 leading-relaxed">
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
          />

          {/* Submit Button */}
          <div className="mt-lg pt-md border-t border-sage-light">
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
