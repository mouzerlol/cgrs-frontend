"use client";

import { useState } from "react";
import { Resolution } from "@/types/decisions";
import Modal from "@/components/ui/Modal";
import StatusBanner from "./StatusBanner";
import ChainOfCommand from "./ChainOfCommand";
import MotionBlockquote from "./MotionBlockquote";
import ExecutionSection from "./ExecutionSection";
import ActivityFeed from "./ActivityFeed";
import ReferencesSection from "./ReferencesSection";
import QuickActions from "./QuickActions";
import { getDerivedStatus } from "@/lib/decisions";

interface ResolutionDetailPanelProps {
    resolution: Resolution | null;
    isOpen: boolean;
    onClose: () => void;
    memberMap: Map<string, string>;
    onUpdateResolution: (updatedResolution: Resolution) => void;
}

export default function ResolutionDetailPanel({
    resolution,
    isOpen,
    onClose,
    memberMap,
    onUpdateResolution,
}: ResolutionDetailPanelProps) {
    if (!resolution) return null;

    const derivedStatus = getDerivedStatus(
        resolution.outcome,
        resolution.status,
        resolution.deadline
    );

    const moverName = memberMap.get(resolution.mover) || "Unknown";
    const seconderName = resolution.seconder
        ? memberMap.get(resolution.seconder) || "Unknown"
        : "—";
    const ownerName = resolution.actionOwner
        ? memberMap.get(resolution.actionOwner) || null
        : null;

    const handleAddActivity = (description: string) => {
        const newActivity = {
            timestamp: new Date().toISOString(),
            actor: "m1",
            description,
            type: "manual" as const,
        };

        onUpdateResolution({
            ...resolution,
            activityLog: [newActivity, ...resolution.activityLog],
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} position="right" size="2xl">
            <div className="flex flex-col h-full bg-sage-light/50">
                <StatusBanner
                    status={derivedStatus}
                    outcome={resolution.outcome}
                    rescindedBy={resolution.rescindedBy}
                    rescindingResolution={resolution.rescindingResolution}
                />

                <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="font-mono text-sm font-bold text-terracotta">
                                {resolution.id}
                            </span>
                            <span className="text-forest/40">•</span>
                            <span className="text-forest/60 text-sm">
                                {resolution.meetingDate}
                            </span>
                        </div>
                        <h2 className="font-display text-2xl font-semibold text-forest leading-tight">
                            {resolution.title}
                        </h2>
                    </div>

                    <ChainOfCommand
                        resolution={resolution}
                        moverName={moverName}
                        seconderName={seconderName}
                    />

                    {resolution.motionText && (
                        <MotionBlockquote
                            motionText={resolution.motionText}
                            locked={resolution.locked}
                        />
                    )}

                    {resolution.outcome === "carried" && (
                        <ExecutionSection
                            resolution={resolution}
                            ownerName={ownerName}
                        />
                    )}

                    <ActivityFeed
                        activityLog={resolution.activityLog}
                        memberMap={memberMap}
                        onAddActivity={handleAddActivity}
                    />

                    <ReferencesSection
                        documents={resolution.documents}
                        linkedBoardTask={resolution.linkedBoardTask}
                        rescindedBy={resolution.rescindedBy}
                        rescindingResolution={resolution.rescindingResolution}
                    />
                </div>

                <div className="p-4 border-t border-sage/20 bg-white/50">
                    <QuickActions resolution={resolution} memberMap={memberMap} />
                </div>
            </div>
        </Modal>
    );
}
