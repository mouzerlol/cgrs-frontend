import { ResolutionStatus, ResolutionOutcome } from "@/types/decisions";

export const STATUS_CONFIG: Record<
    ResolutionStatus,
    { label: string; color: string; bg: string; dot: string }
> = {
    draft: {
        label: "Draft",
        color: "text-forest/60",
        bg: "bg-forest/5",
        dot: "bg-forest/40",
    },
    active: {
        label: "In Progress",
        color: "text-amber-700",
        bg: "bg-amber-500/10",
        dot: "bg-amber-500",
    },
    completed: {
        label: "Completed",
        color: "text-green-700",
        bg: "bg-green-500/10",
        dot: "bg-green-500",
    },
    overdue: {
        label: "Overdue",
        color: "text-red-700",
        bg: "bg-red-500/10",
        dot: "bg-red-500",
    },
    rescinded: {
        label: "Rescinded",
        color: "text-red-900",
        bg: "bg-red-900/10",
        dot: "bg-red-900",
    },
};

export const OUTCOME_CONFIG: Record<ResolutionOutcome, { label: string; color: string }> = {
    carried: { label: "Carried", color: "text-green-700" },
    not_carried: { label: "Not Carried", color: "text-forest/60" },
};

export const PORTFOLIO_OPTIONS = [
    { label: "Infrastructure", value: "infrastructure" },
    { label: "Safety", value: "safety" },
    { label: "Finance", value: "finance" },
    { label: "Legal", value: "legal" },
    { label: "Operations", value: "operations" },
    { label: "Governance", value: "governance" },
    { label: "Community", value: "community" },
];

export const SORT_OPTIONS = [
    { label: "Newest First", value: "newest" },
    { label: "Oldest First", value: "oldest" },
    { label: "Deadline (Soonest)", value: "deadline" },
    { label: "Owner (A–Z)", value: "owner" },
];

export const STATUS_FILTERS = [
    { id: "all", label: "All", color: null },
    { id: "open", label: "Open Actions", color: "amber" },
    { id: "completed", label: "Completed", color: "green" },
    { id: "overdue", label: "Overdue", color: "red" },
    { id: "not_carried", label: "Not Carried", color: "gray" },
    { id: "rescinded", label: "Rescindedred-", color: "900" },
];

export function formatCurrency(amount: number | null, gstType: string | null): string {
    if (amount === null) return "";
    const formatted = amount.toLocaleString("en-NZ");
    const gstLabel = gstType === "plus_gst" ? "+GST" : "incl. GST";
    return `$${formatted} ${gstLabel}`;
}

export function formatDate(dateString: string | null): string {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" });
}

export function isOverdue(deadline: string | null, status: ResolutionStatus): boolean {
    if (!deadline || status === "completed" || status === "rescinded") return false;
    return new Date(deadline) < new Date();
}

export function getDerivedStatus(
    outcome: ResolutionOutcome,
    status: ResolutionStatus,
    deadline: string | null
): ResolutionStatus {
    if (status === "draft" || status === "rescinded") return status;
    if (status === "completed") return "completed";
    if (isOverdue(deadline, status)) return "overdue";
    return "active";
}

export function generateResolutionId(year: number, sequence: number): string {
    return `RES-${year}-${sequence.toString().padStart(3, "0")}`;
}

export function getVoteTallyText(
    votesFor: number,
    votesAgainst: number,
    votesAbstain: number
): string {
    if (votesAgainst === 0 && votesAbstain === 0) {
        return "Unanimous";
    }
    return `${votesFor} For / ${votesAgainst} Against / ${votesAbstain} Abstain`;
}
