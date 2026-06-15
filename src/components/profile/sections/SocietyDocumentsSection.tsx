'use client';

/**
 * Society Documents: a read-only sibling to the Incorporated Society fold.
 *
 * Stacked beneath SocietySection on the /account/society tab, this section
 * lists the documents the committee has published, grouped under their
 * categories. It shows only documents that sit under a visible category; the
 * server scopes document-level visibility to the viewer, and this filter keeps
 * hidden-category (and uncategorised) records out as a defensive measure.
 *
 * Reads come from useSocietyDocumentsQuery; downloads open a presigned R2 URL
 * in a new tab. There are no upload, edit, or delete controls; management of
 * documents lives in /admin/documents.
 */

import { useMemo, useState } from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import {
  Download,
  Eye,
  File as FileIcon,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { DocumentViewerModal } from '@/components/ui/DocumentViewerModal';
import {
  useDownloadSocietyDocument,
  useSocietyDocumentsQuery,
  useSocietyDocumentViewUrl,
} from '@/hooks/useSocietyDocuments';
import type { SocietyDocumentResponse } from '@/types/admin';
import { cn } from '@/lib/utils';

const EASE_OUT: [number, number, number, number] = [0.215, 0.61, 0.355, 1];

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

function typeLabel(contentType: string): string {
  return CONTENT_TYPE_LABELS[contentType] ?? contentType;
}

function isPdf(contentType: string): boolean {
  return contentType === 'application/pdf';
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

function iconForType(contentType: string) {
  if (contentType.startsWith('image/')) return ImageIcon;
  if (
    contentType.includes('spreadsheet') ||
    contentType.includes('excel') ||
    contentType === 'text/csv'
  ) {
    return FileSpreadsheet;
  }
  if (contentType === 'application/pdf' || contentType.includes('word') || contentType.startsWith('text/')) {
    return FileText;
  }
  return FileIcon;
}

interface DocumentGroup {
  id: string;
  label: string;
  documents: SocietyDocumentResponse[];
}

/** Keep documents under a visible category; group, then order. */
function groupVisibleDocuments(items: SocietyDocumentResponse[]): DocumentGroup[] {
  const groups = new Map<string, DocumentGroup>();

  for (const doc of items) {
    if (!doc.category || !doc.category.is_visible) continue;
    const existing = groups.get(doc.category.id);
    if (existing) {
      existing.documents.push(doc);
    } else {
      groups.set(doc.category.id, { id: doc.category.id, label: doc.category.label, documents: [doc] });
    }
  }

  const ordered = Array.from(groups.values());
  ordered.sort((a, b) => a.label.localeCompare(b.label));
  for (const group of ordered) {
    group.documents.sort((a, b) => b.created_at.localeCompare(a.created_at));
  }
  return ordered;
}

export default function SocietyDocumentsSection() {
  const { data, isLoading, error } = useSocietyDocumentsQuery();

  const groups = useMemo(() => groupVisibleDocuments(data?.items ?? []), [data]);

  return (
    <section
      aria-labelledby="society-documents-heading"
      className="rounded-card border border-sage/20 bg-white p-6 sm:p-8"
    >
      <SectionHeader />

      {isLoading ? (
        <LoadingRows />
      ) : error ? (
        <LoadError />
      ) : groups.length === 0 ? (
        <EmptyState />
      ) : (
        <DocumentGroups groups={groups} />
      )}
    </section>
  );
}

function SectionHeader() {
  return (
    <div>
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-terracotta">Records</p>
      <h2
        id="society-documents-heading"
        className="mt-1 font-display text-xl leading-snug text-forest sm:text-2xl"
      >
        Society documents
      </h2>
      <p className="mt-1.5 text-sm text-forest/55">
        Records the committee has published for members.
      </p>
    </div>
  );
}

function DocumentGroups({ groups }: { groups: DocumentGroup[] }) {
  const download = useDownloadSocietyDocument();
  const view = useSocietyDocumentViewUrl();
  const prefersReducedMotion = useReducedMotion();

  // The PDF currently open in the viewer modal, with its resolved presigned URL.
  const [viewer, setViewer] = useState<{ doc: SocietyDocumentResponse; url: string } | null>(null);

  // Pending/error are tracked per action so Download and View feedback stay independent.
  const downloadingId = download.isPending ? download.variables : null;
  const downloadErrorId = download.isError ? download.variables : null;
  const viewingId = view.isPending ? view.variables : null;
  const viewErrorId = view.isError ? view.variables : null;

  function handleView(doc: SocietyDocumentResponse) {
    view.mutate(doc.id, {
      onSuccess: (url) => setViewer({ doc, url }),
    });
  }

  const listVariants: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.04 } },
  };
  const rowVariants: Variants = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT } },
  };

  return (
    <div className="mt-7 space-y-8">
      {groups.map((group) => (
        <div key={group.id}>
          <h3 className="mb-2 text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-forest/45">
            {group.label}
          </h3>
          <motion.ul
            initial={prefersReducedMotion ? false : 'hidden'}
            animate={prefersReducedMotion ? false : 'show'}
            variants={prefersReducedMotion ? undefined : listVariants}
            className="divide-y divide-sage/15 border-t border-sage/15"
          >
            {group.documents.map((doc) => {
              const pdf = isPdf(doc.content_type);
              const isPending = pdf ? viewingId === doc.id : downloadingId === doc.id;
              const hasError = pdf ? viewErrorId === doc.id : downloadErrorId === doc.id;
              return (
                <motion.li key={doc.id} variants={prefersReducedMotion ? undefined : rowVariants}>
                  <DocumentRow
                    doc={doc}
                    isPdf={pdf}
                    isPending={isPending}
                    hasError={hasError}
                    onActivate={() => (pdf ? handleView(doc) : download.mutate(doc.id))}
                  />
                </motion.li>
              );
            })}
          </motion.ul>
        </div>
      ))}

      <DocumentViewerModal
        isOpen={!!viewer}
        onClose={() => setViewer(null)}
        fileUrl={viewer?.url ?? ''}
        fileName={viewer?.doc.display_name}
        fileType="pdf"
      />
    </div>
  );
}

