import { useState, useMemo, useRef, useCallback } from "react";
import { Resolution } from "@/types/decisions";
import { getDerivedStatus } from "@/lib/decisions";

export type DecisionStatusFilter = "all" | "open" | "completed" | "overdue" | "not_carried" | "rescinded";

export interface DecisionFilters {
    searchQuery: string;
    statusFilter: DecisionStatusFilter;
    portfolioFilter: string[];
    sortBy: "newest" | "oldest" | "deadline" | "owner";
}

export function useDecisionFilters(
    resolutions: Resolution[],
    members: { id: string; name: string }[]
) {
    const [filters, setFilters] = useState<DecisionFilters>({
        searchQuery: "",
        statusFilter: "all",
        portfolioFilter: [],
        sortBy: "newest",
    });

    const [debouncedSearch, setDebouncedSearch] = useState(filters.searchQuery);
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

    const handleSearchChange = useCallback((query: string) => {
        setFilters((prev) => ({ ...prev, searchQuery: query }));

        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        debounceTimeout.current = setTimeout(() => {
            setDebouncedSearch(query);
        }, 300);
    }, []);

    const filteredResolutions = useMemo(() => {
        const memberMap = new Map(members.map((m) => [m.id, m.name]));

        return resolutions
            .filter((resolution) => {
                const searchLower = debouncedSearch.toLowerCase();
                const ownerName = resolution.actionOwner
                    ? memberMap.get(resolution.actionOwner) || ""
                    : "";

                const matchesSearch =
                    !debouncedSearch ||
                    resolution.title.toLowerCase().includes(searchLower) ||
                    resolution.motionText.toLowerCase().includes(searchLower) ||
                    ownerName.toLowerCase().includes(searchLower);

                const derivedStatus = getDerivedStatus(
                    resolution.outcome,
                    resolution.status,
                    resolution.deadline
                );

                const matchesStatus =
                    filters.statusFilter === "all" ||
                    (filters.statusFilter === "open" &&
                        resolution.outcome === "carried" &&
                        derivedStatus !== "completed") ||
                    (filters.statusFilter === "completed" &&
                        derivedStatus === "completed") ||
                    (filters.statusFilter === "overdue" &&
                        derivedStatus === "overdue") ||
                    (filters.statusFilter === "not_carried" &&
                        resolution.outcome === "not_carried") ||
                    (filters.statusFilter === "rescinded" &&
                        derivedStatus === "rescinded");

                const matchesPortfolio =
                    filters.portfolioFilter.length === 0 ||
                    resolution.portfolioTags.some((tag) =>
                        filters.portfolioFilter.includes(tag)
                    );

                return matchesSearch && matchesStatus && matchesPortfolio;
            })
            .sort((a, b) => {
                switch (filters.sortBy) {
                    case "newest":
                        return (
                            new Date(b.meetingDate).getTime() -
                            new Date(a.meetingDate).getTime()
                        );
                    case "oldest":
                        return (
                            new Date(a.meetingDate).getTime() -
                            new Date(b.meetingDate).getTime()
                        );
                    case "deadline":
                        if (!a.deadline && !b.deadline) return 0;
                        if (!a.deadline) return 1;
                        if (!b.deadline) return -1;
                        return (
                            new Date(a.deadline).getTime() -
                            new Date(b.deadline).getTime()
                        );
                    case "owner":
                        const nameA = a.actionOwner
                            ? memberMap.get(a.actionOwner) || ""
                            : "~";
                        const nameB = b.actionOwner
                            ? memberMap.get(b.actionOwner) || ""
                            : "~";
                        return nameA.localeCompare(nameB);
                    default:
                        return 0;
                }
            });
    }, [resolutions, filters, debouncedSearch, members]);

    const setFilter = useCallback(
        <K extends keyof DecisionFilters>(category: K, value: DecisionFilters[K]) => {
            if (category === "searchQuery") {
                handleSearchChange(value as string);
            } else {
                setFilters((prev) => ({ ...prev, [category]: value }));
            }
        },
        [handleSearchChange]
    );

    const clearFilters = useCallback(() => {
        setFilters({
            searchQuery: "",
            statusFilter: "all",
            portfolioFilter: [],
            sortBy: "newest",
        });
        setDebouncedSearch("");
    }, []);

    const hasActiveFilters =
        filters.statusFilter !== "all" ||
        filters.portfolioFilter.length > 0 ||
        filters.searchQuery !== "";

    return {
        filters,
        setFilter,
        clearFilters,
        filteredResolutions,
        hasActiveFilters,
    };
}
