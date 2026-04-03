'use client';

import { ClipboardCheck, Hash, Info } from 'lucide-react';

interface OwnerRequestInstructionsProps {
  address: string;
  requestId: string | null;
}

export default function OwnerRequestInstructions({ address, requestId }: OwnerRequestInstructionsProps) {
  return (
    <div className="space-y-6">
      {/* Success indicator */}
      <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm border border-sage/20">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-forest/10">
          <ClipboardCheck className="h-6 w-6 text-forest" />
        </div>
        <div>
          <h4 className="font-display text-lg text-forest">Request Submitted!</h4>
          <p className="text-sm text-forest/70">Your owner verification request has been sent to the Role Management board</p>
        </div>
      </div>

      {/* Instructions */}
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

      {/* Request reference */}
      {requestId && (
        <div className="flex items-center gap-2 rounded-xl bg-sage-light/30 p-4">
          <Hash className="h-5 w-5 text-forest/60" />
          <p className="text-sm text-forest/70">
            Reference: {requestId.slice(0, 8).toUpperCase()}
          </p>
        </div>
      )}

      {/* Contact info */}
      <div className="flex items-start gap-3 rounded-xl bg-amber/10 p-4 border border-amber/20">
        <Info className="h-5 w-5 text-amber shrink-0 mt-0.5" />
        <p className="text-sm text-forest/70">
          If you have any questions or need to provide additional documentation, please contact your property
          manager or society administrator.
        </p>
      </div>
    </div>
  );
}
