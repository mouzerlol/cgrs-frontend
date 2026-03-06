"use client";

import { useState, useMemo } from "react";
import WorkManagementNavBar from "@/components/work-management/WorkManagementNavBar";
import GovernanceDashboard from "@/components/decisions/GovernanceDashboard";
import DecisionFilterBar from "@/components/decisions/DecisionFilterBar";
import ResolutionList from "@/components/decisions/ResolutionList";
import ResolutionDetailPanel from "@/components/decisions/ResolutionDetailPanel";
import CreateResolutionModal from "@/components/decisions/CreateResolutionModal";
import Button from "@/components/ui/Button";
import { Resolution } from "@/types/decisions";
import { useDecisionFilters } from "@/hooks/useDecisionFilters";
import decisionsData from "@/data/decisions.json";
import membersData from "@/data/work-management.json";

const resolutions = decisionsData.resolutions as Resolution[];
const members = membersData.members as { id: string; name: string; avatar: string; role: string }[];

export default function DecisionsPage() {
    const [selectedResolutionId, setSelectedResolutionId] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const memberOptions = useMemo(
        () => members.map((m) => ({ label: m.name, value: m.id })),
        []
    );

    const memberMap = useMemo(
        () => new Map(members.map((m) => [m.id, m.name])),
        []
    );

    const availablePortfolios = useMemo(() => {
        const portfolios = new Set<string>();
        resolutions.forEach((r) => r.portfolioTags.forEach((t) => portfolios.add(t)));
        return Array.from(portfolios);
    }, []);

    const {
        filters,
        setFilter,
        clearFilters,
        filteredResolutions,
        hasActiveFilters,
    } = useDecisionFilters(resolutions, members);

    const selectedResolution = selectedResolutionId
        ? resolutions.find((r) => r.id === selectedResolutionId) || null
        : null;

    const handleSelectResolution = (resolution: Resolution) => {
        setSelectedResolutionId(resolution.id);
    };

    const handleCloseDetail = () => {
        setSelectedResolutionId(null);
    };

    const handleUpdateResolution = (updatedResolution: Resolution) => {
        const index = resolutions.findIndex((r) => r.id === updatedResolution.id);
        if (index !== -1) {
            resolutions[index] = updatedResolution;
        }
    };

    const handleCreateResolution = (newResolution: Resolution) => {
        resolutions.push(newResolution);
    };

    const handleCopyLink = (resolution: Resolution) => {
        const url = `${window.location.origin}/work-management/decisions/${resolution.id}`;
        navigator.clipboard.writeText(url);
    };

    const handleCopyEmail = (resolution: Resolution) => {
        const ownerName = resolution.actionOwner
            ? memberMap.get(resolution.actionOwner) || "Unknown"
            : "Unassigned";

        const voteText =
            resolution.votesAgainst === 0 && resolution.votesAbstain === 0
                ? "Unanimous"
                : `${resolution.votesFor} For / ${resolution.votesAgainst} Against / ${resolution.votesAbstain} Abstain`;

        const text = `
──────────────────────────────────────
CGRS — Official Committee Resolution
──────────────────────────────────────

Reference:  ${resolution.id}
Date:       ${resolution.meetingDate}
Decision:   ${resolution.title}

Motion:     "${resolution.motionText}"

Outcome:    ${resolution.outcome === "carried" ? "CARRIED" : "NOT CARRIED"} (${voteText})
Owner:      ${ownerName}
Deadline:   ${resolution.deadline || "—"}
Status:     ${resolution.status}

View online: ${window.location.origin}/work-management/decisions/${resolution.id}

──────────────────────────────────────
Coronation Gardens Residents Society
Committee Decision Register
──────────────────────────────────────
        `.trim();

        navigator.clipboard.writeText(text);
    };

    const handleExportPdf = (resolution: Resolution) => {
        alert("PDF export coming soon");
    };

    return (
        <div className="h-full w-full overflow-hidden flex flex-col bg-bone">
            <WorkManagementNavBar
                title="Decision Register"
                showBackButton
                backHref="/work-management"
                backLabel="Work Management"
                actions={[
                    {
                        label: "+ New Resolution",
                        onClick: () => setIsCreateModalOpen(true),
                        variant: "primary",
                    },
                ]}
            />

            <main className="flex-1 min-h-0 overflow-y-auto">
                <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8 space-y-0">
                    <div className="pb-8">
                        <GovernanceDashboard resolutions={resolutions} />
                    </div>

                    <div className="bg-sage-light -mx-4 md:-mx-6 lg:-mx-8 mt-6 rounded-[10px] px-4 md:px-6 lg:px-8 pt-6 pb-8">
                        <DecisionFilterBar
                            filters={filters}
                            setFilter={setFilter}
                            clearFilters={clearFilters}
                            hasActiveFilters={hasActiveFilters}
                            availablePortfolios={availablePortfolios}
                        />

                        <div className="flex flex-col lg:flex-row gap-6 mt-6">
                            <div className="flex-1 min-h-0">
                                <ResolutionList
                                    resolutions={filteredResolutions}
                                    memberMap={memberMap}
                                    onSelectResolution={handleSelectResolution}
                                    onCopyLink={handleCopyLink}
                                    onCopyEmail={handleCopyEmail}
                                    onExportPdf={handleExportPdf}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <ResolutionDetailPanel
                resolution={selectedResolution}
                isOpen={!!selectedResolutionId}
                onClose={handleCloseDetail}
                memberMap={memberMap}
                onUpdateResolution={handleUpdateResolution}
            />

            <CreateResolutionModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateResolution}
                memberOptions={memberOptions}
                existingResolutions={resolutions}
            />
        </div>
    );
}
