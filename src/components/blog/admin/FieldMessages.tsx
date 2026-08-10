import { AlertCircle, Info } from 'lucide-react';
import type { BlogDiagnostics } from '@/types/blog-admin';

/**
 * Server-side messages, placed against the field that produced them.
 *
 * Errors and warnings are drawn differently and say so in words, not only in
 * colour: a warning that looks like an error makes an author fix something that
 * was never broken, and one that looks like nothing gets ignored.
 *
 * Validation is the server's, always. The form does not second-guess it — the
 * same rules run on save, on preview, and on publish, so what the author is
 * shown here is exactly what publishing will apply.
 */

export function fieldErrors(diagnostics: BlogDiagnostics | null, field: string): string[] {
  return (diagnostics?.errors ?? []).filter((issue) => issue.field === field).map((i) => i.message);
}

export function fieldWarnings(diagnostics: BlogDiagnostics | null, field: string): string[] {
  return (diagnostics?.warnings ?? [])
    .filter((issue) => issue.field === field)
    .map((issue) => issue.message);
}

export default function FieldMessages({
  diagnostics,
  field,
}: {
  diagnostics: BlogDiagnostics | null;
  field: string;
}) {
  const errors = fieldErrors(diagnostics, field);
  const warnings = fieldWarnings(diagnostics, field);

  if (errors.length === 0 && warnings.length === 0) return null;

  return (
    <div className="space-y-1 pt-1">
      {errors.map((message) => (
        <p
          key={message}
          className="flex items-start gap-1.5 text-xs text-terracotta-dark"
          role="alert"
        >
          <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{message}</span>
        </p>
      ))}
      {warnings.map((message) => (
        <p key={message} className="flex items-start gap-1.5 text-xs text-forest/55">
          <Info className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{message}</span>
        </p>
      ))}
    </div>
  );
}
