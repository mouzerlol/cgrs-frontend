'use client';

import { useState, useRef, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import { SectionLabel } from '@/components/ui/SectionLabel';
import {
  TurnstileCaptcha,
  type TurnstileCaptchaRef,
} from '@/components/management-request/TurnstileCaptcha';
import { signPetition } from '@/lib/api/petition';

type ResidentType = 'tenant' | 'owner';

const inputCls = [
  'w-full py-3 px-4 bg-bone border border-sage rounded-[10px]',
  'font-body text-base text-forest',
  'transition-all duration-[250ms] ease-out-custom',
  'focus:outline-none focus:border-terracotta focus:ring-[3px] focus:ring-terracotta/10',
  'placeholder:text-sage',
  'disabled:opacity-60 disabled:cursor-not-allowed',
].join(' ');
const errorCls = 'text-[0.8125rem] text-terracotta';
const labelCls = 'font-body text-sm font-medium text-forest';

const COMMITTEE_EMAIL = 'cgrscommittee@gmail.com';
const SHARE_TEXT =
  'I just signed the Coronation Gardens petition asking for a new society manager. Will you sign too?';

interface FieldErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  residentType?: string;
}

interface PetitionSignFormProps {
  supporterCount: number;
  goal: number;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function PetitionSignForm({ supporterCount, goal }: PetitionSignFormProps) {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [residentType, setResidentType] = useState<ResidentType | ''>('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState('');
  const [shareState, setShareState] = useState<'idle' | 'copied'>('idle');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [bannerError, setBannerError] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileCaptchaRef>(null);
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const residentTypeRef = useRef<HTMLLabelElement>(null);

  function validate(): FieldErrors {
    const errors: FieldErrors = {};
    if (!firstName.trim()) errors.firstName = 'Please enter your first name.';
    if (!lastName.trim()) errors.lastName = 'Please enter your last name.';
    if (!email.trim()) {
      errors.email = 'Please enter your email address.';
    } else if (!isValidEmail(email.trim())) {
      errors.email = 'That doesn’t look like a valid email address.';
    }
    if (!residentType) errors.residentType = 'Please select tenant or owner.';
    return errors;
  }

  function focusFirstError(errors: FieldErrors) {
    if (errors.firstName) firstNameRef.current?.focus();
    else if (errors.lastName) lastNameRef.current?.focus();
    else if (errors.email) emailRef.current?.focus();
    else if (errors.residentType) residentTypeRef.current?.focus();
  }

  function maskEmail(value: string): string {
    const [local, domain] = value.split('@');
    if (!local || !domain) return value;
    const visible = local.slice(0, 1);
    return `${visible}${'•'.repeat(Math.max(3, local.length - 1))}@${domain}`;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBannerError(null);

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      focusFirstError(errors);
      return;
    }
    setFieldErrors({});

    const token = turnstileRef.current?.getToken();
    if (!token) {
      setBannerError('Please complete the security check before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      await signPetition({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        resident_type: residentType as ResidentType,
        address: address.trim() || undefined,
        turnstile_token: token,
      });
      setMaskedEmail(maskEmail(email.trim()));
      setSubmitted(true);
      router.refresh();
    } catch (err: unknown) {
      const status = (err as { status?: number }).status;
      if (status === 409) {
        setBannerError('This email address has already been used to sign the petition.');
      } else if (status === 422) {
        setBannerError('The security check failed. Please try again.');
        turnstileRef.current?.reset();
      } else {
        setBannerError(
          `Something went wrong. Please try again, or email ${COMMITTEE_EMAIL} if it keeps happening.`,
        );
        turnstileRef.current?.reset();
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleShare() {
    const url = typeof window !== 'undefined' ? window.location.origin + '/petition/' : '';
    const shareData = {
      title: 'Coronation Gardens petition',
      text: SHARE_TEXT,
      url,
    };

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // user cancelled, do nothing
      }
      return;
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(`${SHARE_TEXT} ${url}`);
        setShareState('copied');
        setTimeout(() => setShareState('idle'), 2400);
      } catch {
        window.location.href = `sms:?&body=${encodeURIComponent(`${SHARE_TEXT} ${url}`)}`;
      }
    }
  }

