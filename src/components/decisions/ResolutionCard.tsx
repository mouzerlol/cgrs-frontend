"use client";

import { Resolution } from "@/types/decisions";
import { Badge } from "@/components/ui/Badge";
import { formatDate, formatCurrency, getDerivedStatus, STATUS_CONFIG } from "@/lib/decisions";
import { Link, Mail, FileText } from "lucide-react";

interface ResolutionCardProps {
    resolution: Resolution;
    memberName: string | null;
    onClick: () => void;
    onCopyLink: (e: React.MouseEvent) => void;
    onCopyEmail: (e: React.MouseEvent) => void;
    onExportPdf: (e: React.MouseEvent) => void;
    className?: string;
}

export default function ResolutionCard({
    resolution,
    memberName,
    onClick,
    onCopyLink,
    onCopyEmail,
    onExportPdf,
    className = "",
}: ResolutionCardProps) {
    const derivedStatus = getDerivedStatus(
        resolution.outcome,
        resolution.status,
        resolution.deadline
    );
    const statusConfig = STATUS_CONFIG[derivedStatus];

    const isOverdue =
        derivedStatus === "overdue" ||
        (resolution.deadline &&
            derivedStatus === "active" &&
            new Date(resolution.deadline) < new Date());

    return (
        <div
            className={`group bg-white rounded-[10px] border border-sage/10 shadow-sm hover:shadow-md transition-all cursor-pointer ${className}`}
            onClick={onClick}
        >
            <div className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="font-mono text-sm font-bold text-terracotta tracking-tight">
                                {resolution.id}
                            </span>
                            <span className="text-forest/40 text-xs">
                                {formatDate(resolution.meetingDate)}
                            </span>
                            {resolution.portfolioTags.map((tag) => (
                                <span
                                    key={tag}
                                    className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-sage-light text-forest/70 rounded-full"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                        <h3 className="font-display text-base font-semibold text-forest line-clamp-2">
                            {resolution.title}
                        </h3>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                            className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${statusConfig.bg} ${statusConfig.color}`}
                        >
                            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                            {statusConfig.label}
                        </span>
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-forest/60">
                        <span>
                            <span className="text-forest/40">Owner:</span>{" "}
                            <span
                                className={
                                    !memberName
                                        ? "text-red-600 font-medium"
                                        : "text-forest"
                                }
                            >
                                {memberName || "Unassigned"}
                            </span>
                        </span>
                        {resolution.deadline && (
                            <span>
                                <span className="text-forest/40">Deadline:</span>{" "}
                                <span
                                    className={
                                        isOverdue ? "text-red-600 font-medium" : ""
                                    }
                                >
                                    {formatDate(resolution.deadline)}
                                </span>
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        {resolution.financialCommitment !== null && (
                            <span className="font-medium text-forest">
                                {formatCurrency(
                                    resolution.financialCommitment,
                                    resolution.financialGst
                                )}
                            </span>
                        )}

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity md:opacity-100">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onCopyLink(e);
                                }}
                                className="p-1.5 rounded-md hover:bg-sage/10 text-forest/50 hover:text-terracotta transition-colors"
                                aria-label="Copy link"
                                title="Copy link"
                            >
                                <Link className="w-4 h-4" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onCopyEmail(e);
                                }}
                                className="p-1.5 rounded-md hover:bg-sage/10 text-forest/50 hover:text-terracotta transition-colors"
                                aria-label="Copy for email"
                                title="Copy for email"
                            >
                                <Mail className="w-4 h-4" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onExportPdf(e);
                                }}
                                className="p-1.5 rounded-md hover:bg-sage/10 text-forest/50 hover:text-terracotta transition-colors"
                                aria-label="Export PDF"
                                title="Export PDF"
                            >
                                <FileText className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
