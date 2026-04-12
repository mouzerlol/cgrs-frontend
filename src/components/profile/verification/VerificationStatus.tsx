'use client';

import { Clock, Check, X, Info, Users, Mail, ShieldCheck } from 'lucide-react';

type VerificationMethod = 'peer' | 'qr_mail' | 'role_management';

interface VerificationStatusProps {
  type: 'pending' | 'approved' | 'rejected';
  address: string;
  verificationType: 'resident' | 'owner';
  verificationMethod?: VerificationMethod | null;
}

export default function VerificationStatus({
  type,
  address,
  verificationType,
  verificationMethod = 'peer',
}: VerificationStatusProps) {
  if (type === 'pending') {
    if (verificationMethod === 'qr_mail') {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm border border-sage/20">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-terracotta/10">
              <Mail className="h-6 w-6 text-terracotta" />
            </div>
            <div>
              <h4 className="font-display text-lg text-forest">
                {verificationType === 'owner' ? 'Owner' : 'Resident'} Verification Pending
              </h4>
              <p className="text-sm text-forest/70">
                Waiting for your QR letter to arrive at {address}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm border border-sage/20">
            <h4 className="font-display text-lg text-forest mb-4">What happens next?</h4>
            <ol className="space-y-4">
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage-light text-xs font-medium text-forest">
                  1
                </span>
                <div>
                  <p className="font-medium text-forest">A QR code is being mailed to your address</p>
                  <p className="text-sm text-forest/60">
                    A physical letter containing a unique QR code will be delivered to {address}.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage-light text-xs font-medium text-forest">
                  2
                </span>
                <div>
                  <p className="font-medium text-forest">Scan the QR code when you receive it</p>
                  <p className="text-sm text-forest/60">
                    Use your phone&apos;s camera to scan the QR code from the letter.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage-light text-xs font-medium text-forest">
                  3
                </span>
                <div>
                  <p className="font-medium text-forest">You&apos;re verified!</p>
                  <p className="text-sm text-forest/60">
                    Once scanned, your account will be upgraded to verified {verificationType}.
                  </p>
                </div>
              </li>
            </ol>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-sage-light/30 p-4">
            <Clock className="h-5 w-5 text-forest/60" />
            <p className="text-sm text-forest/70">
              Standard mail delivery typically takes 3-5 business days. QR code expires in 30 days.
            </p>
          </div>
        </div>
      );
    }

    if (verificationMethod === 'role_management') {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm border border-sage/20">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-forest/10">
              <ShieldCheck className="h-6 w-6 text-forest" />
            </div>
            <div>
              <h4 className="font-display text-lg text-forest">Owner Verification Pending</h4>
              <p className="text-sm text-forest/70">
                Your owner verification is being reviewed for {address}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm border border-sage/20">
            <h4 className="font-display text-lg text-forest mb-4">What happens next?</h4>
            <ol className="space-y-4">
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage-light text-xs font-medium text-forest">
                  1
                </span>
                <div>
                  <p className="font-medium text-forest">Staff reviews your request</p>
                  <p className="text-sm text-forest/60">
                    Your request has been added to the Role Management board where staff will review your ownership claim.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage-light text-xs font-medium text-forest">
                  2
                </span>
                <div>
                  <p className="font-medium text-forest">Verification of ownership</p>
                  <p className="text-sm text-forest/60">
                    Staff may contact you to verify your ownership through documentation such as council rates notices,
                    title deeds, or utility accounts.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage-light text-xs font-medium text-forest">
                  3
                </span>
                <div>
                  <p className="font-medium text-forest">Role updated</p>
                  <p className="text-sm text-forest/60">
                    Once verified, your account will be upgraded to verified owner status and you&apos;ll have full access
                    to owner-exclusive features.
                  </p>
                </div>
              </li>
            </ol>
          </div>

          <div className="flex items-start gap-2 rounded-xl bg-amber/10 p-4 border border-amber/20">
            <Info className="h-5 w-5 text-amber shrink-0 mt-0.5" />
            <p className="text-sm text-forest/70">
              If you have any questions or need to provide additional documentation, please contact your property
              manager or society administrator.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm border border-sage/20">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-terracotta/10">
            <Clock className="h-6 w-6 text-terracotta" />
          </div>
          <div>
            <h4 className="font-display text-lg text-forest">
              {verificationType === 'owner' ? 'Owner' : 'Resident'} Verification Pending
            </h4>
            <p className="text-sm text-forest/70">
              Waiting for approval at {address}
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm border border-sage/20">
          <h4 className="font-display text-lg text-forest mb-4">What happens next?</h4>
          {verificationType === 'resident' ? (
            <ol className="space-y-4">
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage-light text-xs font-medium text-forest">
                  1
                </span>
                <div>
                  <p className="font-medium text-forest">Current residents will be notified</p>
                  <p className="text-sm text-forest/60">
                    Existing verified residents at {address} will receive a notification.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage-light text-xs font-medium text-forest">
                  2
                </span>
                <div>
                  <p className="font-medium text-forest">They verify your residency</p>
                  <p className="text-sm text-forest/60">
                    A resident must confirm you live at this address.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage-light text-xs font-medium text-forest">
                  3
                </span>
                <div>
                  <p className="font-medium text-forest">You&apos;re verified!</p>
                  <p className="text-sm text-forest/60">
                    Once approved, your account will be upgraded to verified resident.
                  </p>
                </div>
              </li>
            </ol>
          ) : (
            <ol className="space-y-4">
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage-light text-xs font-medium text-forest">
                  1
                </span>
                <div>
                  <p className="font-medium text-forest">Current owners will be notified</p>
                  <p className="text-sm text-forest/60">
                    Existing verified owners at {address} will receive a notification.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage-light text-xs font-medium text-forest">
                  2
                </span>
                <div>
                  <p className="font-medium text-forest">They verify your ownership</p>
                  <p className="text-sm text-forest/60">
                    An existing owner must confirm your ownership of this property.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage-light text-xs font-medium text-forest">
                  3
                </span>
                <div>
                  <p className="font-medium text-forest">You&apos;re verified!</p>
                  <p className="text-sm text-forest/60">
                    Once approved, your account will be upgraded to verified owner.
                  </p>
                </div>
              </li>
            </ol>
          )}
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-sage-light/30 p-4">
          <Info className="h-5 w-5 text-forest/60" />
          <p className="text-sm text-forest/70">
            If no existing member responds within 7 days, please contact the society manager.
          </p>
        </div>
      </div>
    );
  }

  if (type === 'approved') {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-forest/10 p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-forest text-bone">
          <Check className="h-6 w-6" />
        </div>
        <div>
          <h4 className="font-display text-lg text-forest">Verified!</h4>
          <p className="text-sm text-forest/70">
            You are now a verified {verificationType} at {address}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-terracotta/10 p-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-terracotta text-bone">
        <X className="h-6 w-6" />
      </div>
      <div>
        <h4 className="font-display text-lg text-forest">Verification Rejected</h4>
        <p className="text-sm text-forest/70">
          Your verification request for {address} was not approved.
        </p>
      </div>
    </div>
  );
}
