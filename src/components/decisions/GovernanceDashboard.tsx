"use client";

import { Resolution } from "@/types/decisions";
import { Card } from "@/components/design-system/Card";
import { getDerivedStatus } from "@/lib/decisions";

interface GovernanceDashboardProps {
    resolutions: Resolution[];
    className?: string;
}

export default function GovernanceDashboard({
    resolutions,
    className = "",
}: GovernanceDashboardProps) {
    const carriedResolutions = resolutions.filter(
        (r) => r.outcome === "carried" && !r.locked === false
    );

    const openResolutions = carriedResolutions.filter((r) => {
        const status = getDerivedStatus(r.outcome, r.status, r.deadline);
        return r.outcome === "carried" && status !== "completed";
    });

    const openCount = openResolutions.length;
    let openCountColor = "text-green-600";
    if (openCount > 10) {
        openCountColor = "text-red-600";
    } else if (openCount > 5) {
        openCountColor = "text-amber-600";
    }

    const completedResolutions = carriedResolutions.filter((r) => {
        const status = getDerivedStatus(r.outcome, r.status, r.deadline);
        return status === "completed";
    });

    const complianceRate =
        carriedResolutions.length > 0
            ? Math.round(
                  (completedResolutions.length / carriedResolutions.length) * 100
              )
            : 100;

    let complianceColor = "text-green-600";
    if (complianceRate < 70) {
        complianceColor = "text-red-600";
    } else if (complianceRate < 90) {
        complianceColor = "text-amber-600";
    }

    const orphanResolutions = carriedResolutions.filter(
        (r) => !r.actionOwner || !r.deadline
    );
    const orphanCount = orphanResolutions.length;

    return (
        <div className={`${className}`}>
            <div className="flex overflow-x-auto gap-2 pb-2 snap-x snap-mandatory md:grid md:grid-cols-3 md:gap-3 md:pb-0">
                <div className="flex-shrink-0 w-64 md:w-full md:min-w-0 snap-center">
                    <Card hoverable className="p-4 h-full">
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-forest/5 text-forest/70 ${openCountColor}`}>
                                <span className={`w-2 h-2 rounded-full ${openCountColor.replace("text-", "bg-").replace("-600", "-500")}`} />
                                Open Actions
                            </span>
                        </div>
                        <div className="font-display text-3xl font-bold text-forest">
                            {openCount}
                        </div>
                        <div className={`text-sm font-semibold mt-1 ${openCountColor}`}>
                            {openCount <= 5
                                ? "On track"
                                : openCount <= 10
                                ? "Monitor"
                                : "Needs attention"}
                        </div>
                    </Card>
                </div>

                <div className="flex-shrink-0 w-64 md:w-full md:min-w-0 snap-center">
                    <Card hoverable className="p-4 h-full">
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-forest/5 text-forest/70 ${complianceColor}`}>
                                <span className={`w-2 h-2 rounded-full ${complianceColor.replace("text-", "bg-").replace("-600", "-500")}`} />
                                Compliance Rate
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative w-10 h-10">
                                <svg className="w-10 h-10 -rotate-90">
                                    <circle
                                        cx="20"
                                        cy="20"
                                        r="16"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        fill="none"
                                        className="text-sage/20"
                                    />
                                    <circle
                                        cx="20"
                                        cy="20"
                                        r="16"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        fill="none"
                                        strokeDasharray={`${complianceRate} 100`}
                                        className={complianceColor}
                                    />
                                </svg>
                                <span
                                    className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${complianceColor}`}
                                >
                                    {complianceRate}%
                                </span>
                            </div>
                        </div>
                        <div className="text-xs text-forest/60 mt-1">
                            Carried resolutions completed
                        </div>
                    </Card>
                </div>

                <div className="flex-shrink-0 w-64 md:w-full md:min-w-0 snap-center">
                    <Card hoverable className="p-4 h-full">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-red-500/10 text-red-700">
                                <span className="w-2 h-2 rounded-full bg-red-500" />
                                Orphan Alert
                            </span>
                        </div>
                        <div className="font-display text-3xl font-bold text-forest">
                            {orphanCount}
                        </div>
                        <div className="text-xs text-forest/60 mt-1">
                            {orphanCount === 1
                                ? "No owner or deadline"
                                : "Need owner or deadline"}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
