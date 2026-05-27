'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Download, Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/api/client';
import { cn } from '@/lib/utils';

export interface EmailAttachment {
  id: string;
  filename: string;
  content_type: string;
  byte_size: number;
  inline?: boolean;
  content_id?: string | null;
}

interface EmailAttachmentListProps {
  attachments: EmailAttachment[];
  messageId: string;
  className?: string;
}

interface DownloadUrlResponse {
  download_url: string;
  expires_in_seconds: number;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export default function EmailAttachmentList({
  attachments,
  messageId,
  className,
}: EmailAttachmentListProps) {
  const { getToken } = useAuth();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);

  if (!attachments.length) return null;

  const handleDownload = async (attachmentId: string) => {
    setDownloadingId(attachmentId);
    setErrorId(null);
    try {
      const res = await apiRequest<DownloadUrlResponse>(
        `/api/v1/emails/messages/${messageId}/attachments/${attachmentId}/download-url`,
        getToken,
      );
      window.location.assign(res.download_url);
    } catch {
      setErrorId(attachmentId);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <ul className={cn('space-y-1.5', className)}>
      {attachments.map((att) => {
        const isDownloading = downloadingId === att.id;
        const hasError = errorId === att.id;
        return (
          <li
            key={att.id}
            className="flex items-center gap-3 rounded-none border border-sage/15 bg-bone/50 px-3 py-2"
          >
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-forest truncate">{att.filename}</div>
              <div className="text-[10px] uppercase tracking-widest text-forest/40 font-bold">
                {formatBytes(att.byte_size)}
              </div>
              {hasError ? (
                <div className="text-[11px] text-red-700 mt-0.5" role="alert">
                  Download failed. Try again.
                </div>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => handleDownload(att.id)}
              disabled={isDownloading}
              aria-label={`Download ${att.filename}`}
              className="inline-flex items-center gap-1.5 rounded-none border border-sage/30 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-forest hover:bg-sage-light/40 disabled:opacity-50"
            >
              {isDownloading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              ) : (
                <Download className="h-3.5 w-3.5" aria-hidden />
              )}
              Download
            </button>
          </li>
        );
      })}
    </ul>
  );
}
