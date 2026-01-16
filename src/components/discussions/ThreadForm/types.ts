export interface ThreadFormData {
  title: string;
  body: string;
  category: string;
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
