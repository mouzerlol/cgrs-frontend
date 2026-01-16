# Phase 6: Thread Creation Form - Implementation Details

## Overview

Phase 6 implements the thread creation functionality for the CGRS Community Forum, allowing users to create new discussion threads with rich content including titles, body text, category selection, images, links, and optional polls.

## Implementation Architecture

### Component Structure

```
src/components/discussions/ThreadForm/
├── ThreadForm.tsx          # Main form container
├── types.ts                # TypeScript type definitions
├── TitleInput.tsx          # Title field with 150 char limit
├── BodyInput.tsx           # Body textarea with 2000 char limit
├── CategorySelect.tsx      # Category dropdown selector
├── ImageUploader.tsx       # Drag-drop image upload (max 5)
├── LinkInput.tsx           # URL input with optional title
└── PollBuilder.tsx         # Optional poll creation
```

### Key Design Decisions

#### 1. File Organization Pattern
Created a dedicated `ThreadForm/` subfolder to encapsulate all form-related components, keeping the main discussions component directory cleaner.

**Challenge encountered**: Exporting from nested folders caused webpack resolution issues. The solution was to export directly from the main `ThreadForm/ThreadForm.tsx` file rather than through barrel exports in subfolders.

#### 2. Form State Management
Used React `useState` for local form state rather than React Query or external state management since:
- Form data is transient (only needed during form session)
- No server synchronization required until submission
- Simplifies component hierarchy

```typescript
const [title, setTitle] = useState('');
const [body, setBody] = useState('');
const [category, setCategory] = useState('');
const [images, setImages] = useState<File[]>([]);
const [links, setLinks] = useState<{ url: string; title?: string }[]>([]);
const [poll, setPoll] = useState<PollData | null>(null);
```

#### 3. Validation Strategy
Client-side validation with immediate feedback:
- Title: required, minimum 10 characters, maximum 150
- Category: required selection
- Poll: requires question + at least 2 options when enabled

```typescript
const validateForm = (): boolean => {
  const newErrors = {};
  if (!title.trim()) newErrors.title = 'Title is required';
  else if (title.trim().length < 10) newErrors.title = 'Min 10 characters';
  if (!category) newErrors.category = 'Please select a category';
  // ...
  return Object.keys(newErrors).length === 0;
};
```

#### 4. Category Selection Component
Implemented custom dropdown using Headless UI patterns with:
- Color-coded categories (terracotta/forest/sage)
- Category descriptions on hover/selection
- Keyboard navigation support

```typescript
interface CategorySelectProps {
  value: string;
  onChange: (value: string) => void;
  categories: DiscussionCategory[];
  error?: string;
}
```

#### 5. Image Upload Features
- Drag-and-drop zone with visual feedback
- Maximum 5 images per thread
- Maximum 5MB per image
- Client-side file validation
- Thumbnail previews with remove button
- File size display

```typescript
interface ImageUploaderProps {
  value: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;       // Default: 5
  maxSizeMB?: number;      // Default: 5
}
```

#### 6. Poll Builder Features
Collapsible poll section that activates when:
- Question is entered (max 200 chars)
- At least 2 options are added

Supports:
- Dynamic option addition/removal
- Single vs multiple choice toggle
- Character counters on all inputs

```typescript
interface PollBuilderProps {
  value?: { question: string; options: string[]; allowMultiple: boolean };
  onChange: (value: PollData | null) => void;
}
```

#### 7. Character Counter Design
All text inputs include live character counters with warning colors:
- Normal: gray text
- Warning (<20 remaining): terracotta color
- Visual placement: inside input (title/poll) or below field (body)

## CSS Architecture

### Custom Classes Added to `globals.css`

```css
/* Form Section */
.thread-form-section { background: var(--bone); }
.thread-form-header { margin-bottom: var(--space-lg); }
.thread-form-card { padding: var(--space-lg); }
.thread-form { display: flex; flex-direction: column; gap: var(--space-lg); }
.thread-form-error { display: flex; align-items: center; gap: var(--space-sm); }
.thread-form-actions { display: flex; justify-content: flex-end; gap: var(--space-md); }
.thread-form-guidelines { background: var(--sage-light); border-radius: 12px; padding: var(--space-md); }

/* Title Input */
.title-input { display: flex; flex-direction: column; gap: var(--space-xs); }
.title-field { width: 100%; padding: var(--space-md); padding-right: 60px; }
.title-char-count { position: absolute; right: var(--space-md); top: 50%; }
.title-char-count-warning { color: var(--terracotta); }

/* Category Select */
.category-dropdown-wrapper { position: relative; }
.category-dropdown { position: absolute; top: calc(100% + 4px); left: 0; right: 0; }
.category-option { display: flex; align-items: flex-start; gap: var(--space-sm); }
.category-option-selected { background: var(--sage-light); }

/* Image Uploader */
.image-uploader-dropzone { border: 2px dashed var(--sage); border-radius: 12px; }
.image-uploader-dropzone-active { border-color: var(--terracotta); }
.image-uploader-preview { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); }
.image-uploader-thumb { position: relative; border-radius: 8px; overflow: hidden; }

/* Poll Builder */
.poll-builder { background: var(--sage-light); border-radius: 12px; }
.poll-option-row { display: flex; gap: var(--space-sm); align-items: center; }
.poll-add-option { display: flex; align-items: center; gap: var(--space-xs); }
.poll-checkbox-custom { width: 20px; height: 20px; border: 2px solid var(--sage); }
```

