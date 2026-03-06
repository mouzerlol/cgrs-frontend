"use client";

import { useState } from "react";
import { Resolution } from "@/types/decisions";
import { formatDate, formatCurrency, getVoteTallyText, getDerivedStatus } from "@/lib/decisions";
import { Link, Mail, FileText, Check } from "lucide-react";

interface QuickActionsProps {
    resolution: Resolution;
    memberMap: Map<string, string>;
    className?: string;
}

export default function QuickActions({
    resolution,
    memberMap,
    className = "",
}: QuickActionsProps) {
    const [toast, setToast] = useState<string | null>(null);

    const showToast = (message: string) => {
        setToast(message);
        setTimeout(() => setToast(null), 2500);
    };

    const ownerName = resolution.actionOwner
        ? memberMap.get(resolution.actionOwner) || "Unknown"
        : "Unassigned";

    const derivedStatus = getDerivedStatus(
        resolution.outcome,
        resolution.status,
        resolution.deadline
    );

    const copyLink = () => {
        const url = `${window.location.origin}/work-management/decisions/${resolution.id}`;
        navigator.clipboard.writeText(url);
        showToast("Link copied to clipboard");
    };

    const copyForEmail = () => {
        const voteText =
            resolution.votesAgainst === 0 && resolution.votesAbstain === 0
                ? "Unanimous"
                : `${resolution.votesFor} For / ${resolution.votesAgainst} Against / ${resolution.votesAbstain} Abstain`;

        const text = `
──────────────────────────────────────
CGRS — Official Committee Resolution
──────────────────────────────────────

Reference:  ${resolution.id}
Date:       ${formatDate(resolution.meetingDate)}
Decision:   ${resolution.title}

Motion:     "${resolution.motionText}"

Outcome:    ${resolution.outcome === "carried" ? "CARRIED" : "NOT CARRIED"} (${voteText})
Owner:      ${ownerName}
Deadline:   ${resolution.deadline ? formatDate(resolution.deadline) : "—"}
Status:     ${derivedStatus}

View online: ${window.location.origin}/work-management/decisions/${resolution.id}

──────────────────────────────────────
Coronation Gardens Residents Society
Committee Decision Register
──────────────────────────────────────
        `.trim();

        navigator.clipboard.writeText(text);
        showToast("Copied for email");
    };

    const exportPdf = () => {
        showToast("PDF export coming soon");
    };

    return (
        <div className={`relative ${className}`}>
            <div className="flex items-center gap-2">
                <button
                    onClick={copyLink}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-forest bg-sage-light rounded-lg hover:bg-sage transition-colors"
                >
                    <Link className="w-4 h-4" />
                    Copy Link
                </button>
                <button
                    onClick={copyForEmail}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-forest bg-sage-light rounded-lg hover:bg-sage transition-colors"
                >
                    <Mail className="w-4 h-4" />
                    Copy for Email
                </button>
                <button
                    onClick={exportPdf}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-forest bg-sage-light rounded-lg hover:bg-sage transition-colors"
                >
                    <FileText className="w-4 h-4" />
                    Export PDF
                </button>
            </div>

            {toast && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-forest text-white text-sm rounded-lg shadow-lg flex items-center gap-2 animate-fade-up">
                    <Check className="w-4 h-4 text-green-400" />
                    {toast}
                </div>
            )}
        </div>
    );
}
