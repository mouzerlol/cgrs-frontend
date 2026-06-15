'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Landmark } from 'lucide-react';
import WorkManagementNavBar from '@/components/work-management/WorkManagementNavBar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useSocietyRecordQuery, useUpdateSocietyRecord } from '@/hooks/useSociety';
import { canAccessManagement } from '@/lib/auth';
import { ApiError } from '@/lib/api/client';
import type { SocietyRecordUpdateRequest, SocietyStatus } from '@/lib/api/society';

type FormState = {
  legal_name: string;
  has_more_than_ten_members: boolean;
  nzbn: string;
  incorporation_number: string;
  status: SocietyStatus;
  date_of_incorporation: string;
  date_of_reregistration: string;
  governing_act: string;
  registered_office_address: string;
  registered_office_start_date: string;
  companies_office_url: string;
};

const EMPTY_FORM: FormState = {
  legal_name: '',
  has_more_than_ten_members: false,
  nzbn: '',
  incorporation_number: '',
  status: 'registered',
  date_of_incorporation: '',
  date_of_reregistration: '',
  governing_act: 'Incorporated Societies Act 2022',
  registered_office_address: '',
  registered_office_start_date: '',
  companies_office_url: '',
};

const inputClass =
  'w-full rounded border border-sage/40 bg-white px-3 py-2 text-sm text-forest focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest';

/** Map a FastAPI 422 body to per-field error messages keyed by field name. */
function parseFieldErrors(error: unknown): Record<string, string> {
  if (!(error instanceof ApiError) || error.status !== 422) return {};
  const detail = (error.body as { detail?: unknown })?.detail;
  if (!Array.isArray(detail)) return {};
  const result: Record<string, string> = {};
  for (const item of detail) {
    if (item && typeof item === 'object' && 'loc' in item && 'msg' in item) {
      const loc = (item as { loc: unknown[] }).loc;
      const field = String(loc[loc.length - 1]);
      result[field] = String((item as { msg: unknown }).msg);
    }
  }
  return result;
}

function Field({
  label,
  htmlFor,
  error,
  children,
  required,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-forest">
        {label}
        {required ? <span className="text-terracotta"> *</span> : null}
      </label>
      {children}
      {error ? <p className="text-xs text-terracotta">{error}</p> : null}
    </div>
  );
}

