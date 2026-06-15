'use client';

import { useMemo, useRef, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import {
  Download,
  Eye,
  EyeOff,
  FileText,
  FolderPlus,
  Pencil,
  Trash2,
  Upload,
} from 'lucide-react';
import WorkManagementNavBar from '@/components/work-management/WorkManagementNavBar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { canAccessManagement } from '@/lib/auth';
import { ApiError } from '@/lib/api/client';
import {
  ALLOWED_DOCUMENT_CONTENT_TYPES,
  MAX_DOCUMENT_UPLOAD_BYTES,
} from '@/lib/api/societyDocuments';
import {
  useDeleteSocietyDocument,
  useDownloadSocietyDocument,
  useReplaceSocietyDocumentFile,
  useSocietyDocumentsQuery,
  useUpdateSocietyDocument,
  useUploadSocietyDocument,
} from '@/hooks/useSocietyDocuments';
import {
  useCreateSocietyDocumentCategory,
  useDeleteSocietyDocumentCategory,
  useSocietyDocumentCategoriesQuery,
  useUpdateSocietyDocumentCategory,
} from '@/hooks/useSocietyDocumentCategories';
import type { SocietyDocumentCategory, SocietyDocumentResponse } from '@/types/admin';

const inputClass =
  'w-full rounded border border-sage/40 bg-white px-3 py-2 text-sm text-forest focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest';

const CONTENT_TYPE_LABELS: Record<string, string> = {
  'application/pdf': 'PDF',
  'application/msword': 'Word',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
  'application/vnd.ms-excel': 'Excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel',
  'text/csv': 'CSV',
  'image/png': 'PNG',
  'image/jpeg': 'JPEG',
};

/** Visibility levels mirror the API's VisibilityEnum (value → audience). */
const VISIBILITY_OPTIONS = [
  { value: 30, label: 'Property owners and above' },
  { value: 20, label: 'Verified residents and above' },
  { value: 10, label: 'Signed-in members' },
  { value: 0, label: 'Everyone (including guests)' },
] as const;

const VISIBILITY_SHORT: Record<number, string> = {
  0: 'Everyone',
  10: 'Signed-in members',
  20: 'Residents & above',
  30: 'Owners & above',
};

const DEFAULT_VISIBILITY = 30;

function visibilityLabel(value: number): string {
  return VISIBILITY_SHORT[value] ?? `Level ${value}`;
}

function typeLabel(contentType: string): string {
  return CONTENT_TYPE_LABELS[contentType] ?? contentType;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function apiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return fallback;
}

/** Client-side mirror of the server file checks. Returns an error string or null. */
function preCheckFile(file: File): string | null {
  if (file.size > MAX_DOCUMENT_UPLOAD_BYTES) {
    return `File is too large. The maximum size is ${formatBytes(MAX_DOCUMENT_UPLOAD_BYTES)}.`;
  }
  if (file.type && !ALLOWED_DOCUMENT_CONTENT_TYPES.includes(file.type as never)) {
    return 'That file type is not allowed. Use PDF, Word, Excel, CSV, PNG, or JPEG.';
  }
  return null;
}

const UNCATEGORIZED = '__uncategorized__';

function CategorySelect({
  categories,
  value,
  onChange,
  id,
}: {
  categories: SocietyDocumentCategory[];
  value: string;
  onChange: (value: string) => void;
  id: string;
}) {
  return (
    <select id={id} className={inputClass} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value={UNCATEGORIZED}>Uncategorized</option>
      {categories.map((c) => (
        <option key={c.id} value={c.id}>
          {c.label}
        </option>
      ))}
    </select>
  );
}

function VisibilitySelect({
  value,
  onChange,
  id,
}: {
  value: number;
  onChange: (value: number) => void;
  id: string;
}) {
  return (
    <select
      id={id}
      className={inputClass}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    >
      {VISIBILITY_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function UploadModal({
  categories,
  isOpen,
  onClose,
}: {
  categories: SocietyDocumentCategory[];
  isOpen: boolean;
  onClose: () => void;
}) {
  const uploadMutation = useUploadSocietyDocument();
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState(UNCATEGORIZED);
  const [visibility, setVisibility] = useState(DEFAULT_VISIBILITY);
  const [description, setDescription] = useState('');
  const [fileError, setFileError] = useState<string | null>(null);

  const reset = () => {
    setTitle('');
    setCategoryId(UNCATEGORIZED);
    setVisibility(DEFAULT_VISIBILITY);
    setDescription('');
    setFileError(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleClose = () => {
    reset();
    uploadMutation.reset();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFileError(null);
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setFileError('Choose a file to upload.');
      return;
    }
    const err = preCheckFile(file);
    if (err) {
      setFileError(err);
      return;
    }
    uploadMutation.mutate(
      {
        file,
        title: title.trim(),
        categoryId: categoryId === UNCATEGORIZED ? null : categoryId,
        description: description.trim(),
        visibility,
      },
      { onSuccess: handleClose },
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Upload document" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="doc-file" className="block text-sm font-medium text-forest">
            File <span className="text-terracotta">*</span>
          </label>
          <input
            id="doc-file"
            ref={fileRef}
            type="file"
            className={inputClass}
            accept={ALLOWED_DOCUMENT_CONTENT_TYPES.join(',')}
            onChange={() => setFileError(null)}
          />
          <p className="text-xs text-forest/50">
            PDF, Word, Excel, CSV, PNG, or JPEG. Up to {formatBytes(MAX_DOCUMENT_UPLOAD_BYTES)}.
          </p>
          {fileError ? <p className="text-xs text-terracotta">{fileError}</p> : null}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="doc-title" className="block text-sm font-medium text-forest">
            Title <span className="text-terracotta">*</span>
          </label>
          <input
            id="doc-title"
            type="text"
            required
            className={inputClass}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="doc-category" className="block text-sm font-medium text-forest">
              Category
            </label>
            <CategorySelect
              id="doc-category"
              categories={categories}
              value={categoryId}
              onChange={setCategoryId}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="doc-visibility" className="block text-sm font-medium text-forest">
              Visibility
            </label>
            <VisibilitySelect id="doc-visibility" value={visibility} onChange={setVisibility} />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="doc-description" className="block text-sm font-medium text-forest">
            Description
          </label>
          <textarea
            id="doc-description"
            rows={3}
            className={inputClass}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {uploadMutation.isError ? (
          <p className="rounded bg-terracotta/10 px-3 py-2 text-sm text-terracotta">
            {apiErrorMessage(uploadMutation.error, 'Upload failed. Please try again.')}
          </p>
        ) : null}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={uploadMutation.isPending}>
            {uploadMutation.isPending ? 'Uploading…' : 'Upload'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function EditModal({
  categories,
  document,
  onClose,
}: {
  categories: SocietyDocumentCategory[];
  document: SocietyDocumentResponse;
  onClose: () => void;
}) {
  const updateMutation = useUpdateSocietyDocument();
  const replaceMutation = useReplaceSocietyDocumentFile();
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(document.title);
  const [categoryId, setCategoryId] = useState(document.category_id ?? UNCATEGORIZED);
  const [visibility, setVisibility] = useState(document.visibility);
  const [description, setDescription] = useState(document.description ?? '');
  const [fileError, setFileError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFileError(null);
    const file = fileRef.current?.files?.[0];
    if (file) {
      const err = preCheckFile(file);
      if (err) {
        setFileError(err);
        return;
      }
    }
    try {
      await updateMutation.mutateAsync({
        id: document.id,
        body: {
          title: title.trim(),
          category_id: categoryId === UNCATEGORIZED ? null : categoryId,
          description: description.trim(),
          visibility,
        },
      });
      if (file) {
        await replaceMutation.mutateAsync({ id: document.id, file });
      }
      onClose();
    } catch {
      // Error surfaced below via mutation state.
    }
  };

  const isPending = updateMutation.isPending || replaceMutation.isPending;
  const error = updateMutation.error ?? replaceMutation.error;

  return (
    <Modal isOpen onClose={onClose} title="Edit document" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="edit-title" className="block text-sm font-medium text-forest">
            Title <span className="text-terracotta">*</span>
          </label>
          <input
            id="edit-title"
            type="text"
            required
            className={inputClass}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="edit-category" className="block text-sm font-medium text-forest">
              Category
            </label>
            <CategorySelect
              id="edit-category"
              categories={categories}
              value={categoryId}
              onChange={setCategoryId}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="edit-visibility" className="block text-sm font-medium text-forest">
              Visibility
            </label>
            <VisibilitySelect id="edit-visibility" value={visibility} onChange={setVisibility} />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="edit-description" className="block text-sm font-medium text-forest">
            Description
          </label>
          <textarea
            id="edit-description"
            rows={3}
            className={inputClass}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="edit-file" className="block text-sm font-medium text-forest">
            Replace file (optional)
          </label>
          <input
            id="edit-file"
            ref={fileRef}
            type="file"
            className={inputClass}
            accept={ALLOWED_DOCUMENT_CONTENT_TYPES.join(',')}
            onChange={() => setFileError(null)}
          />
          <p className="text-xs text-forest/50">
            Leave empty to keep the current file ({document.display_name}).
          </p>
          {fileError ? <p className="text-xs text-terracotta">{fileError}</p> : null}
        </div>

        {error ? (
          <p className="rounded bg-terracotta/10 px-3 py-2 text-sm text-terracotta">
            {apiErrorMessage(error, 'Save failed. Please try again.')}
          </p>
        ) : null}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function DeleteConfirmModal({
  document,
  onClose,
}: {
  document: SocietyDocumentResponse;
  onClose: () => void;
}) {
  const deleteMutation = useDeleteSocietyDocument();
  return (
    <Modal isOpen onClose={onClose} title="Delete document" size="md">
      <div className="space-y-4">
        <p className="text-sm text-forest/80">
          Delete <span className="font-medium text-forest">{document.title}</span>? It will be removed
          from the list. This can be restored by an administrator if needed.
        </p>
        {deleteMutation.isError ? (
          <p className="rounded bg-terracotta/10 px-3 py-2 text-sm text-terracotta">
            {apiErrorMessage(deleteMutation.error, 'Delete failed. Please try again.')}
          </p>
        ) : null}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={deleteMutation.isPending}
            onClick={() => deleteMutation.mutate(document.id, { onSuccess: onClose })}
          >
            {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/** Create or rename a category, surfacing the duplicate-label 409 inline. */
function CategoryFormModal({
  mode,
  category,
  onClose,
}: {
  mode: 'create' | 'rename';
  category?: SocietyDocumentCategory;
  onClose: () => void;
}) {
  const createMutation = useCreateSocietyDocumentCategory();
  const updateMutation = useUpdateSocietyDocumentCategory();
  const [label, setLabel] = useState(category?.label ?? '');
  const [isVisible, setIsVisible] = useState(category?.is_visible ?? false);

  const mutation = mode === 'create' ? createMutation : updateMutation;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = label.trim();
    if (!trimmed) return;
    if (mode === 'create') {
      createMutation.mutate(
        { label: trimmed, is_visible: isVisible },
        { onSuccess: onClose },
      );
    } else if (category) {
      updateMutation.mutate(
        { id: category.id, body: { label: trimmed } },
        { onSuccess: onClose },
      );
    }
  };

  return (
    <Modal isOpen onClose={onClose} title={mode === 'create' ? 'New category' : 'Rename category'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="cat-label" className="block text-sm font-medium text-forest">
            Label <span className="text-terracotta">*</span>
          </label>
          <input
            id="cat-label"
            type="text"
            required
            className={inputClass}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Minutes"
          />
        </div>

        {mode === 'create' ? (
          <label className="flex items-center gap-2 text-sm text-forest/80">
            <input
              type="checkbox"
              checked={isVisible}
              onChange={(e) => setIsVisible(e.target.checked)}
            />
            Visible to members (show on member-facing pages)
          </label>
        ) : null}

        {mutation.isError ? (
          <p className="rounded bg-terracotta/10 px-3 py-2 text-sm text-terracotta">
            {apiErrorMessage(mutation.error, 'Could not save the category. Please try again.')}
          </p>
        ) : null}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving…' : mode === 'create' ? 'Create' : 'Save'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function DeleteCategoryModal({
  category,
  documentCount,
  onClose,
}: {
  category: SocietyDocumentCategory;
  documentCount: number;
  onClose: () => void;
}) {
  const deleteMutation = useDeleteSocietyDocumentCategory();
  return (
    <Modal isOpen onClose={onClose} title="Delete category" size="md">
      <div className="space-y-4">
        <p className="text-sm text-forest/80">
          Delete the category <span className="font-medium text-forest">{category.label}</span>?
          {documentCount > 0
            ? ` Its ${documentCount} document${documentCount === 1 ? '' : 's'} will move to Uncategorized.`
            : ' It has no documents.'}
        </p>
        {deleteMutation.isError ? (
          <p className="rounded bg-terracotta/10 px-3 py-2 text-sm text-terracotta">
            {apiErrorMessage(deleteMutation.error, 'Delete failed. Please try again.')}
          </p>
        ) : null}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={deleteMutation.isPending}
            onClick={() => deleteMutation.mutate(category.id, { onSuccess: onClose })}
          >
            {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function DocumentRows({
  documents,
  onDownload,
  onEdit,
  onDelete,
}: {
  documents: SocietyDocumentResponse[];
  onDownload: (id: string) => void;
  onEdit: (doc: SocietyDocumentResponse) => void;
  onDelete: (doc: SocietyDocumentResponse) => void;
}) {
  return (
    <table className="w-full text-left text-sm">
      <thead className="border-b border-sage/30 bg-sage-light/40 text-xs uppercase tracking-wide text-forest/60">
        <tr>
          <th className="px-4 py-3 font-medium">Title</th>
          <th className="px-4 py-3 font-medium">Type</th>
          <th className="px-4 py-3 font-medium">Size</th>
          <th className="px-4 py-3 font-medium">Visibility</th>
          <th className="px-4 py-3 font-medium">Source</th>
          <th className="px-4 py-3 font-medium">Added</th>
          <th className="px-4 py-3 text-right font-medium">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-sage/20">
        {documents.map((doc) => (
          <tr key={doc.id} className="hover:bg-sage-light/20">
            <td className="px-4 py-3">
              <div className="font-medium text-forest">{doc.title}</div>
              <div className="text-xs text-forest/50">{doc.display_name}</div>
            </td>
            <td className="px-4 py-3 text-forest/80">{typeLabel(doc.content_type)}</td>
            <td className="px-4 py-3 text-forest/80">{formatBytes(doc.size_bytes)}</td>
            <td className="px-4 py-3 text-forest/80">{visibilityLabel(doc.visibility)}</td>
            <td className="px-4 py-3">
              <Badge variant={doc.source === 'external' ? 'amber' : 'forest'} size="xs" shape="pill">
                {doc.source === 'external' ? 'Synced' : 'Manual'}
              </Badge>
            </td>
            <td className="px-4 py-3 text-forest/70">{formatDate(doc.created_at)}</td>
            <td className="px-4 py-3">
              <div className="flex items-center justify-end gap-1">
                <button
                  type="button"
                  title="Download"
                  aria-label={`Download ${doc.title}`}
                  className="rounded p-1.5 text-forest/70 hover:bg-forest/10 hover:text-forest"
                  onClick={() => onDownload(doc.id)}
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  title="Edit"
                  aria-label={`Edit ${doc.title}`}
                  className="rounded p-1.5 text-forest/70 hover:bg-forest/10 hover:text-forest"
                  onClick={() => onEdit(doc)}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  title="Delete"
                  aria-label={`Delete ${doc.title}`}
                  className="rounded p-1.5 text-terracotta/80 hover:bg-terracotta/10 hover:text-terracotta"
                  onClick={() => onDelete(doc)}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function AdminDocumentsPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const { data: currentUser, isLoading: isUserLoading } = useCurrentUser();
  const isSuperadmin = currentUser?.is_superadmin ?? false;
  const canManage = canAccessManagement(currentUser?.membership?.role, isSuperadmin);

  const { data: docData, isLoading: isListLoading } = useSocietyDocumentsQuery(canManage);
  const { data: catData, isLoading: isCatLoading } = useSocietyDocumentCategoriesQuery(canManage);
  const download = useDownloadSocietyDocument();
  const toggleVisibility = useUpdateSocietyDocumentCategory();

  const [showUpload, setShowUpload] = useState(false);
  const [editing, setEditing] = useState<SocietyDocumentResponse | null>(null);
  const [deleting, setDeleting] = useState<SocietyDocumentResponse | null>(null);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [renamingCategory, setRenamingCategory] = useState<SocietyDocumentCategory | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<SocietyDocumentCategory | null>(null);

  const documents = useMemo(() => docData?.items ?? [], [docData]);
  const categories = useMemo(() => catData?.items ?? [], [catData]);

  const { grouped, uncategorized } = useMemo(() => {
    const byCategory = new Map<string, SocietyDocumentResponse[]>();
    const uncat: SocietyDocumentResponse[] = [];
    for (const doc of documents) {
      if (doc.category_id) {
        const list = byCategory.get(doc.category_id) ?? [];
        list.push(doc);
        byCategory.set(doc.category_id, list);
      } else {
        uncat.push(doc);
      }
    }
    return {
      grouped: categories.map((c) => ({ category: c, documents: byCategory.get(c.id) ?? [] })),
      uncategorized: uncat,
    };
  }, [documents, categories]);

  const handleToggleVisibility = (category: SocietyDocumentCategory) => {
    toggleVisibility.mutate({ id: category.id, body: { is_visible: !category.is_visible } });
  };

  const renderBody = () => {
    if (!isLoaded || isUserLoading) {
      return (
        <Card className="p-6">
          <div className="h-64 animate-pulse rounded bg-sage/10" />
        </Card>
      );
    }
    if (!isSignedIn || !canManage) {
      return (
        <Card className="p-8 text-center">
          <p className="text-forest/70">
            You don&apos;t have permission to manage society documents. This is available to committee
            members, the chairperson, and the society manager.
          </p>
        </Card>
      );
    }
    if (isListLoading || isCatLoading) {
      return (
        <Card className="p-6">
          <div className="h-64 animate-pulse rounded bg-sage/10" />
        </Card>
      );
    }
    if (documents.length === 0 && categories.length === 0) {
      return (
        <Card className="p-6">
          <EmptyState
            icon={<FileText className="h-7 w-7 text-forest" aria-hidden="true" />}
            title="No documents yet"
            description="Create a category, then upload the society's minutes, agendas, and financial records to keep them in one place."
            action={
              <div className="flex justify-center gap-2">
                <Button variant="outline" onClick={() => setCreatingCategory(true)}>
                  <FolderPlus className="mr-1.5 h-4 w-4" /> New category
                </Button>
                <Button onClick={() => setShowUpload(true)}>
                  <Upload className="mr-1.5 h-4 w-4" /> Upload document
                </Button>
              </div>
            }
          />
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        {grouped.map(({ category, documents: docs }) => (
          <Card key={category.id} className="overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-sage/30 bg-sage-light/30 px-4 py-3">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-base text-forest">{category.label}</h2>
                <span className="text-xs text-forest/50">
                  {docs.length} {docs.length === 1 ? 'file' : 'files'}
                </span>
                <Badge variant={category.is_visible ? 'forest' : 'outline'} size="xs" shape="pill">
                  {category.is_visible ? 'Visible' : 'Hidden'}
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  title={category.is_visible ? 'Hide from members' : 'Show to members'}
                  aria-label={`Toggle visibility of ${category.label}`}
                  className="rounded p-1.5 text-forest/70 hover:bg-forest/10 hover:text-forest"
                  onClick={() => handleToggleVisibility(category)}
                >
                  {category.is_visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  title="Rename category"
                  aria-label={`Rename ${category.label}`}
                  className="rounded p-1.5 text-forest/70 hover:bg-forest/10 hover:text-forest"
                  onClick={() => setRenamingCategory(category)}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  title="Delete category"
                  aria-label={`Delete ${category.label}`}
                  className="rounded p-1.5 text-terracotta/80 hover:bg-terracotta/10 hover:text-terracotta"
                  onClick={() => setDeletingCategory(category)}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            {docs.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-forest/50">
                No documents in this category yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <DocumentRows
                  documents={docs}
                  onDownload={(id) => download.mutate(id)}
                  onEdit={setEditing}
                  onDelete={setDeleting}
                />
              </div>
            )}
          </Card>
        ))}

        {uncategorized.length > 0 ? (
          <Card className="overflow-hidden">
            <div className="border-b border-sage/30 bg-sage-light/30 px-4 py-3">
              <h2 className="font-display text-base text-forest">Uncategorized</h2>
            </div>
            <div className="overflow-x-auto">
              <DocumentRows
                documents={uncategorized}
                onDownload={(id) => download.mutate(id)}
                onEdit={setEditing}
                onDelete={setDeleting}
              />
            </div>
          </Card>
        ) : null}
      </div>
    );
  };

  const hasContent = documents.length > 0 || categories.length > 0;

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-bone">
      <WorkManagementNavBar
        title="Society Documents"
        showBackButton
        backHref="/admin"
        backLabel="Administration"
        actions={
          canManage && hasContent
            ? [
                { label: 'New category', onClick: () => setCreatingCategory(true) },
                { label: 'Upload', onClick: () => setShowUpload(true) },
              ]
            : []
        }
      />
      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl p-6 md:p-8 lg:p-12">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest/10">
              <FileText className="h-5 w-5 text-forest" aria-hidden="true" />
            </div>
            <div>
              <h1 className="font-display text-2xl text-forest">Society documents</h1>
              <p className="text-sm text-forest/60">
                Minutes, agendas, and financial records — organised by category and managed here.
              </p>
            </div>
          </div>
          {renderBody()}
        </div>
      </main>

      {showUpload ? (
        <UploadModal
          categories={categories}
          isOpen={showUpload}
          onClose={() => setShowUpload(false)}
        />
      ) : null}
      {editing ? (
        <EditModal categories={categories} document={editing} onClose={() => setEditing(null)} />
      ) : null}
      {deleting ? (
        <DeleteConfirmModal document={deleting} onClose={() => setDeleting(null)} />
      ) : null}
      {creatingCategory ? (
        <CategoryFormModal mode="create" onClose={() => setCreatingCategory(false)} />
      ) : null}
      {renamingCategory ? (
        <CategoryFormModal
          mode="rename"
          category={renamingCategory}
          onClose={() => setRenamingCategory(null)}
        />
      ) : null}
      {deletingCategory ? (
        <DeleteCategoryModal
          category={deletingCategory}
          documentCount={
            grouped.find((g) => g.category.id === deletingCategory.id)?.documents.length ?? 0
          }
          onClose={() => setDeletingCategory(null)}
        />
      ) : null}
    </div>
  );
}
