'use client';

import { cn } from '@/lib/utils';
import { ImageUploader } from '@/components/discussions/ThreadForm/ImageUploader';
import { LocationPicker } from './LocationPicker';
import {
  ManagementRequestFormData,
  ManagementRequestErrors,
  RequestLocation,
} from '@/types/management-request';

interface RequestFormFieldsProps {
  data: ManagementRequestFormData;
  errors: ManagementRequestErrors;
  onChange: <K extends keyof ManagementRequestFormData>(
    field: K,
    value: ManagementRequestFormData[K]
  ) => void;
  isSubmitting: boolean;
}

/**
 * Form fields for management request submission.
 * Includes contact info, issue details, photos, and location picker.
 */
export function RequestFormFields({
  data,
  errors,
  onChange,
  isSubmitting,
}: RequestFormFieldsProps) {
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    onChange(name as keyof ManagementRequestFormData, value as never);
  };

  const handlePhotosChange = (files: File[]) => {
    onChange('photos', files);
  };

  const handleLocationChange = (location: RequestLocation | null) => {
    onChange('location', location);
  };

  return (
    <div className="request-form-fields">
      {/* Contact Information */}
      <div className="request-form-section">
        <h4 className="request-form-section-title">Contact Information</h4>

        <div className="request-form-row">
          <div className="request-form-field">
            <label htmlFor="fullName" className="request-form-label">
              Full Name <span className="text-terracotta">*</span>
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={data.fullName}
              onChange={handleInputChange}
              disabled={isSubmitting}
              className={cn(
                'request-form-input',
                errors.fullName && 'request-form-input-error'
              )}
              placeholder="Enter your full name"
              autoComplete="name"
            />
            {errors.fullName && (
              <span className="request-form-error">{errors.fullName}</span>
            )}
          </div>

          <div className="request-form-field">
            <label htmlFor="email" className="request-form-label">
              Email <span className="text-terracotta">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={data.email}
              onChange={handleInputChange}
              disabled={isSubmitting}
              className={cn(
                'request-form-input',
                errors.email && 'request-form-input-error'
              )}
              placeholder="your.email@example.com"
              autoComplete="email"
            />
            {errors.email && (
              <span className="request-form-error">{errors.email}</span>
            )}
          </div>
        </div>
      </div>

      {/* Issue Details */}
      <div className="request-form-section">
        <h4 className="request-form-section-title">Issue Details</h4>

        <div className="request-form-field">
          <label htmlFor="subject" className="request-form-label">
            Subject <span className="text-terracotta">*</span>
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={data.subject}
            onChange={handleInputChange}
            disabled={isSubmitting}
            className={cn(
              'request-form-input',
              errors.subject && 'request-form-input-error'
            )}
            placeholder="Brief summary of the issue"
          />
          {errors.subject && (
            <span className="request-form-error">{errors.subject}</span>
          )}
        </div>

        <div className="request-form-field">
          <label htmlFor="description" className="request-form-label">
            Description <span className="text-terracotta">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={data.description}
            onChange={handleInputChange}
            disabled={isSubmitting}
            className={cn(
              'request-form-textarea',
              errors.description && 'request-form-input-error'
            )}
            placeholder="Please provide detailed information about the issue, including when it started and any relevant context..."
            rows={5}
          />
          <div className="request-form-field-footer">
            {errors.description ? (
              <span className="request-form-error">{errors.description}</span>
            ) : (
              <span className="request-form-hint">
                Minimum 20 characters, maximum 2000
              </span>
            )}
            <span className="request-form-counter">
              {data.description.length} / 2000
            </span>
          </div>
        </div>
      </div>

      {/* Photos */}
      <div className="request-form-section">
        <h4 className="request-form-section-title">Photos</h4>
        <div id="photos">
          <ImageUploader
            value={data.photos}
            onChange={handlePhotosChange}
            maxFiles={5}
            maxSizeMB={5}
          />
        </div>
        {errors.photos && (
          <span className="request-form-error mt-2">{errors.photos}</span>
        )}
      </div>

      {/* Location */}
      <div className="request-form-section">
        <h4 className="request-form-section-title">Issue Location</h4>
        <LocationPicker
          value={data.location}
          onChange={handleLocationChange}
        />
      </div>

      {/* Captcha Placeholder */}
      <div className="request-form-section">
        <h4 className="request-form-section-title">Verification</h4>
        <div className="captcha-placeholder">
          <div className="captcha-placeholder-box">
            <div className="captcha-placeholder-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div className="captcha-placeholder-text">
              <span className="captcha-placeholder-label">CAPTCHA verification</span>
              <span className="captcha-placeholder-hint">Will be integrated before launch</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
