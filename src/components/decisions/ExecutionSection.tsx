"use client";

import { Resolution } from "@/types/decisions";
import { formatDate, formatCurrency } from "@/lib/decisions";
import Link from "next/link";

interface ExecutionSectionProps {
    resolution: Resolution;
    ownerName: string | null;
    className?: string;
}

export default function ExecutionSection({
    resolution,
    ownerName,
    className = "",
}: ExecutionSectionProps) {
    const isOverdue =
        resolution.deadline &&
        resolution.status !== "completed" &&
        resolution.status !== "rescinded" &&
        new Date(resolution.deadline) < new Date();

    return (
        <div className={`space-y-3 ${className}`}>
            <h4 className="font-display text-[10px] font-bold text-forest/40 uppercase tracking-widest">
                Execution
            </h4>

            <div className="grid grid-cols-[100px_1fr] gap-x-4 gap-y-2 text-sm">
                <span className="text-forest/60">Owner:</span>
                <span
                    className={
                        !ownerName ? "text-red-600 font-medium" : "text-forest"
                    }
                >
                    {ownerName || "No owner assigned"}
                </span>

                <span className="text-forest/60">Deadline:</span>
                <span
                    className={isOverdue ? "text-red-600 font-medium" : "text-forest"}
                >
                    {resolution.deadline ? (
                        <span className="flex items-center gap-1.5">
                            {isOverdue && (
                                <span className="text-red-500" title="Overdue">
                                    ⚠
                                </span>
                            )}
                            {formatDate(resolution.deadline)}
                        </span>
                    ) : (
                        <span className="text-forest/40 italic">No deadline set</span>
                    )}
                </span>

                <span className="text-forest/60">Portfolio:</span>
                <div className="flex flex-wrap gap-1.5">
                    {resolution.portfolioTags.length > 0 ? (
                        resolution.portfolioTags.map((tag) => (
                            <span
                                key={tag}
                                className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-sage-light text-forest/70 rounded-full"
                            >
                                {tag}
                            </span>
                        ))
                    ) : (
                        <span className="text-forest/40 italic">No portfolio</span>
                    )}
                </div>

                <span className="text-forest/60">Financial:</span>
                <span className="text-forest font-medium">
                    {resolution.financialCommitment !== null ? (
                        formatCurrency(
                            resolution.financialCommitment,
                            resolution.financialGst
                        )
                    ) : (
                        <span className="text-forest/40 italic">
                            No financial commitment
                        </span>
                    )}
                </span>

                {resolution.linkedBoardTask && (
                    <>
                        <span className="text-forest/60">Board:</span>
                        <Link
                            href={`/work-management/boards/${resolution.linkedBoardTask}`}
                            className="text-terracotta hover:underline"
                        >
                            View linked task →
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}