  if (submitted) {
    const signatureNumber = supporterCount + 1;
    const remaining = Math.max(0, goal - signatureNumber);
    const goalReached = remaining === 0;

    return (
      <div className="bg-bone border border-sage/30 rounded-xl p-6 md:p-8">
        <div className="flex items-start gap-4 mb-5">
          <span className="shrink-0 w-12 h-12 rounded-full bg-terracotta flex items-center justify-center">
            <Icon icon="lucide:check" className="w-6 h-6 text-bone" />
          </span>
          <div>
            <p className="font-display text-2xl font-semibold text-forest leading-tight">
              Thank you for signing.
            </p>
            <p className="font-body text-sm text-forest/70 mt-1">
              We&rsquo;ve recorded your signature against{' '}
              <span className="font-medium text-forest">{maskedEmail}</span>.
            </p>
          </div>
        </div>

        <div className="border-t border-sage/40 pt-5">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-display text-3xl font-semibold text-forest leading-none">
              You&rsquo;re #{signatureNumber.toLocaleString()}
            </span>
          </div>
          <p className="font-body text-sm text-forest/70">
            {goalReached
              ? 'We’ve hit our goal. Every additional signature strengthens the case.'
              : `${remaining.toLocaleString()} more ${remaining === 1 ? 'neighbour' : 'neighbours'} to go.`}
          </p>
        </div>

        <div className="border-t border-sage/40 mt-5 pt-5">
          <p className="font-body text-sm text-forest/80 mb-3">
            Petitions grow when neighbours tell neighbours. Could you pass it on?
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleShare}
              className={cn(
                'inline-flex items-center justify-center gap-2',
                'py-3 px-5 rounded-xl',
                'bg-terracotta hover:bg-terracotta-dark',
                'font-body text-sm font-semibold text-bone',
                'transition-colors duration-200',
                'focus:outline-none focus-visible:ring-[3px] focus-visible:ring-terracotta/30 focus-visible:ring-offset-2',
              )}
            >
              <Icon
                icon={shareState === 'copied' ? 'lucide:check' : 'lucide:share-2'}
                width={16}
                height={16}
              />
              <span>{shareState === 'copied' ? 'Link copied' : 'Tell a neighbour'}</span>
            </button>
            <Link
              href="#comments"
              className={cn(
                'inline-flex items-center justify-center gap-2',
                'py-3 px-5 rounded-xl',
                'border border-sage bg-white hover:border-forest/40 hover:bg-bone',
                'font-body text-sm font-semibold text-forest',
                'transition-colors duration-200',
                'focus:outline-none focus-visible:ring-[3px] focus-visible:ring-forest/15 focus-visible:ring-offset-2',
              )}
            >
              <Icon icon="lucide:message-circle" width={16} height={16} />
              <span>Read what neighbours are saying</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-lg">
      <div className="flex flex-col gap-sm">
        <SectionLabel as="h4" className="mb-xs">
          Your details
        </SectionLabel>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
          <div className="flex flex-col gap-1.5">
            <label className={labelCls} htmlFor="first-name">
              First name <span className="text-terracotta">*</span>
            </label>
            <input
              id="first-name"
              ref={firstNameRef}
              type="text"
              autoComplete="given-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={isSubmitting}
              className={cn(inputCls, fieldErrors.firstName && 'border-terracotta')}
              placeholder="First name"
              aria-invalid={Boolean(fieldErrors.firstName)}
            />
            {fieldErrors.firstName && <span className={errorCls}>{fieldErrors.firstName}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelCls} htmlFor="last-name">
              Last name <span className="text-terracotta">*</span>
            </label>
            <input
              id="last-name"
              ref={lastNameRef}
              type="text"
              autoComplete="family-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={isSubmitting}
              className={cn(inputCls, fieldErrors.lastName && 'border-terracotta')}
              placeholder="Last name"
              aria-invalid={Boolean(fieldErrors.lastName)}
            />
            {fieldErrors.lastName && <span className={errorCls}>{fieldErrors.lastName}</span>}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelCls} htmlFor="email">
            Email address <span className="text-terracotta">*</span>
          </label>
          <input
            id="email"
            ref={emailRef}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            className={cn(inputCls, fieldErrors.email && 'border-terracotta')}
            placeholder="your.email@example.com"
            aria-invalid={Boolean(fieldErrors.email)}
          />
          {fieldErrors.email && <span className={errorCls}>{fieldErrors.email}</span>}
        </div>
      </div>