## Form Submission Flow

```
User fills form → validateForm() → isSubmitting = true
    → Simulated API call (1s delay)
    → onSubmit callback OR router.push('/discussions')
    → isSubmitting = false
```

## Integration Points

### React Query Hook
Uses `useCategories()` to fetch available categories:

```typescript
const { data: categories = [] } = useCategories();
```

### Page Integration
Located at `/discussions/new/page.tsx`:

```tsx
export default function NewThreadPage() {
  return (
    <div className="min-h-screen">
      <PageHeader title="Start a Discussion" eyebrow="New Thread" />
      <ThreadForm />
    </div>
  );
}
```

## Validation Rules Summary

| Field | Required | Min Length | Max Length | Notes |
|-------|----------|------------|------------|-------|
| Title | Yes | 10 | 150 | Shown in thread listings |
| Body | No | - | 2000 | Optional extended content |
| Category | Yes | - | - | Must select from available |
| Images | No | - | 5 | Max 5MB each, images only |
| Links | No | - | - | URL validation required |
| Poll | No | - | - | Optional, needs question + 2+ options |

## Accessibility Considerations

- All inputs have associated labels
- Character counters for screen readers
- Focus states visible on all interactive elements
- Error messages linked to inputs via aria-describedby
- Keyboard navigation in dropdowns

## Mobile Responsiveness

- Touch-friendly input targets (minimum 44px)
- Responsive grid for image thumbnails
- Full-width inputs on mobile
- Stacked form actions

## Future Enhancements (Post-Phase 6)

1. **Rich Text Editor**: Replace textarea with markdown support
2. **Auto-save Drafts**: Persist form state to localStorage
3. **Image Upload Progress**: Show upload progress for each image
4. **Category Suggestions**: ML-based category recommendation
5. **Preview Mode**: See how thread will appear before posting
6. **Scheduled Posting**: Delay posting to specific date/time
7. **Draft Management**: List and restore saved drafts

## Known Issues / Workarounds

1. **Webpack barrel exports**: Export `ThreadForm` directly from `ThreadForm/ThreadForm.tsx` rather than through index files in subfolders
2. **Large image previews**: Consider lazy-loading thumbnails for performance
3. **Form reset**: After successful submit, form resets to initial state

## Files Modified/Created

| File | Action | Purpose |
|------|--------|---------|
| `src/app/discussions/new/page.tsx` | Created | Route page for new thread |
| `src/components/discussions/ThreadForm.tsx` | Created | Main form container |
| `src/components/discussions/ThreadForm/TitleInput.tsx` | Created | Title field |
| `src/components/discussions/ThreadForm/BodyInput.tsx` | Created | Body textarea |
| `src/components/discussions/ThreadForm/CategorySelect.tsx` | Created | Category dropdown |
| `src/components/discussions/ThreadForm/ImageUploader.tsx` | Created | Image upload |
| `src/components/discussions/ThreadForm/LinkInput.tsx` | Created | Link input |
| `src/components/discussions/ThreadForm/PollBuilder.tsx` | Created | Poll creation |
| `src/components/discussions/ThreadForm/types.ts` | Created | TypeScript types |
| `src/app/globals.css` | Modified | Added thread form styles |

## Testing Checklist

- [ ] Title validation (required, min/max length)
- [ ] Category selection and validation
- [ ] Image drag-drop upload
- [ ] Image file type/size validation
- [ ] Link URL validation
- [ ] Poll creation (add/remove options)
- [ ] Poll validation (question + min options)
- [ ] Form submission with loading state
- [ ] Error display and clearing
- [ ] Cancel/back navigation
- [ ] Mobile layout responsiveness
- [ ] Keyboard navigation in dropdowns
- [ ] Screen reader announcements
