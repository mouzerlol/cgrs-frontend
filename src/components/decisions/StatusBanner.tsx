"use client";

import { Resolution } from "@/types/decisions";
import { ResolutionStatus } from "@/types/decisions";

interface StatusBannerProps {
    status: ResolutionStatus;
    outcome: string;
    rescindedBy: string | null;
    rescindingResolution: string | null;
    className?: string;
}

const statusStyles: Record<
    ResolutionStatus,
    { bg: string; text: string; label: string }
> = {
    draft: { bg: "bg-forest/40", text: "text-white", label: "DRAFT" },
    active: { bg: "bg-amber-500", text: "text-white", label: "ACTION IN PROGRESS" },
    completed: { bg: "bg-green-500", text: "text-white", label: "COMPLETED" },
    overdue: { bg: "bg-red-500", text: "text-white", label: "OVERDUE" },
    rescinded: { bg: "bg-red-900", text: "text-white", label: "RESCINDED" },
};

export default function StatusBanner({
    status,
    outcome,
    rescindedBy,
    rescindingResolution,
    className = "",
}: StatusBannerProps) {
    const style = statusStyles[status];

    return (
        <div
            className={`${style.bg} ${style.text} px-4 py-3 ${className}`}
        >
            <div className="flex items-center justify-between">
                <span className="font-bold text-sm uppercase tracking-wide">
                    {style.label}
                </span>
                {status === "rescinded" && rescindedBy && (
                    <span className="text-xs opacity-80">
                        Rescinded by{" "}
                        <span className="underline">{rescindedBy}</span>
                    </span>
                )}
                {rescindingResolution && (
                    <span className="text-xs opacity-80">
                        Rescinds{" "}
                        <span className="underline">{rescindingResolution}</span>
                    </span>
                )}
            </div>
        </div>
    );
}
