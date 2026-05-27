'use client';

import { useMemo, useState } from 'react';
import DOMPurify from 'dompurify';
import { cn, formatRelativeDate } from '@/lib/utils';
import SenderIdentity, { type CorrespondenceSender } from './SenderIdentity';
import EmailAttachmentList, { type EmailAttachment } from './EmailAttachmentList';

export interface CorrespondenceMessage {
  id: string;
  thread_id: string;
  direction: 'inbound' | 'outbound';
  subject?: string | null;
  body_text?: string | null;
  body_html?: string | null;
  received_at?: string | null;
  sent_at?: string | null;
  sender: CorrespondenceSender;
  attachments: EmailAttachment[];
}

interface EmailMessageItemProps {
  message: CorrespondenceMessage;
  /** True when this message's subject is identical to the previous message; suppresses subject rendering. */
  hideSubject?: boolean;
}

/** Rewrites <img src="cid:xxx"> to the inline-attachment redirect URL. */
function rewriteCidImages(html: string, messageId: string, attachments: EmailAttachment[]): string {
  const byContentId = new Map<string, EmailAttachment>();
  for (const att of attachments) {
    if (att.inline && att.content_id) {
      byContentId.set(att.content_id, att);
    }
  }
  if (byContentId.size === 0) return html;
  return html.replace(/src=(["'])cid:([^"']+)\1/gi, (match, quote, cid) => {
    const att = byContentId.get(cid);
    if (!att) return match;
    return `src=${quote}/api/v1/emails/messages/${messageId}/attachments/${att.id}/inline${quote}`;
  });
}

export default function EmailMessageItem({ message, hideSubject = false }: EmailMessageItemProps) {
  const [showHtml, setShowHtml] = useState(false);
  const hasText = Boolean(message.body_text && message.body_text.trim());
  const hasHtml = Boolean(message.body_html && message.body_html.trim());
  const timestamp = message.received_at ?? message.sent_at;

  const sanitizedHtml = useMemo(() => {
    if (!showHtml || !message.body_html) return '';
    const rewritten = rewriteCidImages(message.body_html, message.id, message.attachments);
    return DOMPurify.sanitize(rewritten, {
      USE_PROFILES: { html: true },
      FORBID_TAGS: ['script', 'style'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick'],
    });
  }, [showHtml, message.body_html, message.id, message.attachments]);

  return (
    <article
      className={cn(
        'rounded-none border border-sage/15 bg-white shadow-sm p-4',
        message.direction === 'outbound' && 'border-l-2 border-l-terracotta/40',
      )}
      data-message-id={message.id}
    >
      <header className="flex items-start justify-between gap-3 mb-3">
        <SenderIdentity sender={message.sender} className="flex-1 min-w-0" />
        {timestamp ? (
          <span className="text-[10px] font-medium uppercase tracking-wider text-forest/40 shrink-0">
            {formatRelativeDate(timestamp)}
          </span>
        ) : null}
      </header>

      {!hideSubject && message.subject ? (
        <h4 className="text-sm font-semibold text-forest mb-2 truncate">{message.subject}</h4>
      ) : null}

      <div className="space-y-2">
        {showHtml && hasHtml ? (
          <div
            data-testid="email-html-body"
            className="prose prose-sm max-w-none text-forest/85 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
          />
        ) : hasText ? (
          <div className="text-sm text-forest/85 leading-relaxed whitespace-pre-wrap">
            {message.body_text}
          </div>
        ) : hasHtml ? (
          <div className="text-xs text-forest/40 italic">
            Plain text body unavailable — toggle to HTML to view.
          </div>
        ) : (
          <div className="text-xs text-forest/40 italic">No body content.</div>
        )}

        {hasHtml ? (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowHtml((s) => !s)}
              className="text-[10px] font-bold uppercase tracking-widest text-forest/50 hover:text-forest underline-offset-2 hover:underline"
            >
              {showHtml ? 'Show text' : 'Show HTML'}
            </button>
          </div>
        ) : null}
      </div>

      {message.attachments.length > 0 ? (
        <footer className="mt-3 pt-3 border-t border-sage/10">
          <div className="text-[10px] uppercase tracking-widest text-forest/40 font-bold mb-1.5">
            Attachments
          </div>
          <EmailAttachmentList attachments={message.attachments} messageId={message.id} />
        </footer>
      ) : null}
    </article>
  );
}
