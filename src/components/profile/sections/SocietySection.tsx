'use client';

/**
 * Society tab on the account surface: a single folded record in the almanac.
 *
 * Collapsed by default, the card reads as a calm masthead row (icon, eyebrow,
 * title, a one-line legal-name teaser, and a quiet Registered tag) with a
 * rotating chevron as the expand affordance. Expanded, it unfolds into the full
 * incorporated registration record: grouped definition rows, fixed-width data in
 * mono, and the single terracotta accent on the Companies Office link.
 *
 * Built as one self-contained fold so future account sections can stack as
 * siblings. Shown only for owners-and-up (the tab is role-filtered upstream).
 */

import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Building2, ChevronDown, ExternalLink } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { useSocietyRecordQuery } from '@/hooks/useSociety';
import type { SocietyRecordResponse } from '@/lib/api/society';
import { cn } from '@/lib/utils';

const EASE_OUT: [number, number, number, number] = [0.215, 0.61, 0.355, 1];

function formatDate(value: string | null): string {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('en-NZ', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatStatus(value: string): string {
  if (!value) return '—';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function SocietySection() {
  const { data: record, isLoading, error } = useSocietyRecordQuery();

  if (isLoading) return <LoadingFold />;

  if (error || !record) {
    return (
      <div className="rounded-card border border-terracotta/20 bg-terracotta/10 p-6 text-center">
        <p className="text-sm text-terracotta">We couldn&apos;t load the society record. Please try again.</p>
      </div>
    );
  }

  return <SocietyFold record={record} />;
}

function SocietyFold({ record }: { record: SocietyRecordResponse }) {
  const prefersReducedMotion = useReducedMotion();
  const recorded = record.is_recorded;

  return (
    <Disclosure defaultOpen={false}>
      {({ open }) => (
        <div
          className={cn(
            'overflow-hidden rounded-card border bg-white transition-[border-color,box-shadow,transform] duration-[400ms] ease-out',
            open
              ? 'border-sage/40 shadow-[0_20px_40px_rgba(26,34,24,0.10)]'
              : 'border-sage/20 hover:-translate-y-1 hover:border-sage/40 hover:shadow-[0_20px_40px_rgba(26,34,24,0.12)]',
          )}
        >
          <DisclosureButton className="group flex w-full items-center gap-4 px-5 py-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:px-6">
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-forest/[0.07] text-forest transition-colors duration-300 group-hover:bg-forest/10"
              aria-hidden="true"
            >
              <Building2 className="h-6 w-6" />
            </span>

            <span className="min-w-0 flex-1">
              <span className="block text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-forest/45">
                Incorporated Society
              </span>
              <span
                className={cn(
                  'mt-1 block font-display text-base leading-snug text-forest sm:text-lg',
                  open ? '' : 'truncate',
                )}
              >
                {recorded ? record.legal_name : 'Society registration'}
              </span>
            </span>

            <span className="ml-auto flex shrink-0 items-center gap-3">
              {recorded ? (
                <StatusTag status={record.status} className="hidden sm:inline-flex" />
              ) : null}
              <span
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full border border-sage/25 text-forest/55',
                  'transition-[transform,background-color,color,border-color] duration-300 ease-out',
                  'group-hover:border-sage/45 group-hover:bg-sage-light/50 group-hover:text-forest',
                  open && 'rotate-180',
                )}
                aria-hidden="true"
              >
                <ChevronDown className="h-4 w-4" />
              </span>
            </span>
          </DisclosureButton>

          <AnimatePresence initial={false}>
            {open ? (
              <motion.div
                key="society-panel"
                initial={prefersReducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                animate={prefersReducedMotion ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                transition={{ duration: 0.42, ease: EASE_OUT }}
                className="overflow-hidden"
              >
                <DisclosurePanel static>
                  {recorded ? <RecordBody record={record} /> : <EmptyBody />}
                </DisclosurePanel>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      )}
    </Disclosure>
  );
}

function RecordBody({ record }: { record: SocietyRecordResponse }) {
  return (
    <div className="border-t border-sage/15 px-5 pb-6 pt-5 sm:px-6">
      <div className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
        <FieldGroup label="Identity">
          <Field label="NZBN" value={<span className="font-mono">{record.nzbn || '—'}</span>} />
          <Field label="Incorporation number" value={<span className="font-mono">{record.incorporation_number || '—'}</span>} />
          <Field label="More than 10 members" value={record.has_more_than_ten_members ? 'Yes' : 'No'} />
        </FieldGroup>

        <FieldGroup label="Registration">
          <Field label="Status" value={formatStatus(record.status)} />
          <Field label="Date of incorporation" value={formatDate(record.date_of_incorporation)} />
          <Field label="Date of re-registration" value={formatDate(record.date_of_reregistration)} />
          <Field label="Governing act" value={record.governing_act || '—'} />
        </FieldGroup>

        <div className="sm:col-span-2">
          <FieldGroup label="Registered office">
            <Field label="Address" value={record.registered_office_address || '—'} />
            <Field label="Effective from" value={formatDate(record.registered_office_start_date)} />
          </FieldGroup>
        </div>
      </div>

      {(record.companies_office_url || record.updated_at) && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-sage/15 pt-4">
          {record.companies_office_url ? (
            <a
              href={record.companies_office_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-terracotta transition-colors hover:text-terracotta-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              View on the Companies Office register
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          ) : (
            <span />
          )}
          {record.updated_at ? (
            <span className="font-mono text-xs text-forest/40">Updated {formatDate(record.updated_at)}</span>
          ) : null}
        </div>
      )}
    </div>
  );
}

function EmptyBody() {
  return (
    <div className="border-t border-sage/15 px-5 pb-8 pt-6 text-center sm:px-6">
      <p className="font-display text-lg text-forest">Not yet recorded</p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-forest/55">
        The society&apos;s registration details haven&apos;t been added yet. The committee can record them from the
        administration area.
      </p>
    </div>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-1 text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-forest/40">{label}</h3>
      <dl>{children}</dl>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-sage/12 py-2.5 last:border-b-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
      <dt className="text-sm text-forest/55">{label}</dt>
      <dd className="text-sm text-forest sm:max-w-[60%] sm:text-right">{value}</dd>
    </div>
  );
}

function StatusTag({ status, className }: { status: string; className?: string }) {
  if (!status) return null;
  return (
    <span
      role="status"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full bg-sage-light px-2.5 py-0.5',
        'text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-forest',
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-sage" aria-hidden="true" />
      {formatStatus(status)}
    </span>
  );
}

function LoadingFold() {
  return (
    <div className="overflow-hidden rounded-card border border-sage/20 bg-white">
      <div className="flex items-center gap-4 px-5 py-5 sm:px-6">
        <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-3 w-56" />
        </div>
        <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
      </div>
    </div>
  );
}
