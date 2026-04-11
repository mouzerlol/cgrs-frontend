'use client';

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { normalizeTurnstileSiteKey } from '@/lib/turnstile';
import { cn } from '@/lib/utils';
import { SectionLabel } from '@/components/ui/SectionLabel';

export interface TurnstileCaptchaRef {
  getToken: () => string | null;
  reset: () => void;
}

interface TurnstileCaptchaProps {
  onTokenChange?: (token: string | null) => void;
  className?: string;
}

/** Minimal Cloudflare Turnstile global API (script loads at runtime). */
interface TurnstileGlobal {
  render: (container: HTMLElement, options: Record<string, unknown>) => string;
  remove: (widgetId: string) => void;
  reset: (widgetId: string) => void;
  getResponse: (widgetId: string) => string;
}

declare global {
  interface Window {
    turnstile?: TurnstileGlobal;
  }
}

const CAPTCHA_CONTAINER_ID = 'turnstile-captcha-container';
const TURNSTILE_SCRIPT_ID = 'turnstile-api-script';
const TURNSTILE_SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js';

function loadTurnstileScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.turnstile) return Promise.resolve();

  const existing = document.getElementById(TURNSTILE_SCRIPT_ID) as HTMLScriptElement | null;
  if (existing) {
    return new Promise((resolve) => {
      if (window.turnstile) {
        resolve();
        return;
      }
      const onLoad = () => {
        if (window.turnstile) resolve();
      };
      existing.addEventListener('load', onLoad, { once: true });
      const t = setInterval(() => {
        if (window.turnstile) {
          clearInterval(t);
          resolve();
        }
      }, 50);
      setTimeout(() => {
        clearInterval(t);
        resolve();
      }, 15000);
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = TURNSTILE_SCRIPT_ID;
    script.src = TURNSTILE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Turnstile script'));
    document.head.appendChild(script);
  });
}

/**
 * Cloudflare Turnstile CAPTCHA. Uses `sitekey` (lowercase) per Cloudflare client API.
 */
export const TurnstileCaptcha = forwardRef<TurnstileCaptchaRef, TurnstileCaptchaProps>(
  function TurnstileCaptcha({ onTokenChange, className }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const onTokenChangeRef = useRef(onTokenChange);
    const [isReady, setIsReady] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [error, setError] = useState<string | null>(null);

    onTokenChangeRef.current = onTokenChange;

    useImperativeHandle(ref, () => ({
      getToken: () =>
        widgetIdRef.current && window.turnstile
          ? window.turnstile.getResponse(widgetIdRef.current)
          : null,
      reset: () => {
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.reset(widgetIdRef.current);
        }
        setIsVerified(false);
        setError(null);
        onTokenChangeRef.current?.(null);
      },
    }));

    useEffect(() => {
      const sitekey = normalizeTurnstileSiteKey(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
      if (!sitekey) {
        setError('CAPTCHA not configured');
        return;
      }

      let cancelled = false;

      const renderWidget = () => {
        if (cancelled || !containerRef.current || !window.turnstile) return;

        if (widgetIdRef.current) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch {
            /* already removed */
          }
          widgetIdRef.current = null;
        }

        // appearance 'always' keeps the widget shell visible; Turnstile may still verify
        // passively (no puzzle) for trusted visitors — that is normal, not a bug.
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey,
          appearance: 'always',
          callback: (token: string) => {
            if (cancelled) return;
            setIsVerified(true);
            setError(null);
            onTokenChangeRef.current?.(token);
          },
          'error-callback': () => {
            if (cancelled) return;
            setError('CAPTCHA error. Please try again.');
            setIsVerified(false);
            onTokenChangeRef.current?.(null);
          },
          'expired-callback': () => {
            if (cancelled) return;
            setError('CAPTCHA expired. Please verify again.');
            setIsVerified(false);
            onTokenChangeRef.current?.(null);
          },
          theme: 'light',
        });
        setIsReady(true);
      };

      void (async () => {
        try {
          await loadTurnstileScript();
          if (cancelled) return;
          requestAnimationFrame(renderWidget);
        } catch {
          if (!cancelled) setError('Failed to load CAPTCHA. Please refresh the page.');
        }
      })();

      return () => {
        cancelled = true;
        if (widgetIdRef.current && window.turnstile) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch {
            /* noop */
          }
        }
        widgetIdRef.current = null;
      };
    }, []);

    return (
      <div className={cn('flex flex-col gap-sm', className)}>
        <SectionLabel as="h4" className="mb-xs">Verification</SectionLabel>
        <div className="p-md bg-bone border border-dashed border-sage rounded-xl">
          <div className="flex items-center gap-md">
            <div className="flex items-center justify-center w-12 h-12 bg-sage-light rounded-[10px] text-forest shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-body text-sm font-semibold text-forest">CAPTCHA verification</span>
              {error ? (
                <span className="font-body text-xs text-terracotta">{error}</span>
              ) : isVerified ? (
                <span className="font-body text-xs text-green-600">Verified</span>
              ) : (
                <span className="font-body text-xs text-sage">Please complete the verification below</span>
              )}
            </div>
          </div>
          <div
            id={CAPTCHA_CONTAINER_ID}
            ref={containerRef}
            className={cn('mt-md min-h-[65px]', !isReady && 'opacity-50')}
          />
        </div>
      </div>
    );
  }
);
