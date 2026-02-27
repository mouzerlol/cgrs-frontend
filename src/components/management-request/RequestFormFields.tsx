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

const sectionTitleCls = 'font-body text-xs font-semibold uppercase tracking-widest text-terracotta mb-xs';
const inputCls = [
  'w-full py-3 px-4 bg-bone border border-sage rounded-[10px]',
  'font-body text-base text-forest',
  'transition-all duration-[250ms] ease-out-custom',
  'focus:outline-none focus:border-terracotta focus:ring-[3px] focus:ring-terracotta/10',
  'placeholder:text-sage',
  'disabled:opacity-60 disabled:cursor-not-allowed',
].join(' ');
const errorCls = 'text-[0.8125rem] text-terracotta';
const labelCls = 'font-body text-sm font-medium text-forest';

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
    <div className="flex flex-col gap-lg">
      {/* Contact Information */}
      <div className="flex flex-col gap-sm">
        <h4 className={sectionTitleCls}>Contact Information</h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="fullName" className={labelCls}>
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
                inputCls,
                errors.fullName && 'border-terracotta'
              )}
              placeholder="Enter your full name"
              autoComplete="name"
            />
            {errors.fullName && (
              <span className={errorCls}>{errors.fullName}</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className={labelCls}>
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
                inputCls,
                errors.email && 'border-terracotta'
              )}
              placeholder="your.email@example.com"
              autoComplete="email"
            />
            {errors.email && (
              <span className={errorCls}>{errors.email}</span>
            )}
          </div>
        </div>
      </div>

      {/* Issue Details */}
      <div className="flex flex-col gap-sm">
        <h4 className={sectionTitleCls}>Issue Details</h4>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="subject" className={labelCls}>
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
              inputCls,
              errors.subject && 'border-terracotta'
            )}
            placeholder="Brief summary of the issue"
          />
          {errors.subject && (
            <span className={errorCls}>{errors.subject}</span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="description" className={labelCls}>
            Description <span className="text-terracotta">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={data.description}
            onChange={handleInputChange}
            disabled={isSubmitting}
            className={cn(
              inputCls,
              'resize-y min-h-[120px]',
              errors.description && 'border-terracotta'
            )}
            placeholder="Please provide detailed information about the issue, including when it started and any relevant context..."
            rows={5}
          />
          <div className="flex justify-between items-center">
            {errors.description ? (
              <span className={errorCls}>{errors.description}</span>
            ) : (
              <span className="text-xs text-forest/50">
                Minimum 20 characters, maximum 2000
              </span>
            )}
            <span className="text-xs font-body text-forest/50">
              {data.description.length} / 2000
            </span>
          </div>
        </div>
      </div>

      {/* Photos */}
      <div className="flex flex-col gap-sm">
        <h4 className={sectionTitleCls}>Photos</h4>
        <div id="photos">
          <ImageUploader
            value={data.photos}
            onChange={handlePhotosChange}
            maxFiles={5}
            maxSizeMB={5}
          />
        </div>
        {errors.photos && (
          <span className={cn(errorCls, 'mt-2')}>{errors.photos}</span>
        )}
      </div>

      {/* Location */}
      <div className="flex flex-col gap-sm">
        <h4 className={sectionTitleCls}>Issue Location</h4>
        <LocationPicker
          value={data.location}
          onChange={handleLocationChange}
        />
      </div>

      {/* Captcha Placeholder */}
      <div className="flex flex-col gap-sm">
        <h4 className={sectionTitleCls}>Verification</h4>
        <div className="p-md bg-bone border border-dashed border-sage rounded-xl">
          <div className="flex items-center gap-md">
            <div className="flex items-center justify-center w-12 h-12 bg-sage-light rounded-[10px] text-forest shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-body text-sm font-semibold text-forest">CAPTCHA verification</span>
              <span className="font-body text-xs text-sage">Will be integrated before launch</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
