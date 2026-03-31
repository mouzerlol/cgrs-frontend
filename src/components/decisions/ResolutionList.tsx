"use client";

import { Resolution } from "@/types/decisions";
import ResolutionCard from "./ResolutionCard";
import EmptyState from "@/components/ui/EmptyState";
import { motion } from "framer-motion";

interface ResolutionListProps {
    resolutions: Resolution[];
    memberMap: Map<string, string>;
    onSelectResolution: (resolution: Resolution) => void;
    onCopyLink: (resolution: Resolution) => void;
    onCopyEmail: (resolution: Resolution) => void;
    onExportPdf: (resolution: Resolution) => void;
    className?: string;
}

export default function ResolutionList({
    resolutions,
    memberMap,
    onSelectResolution,
    onCopyLink,
    onCopyEmail,
    onExportPdf,
    className = "",
}: ResolutionListProps) {
    if (resolutions.length === 0) {
        return (
            <EmptyState
                className={className}
                icon={
                    <svg className="w-8 h-8 text-forest/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                }
                title="No resolutions found"
                description="Try adjusting your filters or create a new resolution to get started."
            />
        );
    }

    return (
        <div
            className={`flex flex-col gap-3 overflow-y-auto custom-scrollbar ${className}`}
        >
            {resolutions.map((resolution, index) => (
                <motion.div
                    key={resolution.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                    <ResolutionCard
                        resolution={resolution}
                        memberName={
                            resolution.actionOwner
                                ? memberMap.get(resolution.actionOwner) || null
                                : null
                        }
                        onClick={() => onSelectResolution(resolution)}
                        onCopyLink={(e) => {
                            e.stopPropagation();
                            onCopyLink(resolution);
                        }}
                        onCopyEmail={(e) => {
                            e.stopPropagation();
                            onCopyEmail(resolution);
                        }}
                        onExportPdf={(e) => {
                            e.stopPropagation();
                            onExportPdf(resolution);
                        }}
                    />
                </motion.div>
            ))}
        </div>
    );
}
