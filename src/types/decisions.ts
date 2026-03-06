export type ResolutionOutcome = "carried" | "not_carried";
export type ResolutionStatus = "draft" | "active" | "completed" | "overdue" | "rescinded";
export type FinancialGstType = "plus_gst" | "incl_gst";

export interface ResolutionActivity {
    timestamp: string;
    actor: string;
    description: string;
    type: "manual" | "status_change" | "reminder" | "creation";
}

export interface ResolutionDocument {
    id: string;
    name: string;
    type: "pdf" | "docx" | "image";
    url: string;
}

export interface Resolution {
    id: string;
    title: string;
    meetingDate: string;
    mover: string;
    seconder: string;
    membersPresent: number;
    motionText: string;
    votesFor: number;
    votesAgainst: number;
    votesAbstain: number;
    outcome: ResolutionOutcome;
    status: ResolutionStatus;
    actionOwner: string | null;
    deadline: string | null;
    financialCommitment: number | null;
    financialGst: FinancialGstType | null;
    portfolioTags: string[];
    linkedBoardTask: string | null;
    rescindingResolution: string | null;
    rescindedBy: string | null;
    documents: ResolutionDocument[];
    activityLog: ResolutionActivity[];
    createdAt: string;
    createdBy: string;
    locked: boolean;
}