      <div className="flex flex-col gap-sm">
        <SectionLabel as="h4" className="mb-xs">
          Your connection to Coronation Gardens
        </SectionLabel>

        <fieldset className="flex flex-col gap-1.5">
          <legend className={labelCls}>
            Are you a tenant or owner? <span className="text-terracotta">*</span>
          </legend>
          <div className="grid grid-cols-2 gap-sm mt-1.5" role="radiogroup">
            {(['tenant', 'owner'] as const).map((type, idx) => {
              const active = residentType === type;
              return (
                <label
                  key={type}
                  ref={idx === 0 ? residentTypeRef : undefined}
                  className={cn(
                    'relative flex items-center justify-center gap-2 cursor-pointer',
                    'py-3 px-4 rounded-[10px] border bg-bone',
                    'font-body text-base font-medium capitalize',
                    'transition-all duration-[250ms] ease-out-custom',
                    active
                      ? 'border-terracotta bg-terracotta/5 ring-[3px] ring-terracotta/10 text-forest'
                      : 'border-sage text-forest/80 hover:border-sage/70',
                    fieldErrors.residentType && !active && 'border-terracotta/60',
                  )}
                  tabIndex={0}
                >
                  <input
                    type="radio"
                    name="resident-type"
                    value={type}
                    checked={active}
                    onChange={() => setResidentType(type)}
                    disabled={isSubmitting}
                    className="sr-only"
                  />
                  {active && <Icon icon="lucide:check" className="w-4 h-4 text-terracotta" />}
                  <span>{type}</span>
                </label>
              );
            })}
          </div>
          {fieldErrors.residentType && (
            <span className={errorCls}>{fieldErrors.residentType}</span>
          )}
        </fieldset>

        <div className="flex flex-col gap-1.5">
          <label className={labelCls} htmlFor="address">
            Property address{' '}
            <span className="font-normal text-forest/50">(optional)</span>
          </label>
          <input
            id="address"
            type="text"
            autoComplete="street-address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            disabled={isSubmitting}
            className={inputCls}
            placeholder="Street number and name"
            aria-describedby="address-help"
          />
          <span id="address-help" className="text-xs text-forest/55">
            Helps us verify you&rsquo;re a Coronation Gardens resident. Not published or shared.
          </span>
        </div>
      </div>

      <TurnstileCaptcha ref={turnstileRef} />

      {bannerError && (
        <p
          role="alert"
          className="font-body text-sm text-terracotta bg-terracotta/5 border border-terracotta/30 rounded-[10px] px-4 py-3"
        >
          {bannerError}
        </p>
      )}

      <div className="flex flex-row flex-wrap items-center justify-between gap-sm">
        <p className="font-body text-xs text-forest/50">
          What will we do with your details?{' '}
          <Link href="/petition/privacy-policy" className="underline hover:text-forest/80">
            Read our privacy policy
          </Link>
        </p>
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            'inline-flex items-center justify-center gap-sm',
            'py-3.5 px-8 min-h-[52px]',
            'bg-terracotta rounded-xl',
            'font-body text-base font-semibold text-bone',
            'cursor-pointer border-none shrink-0',
            'transition-all duration-[250ms] ease-out-custom',
            'hover:bg-terracotta-dark',
            'disabled:opacity-70 disabled:cursor-not-allowed',
            isSubmitting && 'bg-forest-light',
          )}
        >
          {isSubmitting ? (
            <>
              <Icon icon="lucide:loader-2" width={20} height={20} className="animate-spin" />
              <span>Signing…</span>
            </>
          ) : (
            <>
              <Icon icon="lucide:send" width={20} height={20} />
              <span>Sign this petition</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
