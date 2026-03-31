"use client";

import { useMemo } from "react";
import { Resolution } from "@/types/decisions";
import { Card } from "@/components/design-system/Card";
import { getDerivedStatus } from "@/lib/decisions";
import { Skeleton } from "@/components/ui/Skeleton";
import { AnimatePresence, motion } from "framer-motion";

interface GovernanceDashboardProps {
    resolutions: Resolution[];
    className?: string;
    isLoading?: boolean;
}

function thresholdTextColor(value: number, lowGood: boolean): string {
    if (lowGood) {
        if (value <= 5) return "text-green-600";
        if (value <= 10) return "text-amber-600";
        return "text-red-600";
    }
    if (value >= 80) return "text-green-600";
    if (value >= 50) return "text-amber-600";
    return "text-red-600";
}

export default function GovernanceDashboard({
    resolutions,
    className = "",
    isLoading = false,
}: GovernanceDashboardProps) {
    const { openCount, openCountColor, complianceRate, complianceColor, orphanCount } = useMemo(() => {
        let open = 0;
        let orphans = 0;
        const carried = resolutions.filter((r) => r.outcome === "carried");
        let carriedCompleted = 0;

        for (const r of resolutions) {
            const derived = getDerivedStatus(r.outcome, r.status, r.deadline);
            if (r.outcome === "carried" && derived !== "completed") {
                open += 1;
                if (!r.actionOwner || !r.deadline) orphans += 1;
            }
            if (r.outcome === "carried" && derived === "completed") carriedCompleted += 1;
        }

        const rate = carried.length === 0 ? 100 : Math.round((carriedCompleted / carried.length) * 100);

        return {
            openCount: open,
            openCountColor: thresholdTextColor(open, true),
            complianceRate: rate,
            complianceColor: thresholdTextColor(rate, false),
            orphanCount: orphans,
        };
    }, [resolutions]);

    return (
        <div className={`${className}`}>
            <AnimatePresence mode="wait">
                {isLoading ? (
                    <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="flex overflow-x-auto gap-2 pb-2 snap-x snap-mandatory md:grid md:grid-cols-3 md:gap-3 md:pb-0">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex-shrink-0 w-64 md:w-full md:min-w-0 snap-center">
                                <Card className="p-4 h-full">
                                    <div className="mb-2">
                                        <Skeleton className="h-6 w-24 rounded-full" />
                                    </div>
                                    <Skeleton className="h-10 w-16 mb-2" />
                                    <Skeleton className="h-4 w-32" />
                                </Card>
                            </div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="flex overflow-x-auto gap-2 pb-2 snap-x snap-mandatory md:grid md:grid-cols-3 md:gap-3 md:pb-0">
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
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
