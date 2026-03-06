"use client";

import { ResolutionDocument } from "@/types/decisions";
import { FileText, Link as LinkIcon, ExternalLink } from "lucide-react";

interface ReferencesSectionProps {
    documents: ResolutionDocument[];
    linkedBoardTask: string | null;
    rescindedBy: string | null;
    rescindingResolution: string | null;
    className?: string;
}

export default function ReferencesSection({
    documents,
    linkedBoardTask,
    rescindedBy,
    rescindingResolution,
    className = "",
}: ReferencesSectionProps) {
    const hasReferences =
        documents.length > 0 ||
        linkedBoardTask ||
        rescindedBy ||
        rescindingResolution;

    return (
        <div className={`space-y-3 ${className}`}>
            <h4 className="font-display text-[10px] font-bold text-forest/40 uppercase tracking-widest">
                References
            </h4>

            {!hasReferences ? (
                <p className="text-sm text-forest/40 italic py-2">
                    No references attached.
                </p>
            ) : (
                <div className="space-y-2">
                    {documents.map((doc) => (
                        <a
                            key={doc.id}
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-sage/10 transition-colors group"
                        >
                            <FileText className="w-4 h-4 text-terracotta" />
                            <span className="text-sm text-forest group-hover:text-terracotta transition-colors flex-1">
                                {doc.name}
                            </span>
                            <ExternalLink className="w-3 h-3 text-forest/40" />
                        </a>
                    ))}

                    {linkedBoardTask && (
                        <a
                            href={`/work-management/boards/${linkedBoardTask}`}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-sage/10 transition-colors group"
                        >
                            <LinkIcon className="w-4 h-4 text-terracotta" />
                            <span className="text-sm text-forest group-hover:text-terracotta transition-colors flex-1">
                                Linked Board Task: {linkedBoardTask}
                            </span>
                        </a>
                    )}

                    {rescindedBy && (
                        <div className="flex items-center gap-2 p-2">
                            <LinkIcon className="w-4 h-4 text-red-900" />
                            <span className="text-sm text-red-900">
                                Rescinded by{" "}
                                <span className="underline">{rescindedBy}</span>
                            </span>
                        </div>
                    )}

                    {rescindingResolution && (
                        <div className="flex items-center gap-2 p-2">
                            <LinkIcon className="w-4 h-4 text-red-900" />
                            <span className="text-sm text-red-900">
                                Rescinds{" "}
                                <span className="underline">
                                    {rescindingResolution}
                                </span>
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
