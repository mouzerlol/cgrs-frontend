'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useCategories } from '@/hooks/useDiscussions';
import { TitleInput } from './TitleInput';
import { BodyInput } from './BodyInput';
import { CategorySelect } from './CategorySelect';
import { ImageUploader } from './ImageUploader';
import { LinkInput } from './LinkInput';
import { PollBuilder } from './PollBuilder';
import type { ThreadFormData } from './types';

interface NewThreadFormProps {
  onSubmit?: (data: ThreadFormData) => void;
  initialData?: Partial<ThreadFormData>;
  onCancel?: () => void;
}

/**
 * Thread creation form component.
 * Allows users to create new discussion threads with title, body, category,
 * images, links, and optional polls.
 */
export function ThreadForm({
  onSubmit,
  initialData,
  onCancel,
}: NewThreadFormProps) {
  const router = useRouter();
  const { data: categories = [] } = useCategories();

  const [title, setTitle] = useState(initialData?.title || '');
  const [body, setBody] = useState(initialData?.body || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [images, setImages] = useState<File[]>(initialData?.images || []);
  const [links, setLinks] = useState<{ url: string; title?: string }[]>(
    initialData?.links || []
  );
  const [poll, setPoll] = useState<{
    question: string;
    options: string[];
    allowMultiple: boolean;
  } | null>(initialData?.poll || null);

  const [errors, setErrors] = useState<Partial<Record<keyof ThreadFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ThreadFormData, string>> = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.trim().length < 10) {
      newErrors.title = 'Title must be at least 10 characters';
    }

    if (!category) {
      newErrors.category = 'Please select a category';
    }

    if (poll && (!poll.question.trim() || poll.options.filter(o => o.trim()).length < 2)) {
      setSubmitError('Poll must have a question and at least 2 options');
      return false;
    }

    setErrors(newErrors);
    setSubmitError(null);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const formData: ThreadFormData = {
        title: title.trim(),
        body: body.trim(),
        category,
        images,
        links,
        poll: poll || undefined,
      };

      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (onSubmit) {
        onSubmit(formData);
      } else {
        router.push('/discussion');
      }
    } catch (error) {
      setSubmitError('Failed to create thread. Please try again.');
      console.error('Thread submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-bone">
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel || (() => router.back())}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="font-display text-2xl md:text-3xl">Create a New Thread</h1>
            <p className="text-forest/70 mt-xs">
              Share your thoughts with the community. Please be respectful and constructive.
            </p>
          </div>

          <Card className="p-lg mb-lg">
            <form onSubmit={handleSubmit} className="flex flex-col gap-lg">
              {submitError && (
                <div className="flex items-center gap-sm p-md bg-terracotta/10 border border-terracotta rounded-lg text-terracotta">
                  <AlertCircle className="w-5 h-5" />
                  <span>{submitError}</span>
                </div>
              )}

              <TitleInput
                value={title}
                onChange={setTitle}
                error={errors.title}
              />

              <BodyInput
                value={body}
                onChange={setBody}
                error={errors.body}
              />

              <CategorySelect
                value={category}
                onChange={setCategory}
                categories={categories}
                error={errors.category}
              />

              <ImageUploader
                value={images}
                onChange={setImages}
              />

              <LinkInput
                value={links}
                onChange={setLinks}
              />

              <PollBuilder
                value={poll || undefined}
                onChange={(value) => setPoll(value)}
              />

              <div className="flex justify-end gap-md pt-md border-t border-sage">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel || (() => router.back())}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                  size="lg"
                >
                  {isSubmitting ? 'Creating...' : 'Create Thread'}
                </Button>
              </div>
            </form>
          </Card>

          <div className="bg-sage-light rounded-xl p-md">
            <h3 className="font-display text-lg mb-3">Community Guidelines</h3>
            <ul className="list-disc pl-md text-forest/80 flex flex-col gap-xs text-sm">
              <li>Be respectful and constructive in your discussions</li>
              <li>Stay on topic and choose the appropriate category</li>
              <li>No spam, advertising, or promotional content</li>
              <li>Respect privacy - do not share personal information</li>
              <li>Report inappropriate content to moderators</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ThreadForm;
