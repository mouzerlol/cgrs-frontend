import type { ThreadVisibilityValue } from '@/lib/discussionVisibility';

export interface ThreadFormData {
  title: string;
  body: string;
  category: string;
  /** Set when the user is owner+; omitted for others (API applies role default). */
  visibility?: ThreadVisibilityValue;
  images: File[];
  links: { url: string; title?: string }[];
  poll?: {
    question: string;
    options: string[];
    allowMultiple: boolean;
  };
}

export interface ThreadFormProps {
  onSubmit?: (data: ThreadFormData) => void;
  initialData?: Partial<ThreadFormData>;
  onCancel?: () => void;
}
