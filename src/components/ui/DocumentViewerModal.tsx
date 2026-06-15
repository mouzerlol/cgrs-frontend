'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { Download, ExternalLink, FileText, FileWarning, Image as ImageIcon, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Document kinds the viewer knows how to present. `pdf` and `image` render inline; everything else falls back. */
export type DocumentFileType = 'pdf' | 'image' | 'doc' | 'docx' | string;

interface DocumentViewerModalProps {
  /** Whether the modal is open. */
  isOpen: boolean;
  /** Called when the dialog should close (backdrop click, Escape, close control). */
  onClose: () => void;
  /** URL of the document to display (used as the iframe/image source and the download target). */
  fileUrl: string;
  /** File name shown in the header and used for the download. Falls back to the URL's last segment. */
  fileName?: string;
  /** Explicit file type. When omitted, it is inferred from the `fileUrl` extension. */
  fileType?: DocumentFileType;
}

/** Which renderer handles a given file type. */
type Renderer = 'pdf' | 'image' | 'unsupported';

function extensionOf(url: string): string {
  const clean = url.split(/[?#]/)[0];
  const last = clean.split('/').pop() ?? '';
  const dot = last.lastIndexOf('.');
  return dot >= 0 ? last.slice(dot + 1).toLowerCase() : '';
}

function fileNameFromUrl(url: string): string {
  const clean = url.split(/[?#]/)[0];
  return decodeURIComponent(clean.split('/').pop() || 'document');
}

const IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'avif']);

/** Map a file type (explicit or inferred) to the renderer responsible for it. */
function resolveRenderer(fileType: DocumentFileType | undefined, fileUrl: string): Renderer {
  const type = (fileType ?? extensionOf(fileUrl)).toLowerCase();
  if (type === 'pdf') return 'pdf';
  if (type === 'image' || IMAGE_EXTENSIONS.has(type)) return 'image';
  return 'unsupported';
}

export function DocumentViewerModal({
  isOpen,
  onClose,
  fileUrl,
  fileName,
  fileType,
}: DocumentViewerModalProps) {
  const renderer = useMemo(() => resolveRenderer(fileType, fileUrl), [fileType, fileUrl]);
  const displayName = fileName ?? fileNameFromUrl(fileUrl);

  // 'loading' until the document reports ready; 'error' if it fails to load.
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  // Object URL for the framed PDF. We fetch the document and frame a blob: URL instead of the
  // raw URL, because document responses carry X-Frame-Options/frame-ancestors that forbid framing.
  // A client-side blob has no such headers, and this same path generalises to cross-origin
  // signed URLs (with CORS) at rollout.
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);

  // Reset load status whenever the source or open state changes so a re-open starts clean.
  useEffect(() => {
    if (isOpen) setStatus(renderer === 'unsupported' ? 'ready' : 'loading');
  }, [isOpen, fileUrl, renderer]);

  // Fetch the PDF and expose it as a blob: URL for framing. Images and unsupported types skip this.
  useEffect(() => {
    if (!isOpen || renderer !== 'pdf') {
      setPdfBlobUrl(null);
      return;
    }
    let cancelled = false;
    let createdUrl: string | null = null;
    setStatus('loading');
    setPdfBlobUrl(null);
    fetch(fileUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed with ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        createdUrl = URL.createObjectURL(blob);
        setPdfBlobUrl(createdUrl);
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [isOpen, renderer, fileUrl]);

  const TypeIcon = renderer === 'image' ? ImageIcon : renderer === 'unsupported' ? FileWarning : FileText;

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[1100]" onClose={onClose}>
        {/* Backdrop: dimmed forest scrim with the site's paper grain. */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200 motion-reduce:duration-0"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150 motion-reduce:duration-0"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-forest/80 backdrop-blur-sm texture-grain" aria-hidden="true" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-hidden">
          <div className="flex min-h-full items-center justify-center sm:p-4">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-200 motion-reduce:duration-0"
              enterFrom="opacity-0 scale-[0.98]"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150 motion-reduce:duration-0"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-[0.98]"
            >
              <DialogPanel
                className={cn(
                  'flex flex-col overflow-hidden bg-bone text-forest shadow-2xl',
                  // Mobile: full screen. Desktop: most of the viewport, capped for ultrawide.
                  'h-[100dvh] w-screen rounded-none',
                  'sm:h-[90vh] sm:w-[90vw] sm:max-w-[1400px] sm:rounded-card',
                )}
              >
                {/* Header chrome: forest bar that frames the document and stays out of the way. */}
                <header className="flex items-center justify-between gap-3 bg-forest px-4 py-3 text-bone sm:px-5">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <TypeIcon className="h-5 w-5 shrink-0 text-sage" aria-hidden="true" />
                    <DialogTitle as="h2" className="truncate font-display text-base font-medium leading-tight">
                      {displayName}
                    </DialogTitle>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <a
                      href={fileUrl}
                      download={displayName}
                      className="inline-flex h-10 items-center gap-1.5 rounded px-2.5 text-sm text-bone/90 transition-colors hover:bg-forest-light hover:text-bone focus:outline-none focus-visible:ring-2 focus-visible:ring-bone/70"
                    >
                      <Download className="h-4 w-4" aria-hidden="true" />
                      <span className="hidden sm:inline">Download</span>
                    </a>
                    <button
                      type="button"
                      onClick={onClose}
                      autoFocus
                      aria-label="Close document viewer"
                      className="inline-flex h-10 w-10 items-center justify-center rounded text-bone/90 transition-colors hover:bg-forest-light hover:text-bone focus:outline-none focus-visible:ring-2 focus-visible:ring-bone/70"
                    >
                      <X className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                </header>

                {/* Document stage. */}
                <div className="relative flex-1 overflow-hidden bg-sage-light">
                  {renderer === 'unsupported' ? (
                    <UnsupportedState fileUrl={fileUrl} fileName={displayName} />
                  ) : status === 'error' ? (
                    <ErrorState fileUrl={fileUrl} />
                  ) : (
                    <>
                      {status === 'loading' && <LoadingState />}
                      {renderer === 'pdf' ? (
                        pdfBlobUrl && (
                          <iframe
                            src={pdfBlobUrl}
                            title={displayName}
                            className="h-full w-full border-0 bg-white"
                            onLoad={() => setStatus('ready')}
                            onError={() => setStatus('error')}
                          />
                        )
                      ) : (
                        <div className="h-full w-full overflow-auto p-4">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={fileUrl}
                            alt={displayName}
                            className="mx-auto h-auto max-w-full"
                            onLoad={() => setStatus('ready')}
                            onError={() => setStatus('error')}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

function LoadingState() {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-sage-light" aria-live="polite">
      <span className="inline-flex items-center gap-2 text-sm text-forest/60">
        <Loader2 className="h-5 w-5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
        Loading document
      </span>
    </div>
  );
}

function ErrorState({ fileUrl }: { fileUrl: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
      <FileWarning className="h-10 w-10 text-terracotta" aria-hidden="true" />
      <div className="space-y-1">
        <p className="font-display text-lg text-forest">We couldn&apos;t load this document.</p>
        <p className="text-sm text-forest/60">You can download it or open it in a new tab instead.</p>
      </div>
      <FallbackActions fileUrl={fileUrl} />
    </div>
  );
}

function UnsupportedState({ fileUrl, fileName }: { fileUrl: string; fileName: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
      <FileText className="h-10 w-10 text-forest/40" aria-hidden="true" />
      <div className="space-y-1">
        <p className="font-display text-lg text-forest">This file type can&apos;t be previewed yet.</p>
        <p className="text-sm text-forest/60">Download {fileName} to view it on your device.</p>
      </div>
      <FallbackActions fileUrl={fileUrl} downloadOnly />
    </div>
  );
}

function FallbackActions({ fileUrl, downloadOnly = false }: { fileUrl: string; downloadOnly?: boolean }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <a
        href={fileUrl}
        download
        className="inline-flex items-center gap-1.5 rounded bg-terracotta px-4 py-2 text-sm font-medium text-bone transition-colors hover:bg-terracotta-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
      >
        <Download className="h-4 w-4" aria-hidden="true" />
        Download
      </a>
      {!downloadOnly && (
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded border border-forest px-4 py-2 text-sm font-medium text-forest transition-colors hover:bg-forest hover:text-bone focus:outline-none focus-visible:ring-2 focus-visible:ring-forest"
        >
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
          Open in new tab
        </a>
      )}
    </div>
  );
}

export default DocumentViewerModal;