function DocumentRow({
  doc,
  isPdf: pdf,
  isPending,
  hasError,
  onActivate,
}: {
  doc: SocietyDocumentResponse;
  isPdf: boolean;
  isPending: boolean;
  hasError: boolean;
  onActivate: () => void;
}) {
  const Icon = iconForType(doc.content_type);

  const fileIcon = (
    <span
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-forest/[0.07] text-forest transition-colors duration-300 group-hover:bg-forest/10"
      aria-hidden="true"
    >
      <Icon className="h-5 w-5" />
    </span>
  );

  const metadata = (
    <div className="min-w-0 flex-1">
      <p className="truncate font-semibold text-forest">{doc.title}</p>
      {doc.description ? (
        <p className="mt-0.5 truncate text-sm text-forest/55">{doc.description}</p>
      ) : null}
      <p className="mt-1 font-mono text-xs text-forest/45">
        {typeLabel(doc.content_type)} · {formatBytes(doc.size_bytes)} · {formatDate(doc.created_at)}
      </p>
      {hasError ? (
        <p role="alert" className="mt-1 text-xs text-terracotta">
          We couldn&apos;t open that file. Try again.
        </p>
      ) : null}
    </div>
  );

  // PDFs: the whole row is a single button that opens the inline viewer. A non-interactive
  // "View" affordance sits where the Download control would be, avoiding nested interactives.
  if (pdf) {
    return (
      <button
        type="button"
        onClick={onActivate}
        disabled={isPending}
        aria-label={hasError ? `Retry opening ${doc.title}` : `View ${doc.title}`}
        className={cn(
          'group flex w-full items-center gap-4 px-2 py-3 text-left transition-colors duration-200 hover:bg-sage-light/40 sm:px-3',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 focus-visible:ring-inset',
          'disabled:cursor-not-allowed',
        )}
      >
        {fileIcon}
        {metadata}
        <span
          className={cn(
            'inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded px-3 py-2 text-sm font-medium text-forest',
            'transition-colors group-hover:bg-forest group-hover:text-bone',
            'group-disabled:opacity-60 group-disabled:group-hover:bg-transparent group-disabled:group-hover:text-forest',
          )}
          aria-hidden="true"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">
            {isPending ? 'Opening' : hasError ? 'Retry' : 'View'}
          </span>
        </span>
      </button>
    );
  }

  return (
    <div className="group flex items-center gap-4 px-2 py-3 transition-colors duration-200 hover:bg-sage-light/40 sm:px-3">
      {fileIcon}
      {metadata}

      <button
        type="button"
        onClick={onActivate}
        disabled={isPending}
        aria-label={hasError ? `Retry download of ${doc.title}` : `Download ${doc.title}`}
        className={cn(
          'inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded px-3 py-2 text-sm font-medium text-forest',
          'transition-colors hover:bg-forest hover:text-bone',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
          'disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-forest',
        )}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Download className="h-4 w-4" aria-hidden="true" />
        )}
        <span className="hidden sm:inline">
          {isPending ? 'Opening' : hasError ? 'Retry' : 'Download'}
        </span>
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-7 flex flex-col items-center border-t border-sage/15 px-4 pb-4 pt-10 text-center">
      <span
        className="flex h-12 w-12 items-center justify-center rounded-xl bg-forest/[0.06] text-forest/50"
        aria-hidden="true"
      >
        <FolderOpen className="h-6 w-6" />
      </span>
      <p className="mt-4 font-display text-lg text-forest">No documents yet</p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-forest/55">
        When the committee publishes society records, they&apos;ll appear here for members to read.
      </p>
    </div>
  );
}

function LoadError() {
  return (
    <div className="mt-7 rounded-card border border-terracotta/20 bg-terracotta/10 p-6 text-center">
      <p className="text-sm text-terracotta">
        We couldn&apos;t load the society documents. Please try again.
      </p>
    </div>
  );
}

function LoadingRows() {
  return (
    <div className="mt-7" aria-hidden="true">
      <Skeleton className="mb-3 h-3 w-28" />
      <div className="divide-y divide-sage/15 border-t border-sage/15">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-4 px-2 py-3 sm:px-3">
            <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-9 w-24 shrink-0 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