export default function AdminSocietyPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const { data: currentUser, isLoading: isUserLoading } = useCurrentUser();
  const isSuperadmin = currentUser?.is_superadmin ?? false;
  const canEdit = canAccessManagement(currentUser?.membership?.role, isSuperadmin);

  const { data: record, isLoading: isRecordLoading } = useSocietyRecordQuery(canEdit);
  const updateMutation = useUpdateSocietyRecord();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  // Populate the form once the record loads.
  useEffect(() => {
    if (!record) return;
    setForm({
      legal_name: record.legal_name ?? '',
      has_more_than_ten_members: record.has_more_than_ten_members ?? false,
      nzbn: record.nzbn ?? '',
      incorporation_number: record.incorporation_number ?? '',
      status: (record.status as SocietyStatus) || 'registered',
      date_of_incorporation: record.date_of_incorporation ?? '',
      date_of_reregistration: record.date_of_reregistration ?? '',
      governing_act: record.governing_act || 'Incorporated Societies Act 2022',
      registered_office_address: record.registered_office_address ?? '',
      registered_office_start_date: record.registered_office_start_date ?? '',
      companies_office_url: record.companies_office_url ?? '',
    });
  }, [record]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setShowSuccess(false);
  };

  const submitError = useMemo(() => {
    if (!updateMutation.error) return null;
    const err = updateMutation.error;
    if (err instanceof ApiError && err.status === 422) return null; // shown per-field
    return err instanceof Error ? err.message : 'Failed to save. Please try again.';
  }, [updateMutation.error]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setShowSuccess(false);
    const payload: SocietyRecordUpdateRequest = {
      legal_name: form.legal_name.trim(),
      has_more_than_ten_members: form.has_more_than_ten_members,
      nzbn: form.nzbn.trim(),
      incorporation_number: form.incorporation_number.trim(),
      status: form.status,
      date_of_incorporation: form.date_of_incorporation,
      date_of_reregistration: form.date_of_reregistration || null,
      governing_act: form.governing_act.trim(),
      registered_office_address: form.registered_office_address.trim(),
      registered_office_start_date: form.registered_office_start_date,
      companies_office_url: form.companies_office_url.trim() || null,
    };
    updateMutation.mutate(payload, {
      onSuccess: () => setShowSuccess(true),
      onError: (err) => setFieldErrors(parseFieldErrors(err)),
    });
  };

  const renderBody = () => {
    if (!isLoaded || isUserLoading) {
      return <Card className="p-6"><div className="h-64 animate-pulse rounded bg-sage/10" /></Card>;
    }
    if (!isSignedIn || !canEdit) {
      return (
        <Card className="p-8 text-center">
          <p className="text-forest/70">
            You don&apos;t have permission to edit the society record. This is available to committee members,
            the chairperson, and the society manager.
          </p>
        </Card>
      );
    }
    if (isRecordLoading) {
      return <Card className="p-6"><div className="h-64 animate-pulse rounded bg-sage/10" /></Card>;
    }

    return (
      <Card className="p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Field label="Incorporated society name" htmlFor="legal_name" error={fieldErrors.legal_name} required>
            <input
              id="legal_name"
              type="text"
              className={inputClass}
              value={form.legal_name}
              onChange={(e) => update('legal_name', e.target.value)}
            />
          </Field>

          <div className="flex items-center gap-2">
            <input
              id="has_more_than_ten_members"
              type="checkbox"
              className="h-4 w-4 rounded border-sage/40 text-forest focus:ring-forest"
              checked={form.has_more_than_ten_members}
              onChange={(e) => update('has_more_than_ten_members', e.target.checked)}
            />
            <label htmlFor="has_more_than_ten_members" className="text-sm text-forest">
              More than 10 members (s8(1) Incorporated Societies Act 2022)
            </label>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="NZBN" htmlFor="nzbn" error={fieldErrors.nzbn} required>
              <input
                id="nzbn"
                type="text"
                inputMode="numeric"
                className={inputClass}
                value={form.nzbn}
                onChange={(e) => update('nzbn', e.target.value)}
                placeholder="13 digits"
              />
            </Field>
            <Field
              label="Incorporation number"
              htmlFor="incorporation_number"
              error={fieldErrors.incorporation_number}
              required
            >
              <input
                id="incorporation_number"
                type="text"
                inputMode="numeric"
                className={inputClass}
                value={form.incorporation_number}
                onChange={(e) => update('incorporation_number', e.target.value)}
              />
            </Field>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Status" htmlFor="status" error={fieldErrors.status} required>
              <select
                id="status"
                className={inputClass}
                value={form.status}
                onChange={(e) => update('status', e.target.value as SocietyStatus)}
              >
                <option value="registered">Registered</option>
                <option value="removed">Removed</option>
                <option value="dissolved">Dissolved</option>
              </select>
            </Field>
            <Field label="Governing act" htmlFor="governing_act" error={fieldErrors.governing_act} required>
              <input
                id="governing_act"
                type="text"
                className={inputClass}
                value={form.governing_act}
                onChange={(e) => update('governing_act', e.target.value)}
              />
            </Field>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field
              label="Date of incorporation"
              htmlFor="date_of_incorporation"
              error={fieldErrors.date_of_incorporation}
              required
            >
              <input
                id="date_of_incorporation"
                type="date"
                className={inputClass}
                value={form.date_of_incorporation}
                onChange={(e) => update('date_of_incorporation', e.target.value)}
              />
            </Field>
            <Field
              label="Date of re-registration"
              htmlFor="date_of_reregistration"
              error={fieldErrors.date_of_reregistration}
            >
              <input
                id="date_of_reregistration"
                type="date"
                className={inputClass}
                value={form.date_of_reregistration}
                onChange={(e) => update('date_of_reregistration', e.target.value)}
              />
            </Field>
          </div>

          <Field
            label="Registered office address"
            htmlFor="registered_office_address"
            error={fieldErrors.registered_office_address}
            required
          >
            <textarea
              id="registered_office_address"
              rows={2}
              className={inputClass}
              value={form.registered_office_address}
              onChange={(e) => update('registered_office_address', e.target.value)}
            />
          </Field>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field
              label="Office address start date"
              htmlFor="registered_office_start_date"
              error={fieldErrors.registered_office_start_date}
              required
            >
              <input
                id="registered_office_start_date"
                type="date"
                className={inputClass}
                value={form.registered_office_start_date}
                onChange={(e) => update('registered_office_start_date', e.target.value)}
              />
            </Field>
            <Field
              label="Companies Office filing URL"
              htmlFor="companies_office_url"
              error={fieldErrors.companies_office_url}
            >
              <input
                id="companies_office_url"
                type="url"
                className={inputClass}
                value={form.companies_office_url}
                onChange={(e) => update('companies_office_url', e.target.value)}
              />
            </Field>
          </div>

          {submitError ? (
            <p className="rounded bg-terracotta/10 px-3 py-2 text-sm text-terracotta">{submitError}</p>
          ) : null}
          {showSuccess ? (
            <p className="rounded bg-forest/10 px-3 py-2 text-sm text-forest">Society record saved.</p>
          ) : null}

          <div className="flex justify-end">
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving…' : 'Save record'}
            </Button>
          </div>
        </form>
      </Card>
    );
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-bone">
      <WorkManagementNavBar title="Society" showBackButton backHref="/admin" backLabel="Administration" />
      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl p-6 md:p-8 lg:p-12">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest/10">
              <Landmark className="h-5 w-5 text-forest" aria-hidden="true" />
            </div>
            <div>
              <h1 className="font-display text-2xl text-forest">Society record</h1>
              <p className="text-sm text-forest/60">
                The society&apos;s incorporated registration details, shown to members on their account.
              </p>
            </div>
          </div>
          {renderBody()}
        </div>
      </main>
    </div>
  );
}
