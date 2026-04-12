/**
 * Contact form API client.
 * Note: Contact form submissions are public (no auth required for verified users).
 */

import { ApiError, isLocalApi } from './client';
import type { ContactFormData } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Re-export for consumers that import from api/contact
export type { ContactFormData } from '@/types';

export interface ContactFormResponse {
  success: boolean;
  message: string;
}

export interface SubmitContactFormParams extends ContactFormData {
  captchaToken: string;
}

export async function submitContactForm(
  data: SubmitContactFormParams,
  getToken: () => Promise<string | null>,
): Promise<ContactFormResponse> {
  // Get auth token if available (optional for verified users)
  const token = await getToken();
  const authToken = token ?? (isLocalApi ? 'dev-token' : null);

  const response = await fetch(`${API_URL}/api/v1/contact`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: JSON.stringify({
      name: data.name.trim(),
      email: data.email.trim(),
      subject: data.subject.trim(),
      message: data.message.trim(),
      captcha_token: data.captchaToken,
    }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ detail: response.statusText }));
    throw new ApiError(response.status, body);
  }

  return response.json() as Promise<ContactFormResponse>;
}
