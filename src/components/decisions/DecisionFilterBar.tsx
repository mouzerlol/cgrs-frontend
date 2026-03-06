"use client";

import { Search, X } from "lucide-react";
import { DecisionFilters, DecisionStatusFilter } from "@/hooks/useDecisionFilters";
import { PORTFOLIO_OPTIONS, SORT_OPTIONS, STATUS_FILTERS } from "@/lib/decisions";
import FilterDropdown from "@/components/work-management/FilterDropdown";

interface DecisionFilterBarProps {
    filters: DecisionFilters;
    setFilter: <K extends keyof DecisionFilters>(category: K, value: DecisionFilters[K]) => void;
    clearFilters: () => void;
    hasActiveFilters: boolean;
    availablePortfolios: string[];
    className?: string;
}

const statusColors: Record<string, string> = {
    all: "bg-forest/40",
    open: "bg-amber-500",
    completed: "bg-green-500",
    overdue: "bg-red-500",
    not_carried: "bg-gray-500",
    rescinded: "bg-red-900",
};

export default function DecisionFilterBar({
    filters,
    setFilter,
    clearFilters,
    hasActiveFilters,
    availablePortfolios,
    className = "",
}: DecisionFilterBarProps) {
    const portfolioOptions = PORTFOLIO_OPTIONS.filter((p) =>
        availablePortfolios.includes(p.value)
    ).map((p) => ({ label: p.label, value: p.value }));

    return (
        <div className={`flex flex-col gap-3 ${className}`}>
            <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forest/40" />
                <input
                    type="text"
                    placeholder="Search motions, titles, owners..."
                    value={filters.searchQuery}
                    onChange={(e) => setFilter("searchQuery", e.target.value)}
                    className="w-full pl-10 pr-8 py-2.5 rounded-lg border border-sage/20 bg-white text-forest placeholder:text-forest/40 focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta/30 transition-all"
                />
                {filters.searchQuery && (
                    <button
                        onClick={() => setFilter("searchQuery", "")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-sage/10 rounded-full transition-colors"
                        aria-label="Clear search"
                    >
                        <X className="w-3.5 h-3.5 text-forest/60" />
                    </button>
                )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    {STATUS_FILTERS.map((status) => (
                        <button
                            key={status.id}
                            onClick={() =>
                                setFilter(
                                    "statusFilter",
                                    status.id as DecisionStatusFilter
                                )
                            }
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                filters.statusFilter === status.id
                                    ? "bg-terracotta/10 text-terracotta border border-terracotta/30"
                                    : "bg-white text-forest/60 border border-sage/20 hover:border-sage/40"
                            }`}
                        >
                            {status.color && (
                                <span
                                    className={`w-2 h-2 rounded-full ${
                                        statusColors[status.id] || "bg-gray-400"
                                    }`}
                                />
                            )}
                            {status.label}
                        </button>
                    ))}
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="text-xs font-medium text-terracotta hover:underline"
                        >
                            Clear filters
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {portfolioOptions.length > 0 && (
                        <FilterDropdown
                            label="Portfolio"
                            options={portfolioOptions}
                            selectedValues={filters.portfolioFilter}
                            onChange={(values) =>
                                setFilter("portfolioFilter", values)
                            }
                            variant="outline"
                            size="sm"
                        />
                    )}
                    <select
                        value={filters.sortBy}
                        onChange={(e) =>
                            setFilter(
                                "sortBy",
                                e.target.value as DecisionFilters["sortBy"]
                            )
                        }
                        className="px-3 py-2 text-sm rounded-lg border border-sage/20 bg-white text-forest focus:outline-none focus:ring-2 focus:ring-terracotta/30 cursor-pointer"
                    >
                        {SORT_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}
