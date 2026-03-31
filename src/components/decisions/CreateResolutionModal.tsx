"use client";

import { useState } from "react";
import { Resolution, ResolutionOutcome, ResolutionStatus } from "@/types/decisions";
import { PORTFOLIO_OPTIONS } from "@/lib/decisions";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { FormInput } from "@/components/ui/FormInput";
import { FormTextarea } from "@/components/ui/FormTextarea";
import { FormSelect } from "@/components/ui/FormSelect";

interface CreateResolutionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (resolution: Resolution) => void;
    memberOptions: { label: string; value: string }[];
    existingResolutions: Resolution[];
}

interface FormData {
    title: string;
    meetingDate: string;
    mover: string;
    seconder: string;
    membersPresent: string;
    motionText: string;
    votesFor: string;
    votesAgainst: string;
    votesAbstain: string;
    outcome: ResolutionOutcome | "";
    actionOwner: string;
    deadline: string;
    financialCommitment: string;
    financialGst: "plus_gst" | "incl_gst" | "";
    portfolioTags: string[];
}

const initialFormData: FormData = {
    title: "",
    meetingDate: new Date().toISOString().split("T")[0],
    mover: "",
    seconder: "",
    membersPresent: "",
    motionText: "",
    votesFor: "0",
    votesAgainst: "0",
    votesAbstain: "0",
    outcome: "",
    actionOwner: "",
    deadline: "",
    financialCommitment: "",
    financialGst: "plus_gst",
    portfolioTags: [],
};

export default function CreateResolutionModal({
    isOpen,
    onClose,
    onSubmit,
    memberOptions,
    existingResolutions,
}: CreateResolutionModalProps) {
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showExecutionSection, setShowExecutionSection] = useState(false);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = "Title is required";
        }
        if (!formData.meetingDate) {
            newErrors.meetingDate = "Meeting date is required";
        }
        if (!formData.mover) {
            newErrors.mover = "Mover is required";
        }
        if (!formData.seconder) {
            newErrors.seconder = "Seconder is required";
        }
        if (formData.mover && formData.seconder && formData.mover === formData.seconder) {
            newErrors.seconder = "Seconder must be different from mover";
        }
        if (!formData.membersPresent) {
            newErrors.membersPresent = "Members present is required";
        }
        if (!formData.motionText.trim()) {
            newErrors.motionText = "Motion text is required";
        }
        if (!formData.outcome) {
            newErrors.outcome = "Outcome is required";
        }

        const votesFor = parseInt(formData.votesFor) || 0;
        const votesAgainst = parseInt(formData.votesAgainst) || 0;
        const votesAbstain = parseInt(formData.votesAbstain) || 0;
        const membersPresent = parseInt(formData.membersPresent) || 0;

        if (votesFor + votesAgainst + votesAbstain > membersPresent) {
            newErrors.votesFor = "Vote total cannot exceed members present";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        const year = new Date(formData.meetingDate).getFullYear();
        const existingThisYear = existingResolutions.filter(
            (r) => r.id.startsWith(`RES-${year}`)
        );
        const sequence = existingThisYear.length + 1;
        const newId = `RES-${year}-${sequence.toString().padStart(3, "0")}`;

        const newResolution: Resolution = {
            id: newId,
            title: formData.title,
            meetingDate: formData.meetingDate,
            mover: formData.mover,
            seconder: formData.seconder,
            membersPresent: parseInt(formData.membersPresent) || 0,
            motionText: formData.motionText,
            votesFor: parseInt(formData.votesFor) || 0,
            votesAgainst: parseInt(formData.votesAgainst) || 0,
            votesAbstain: parseInt(formData.votesAbstain) || 0,
            outcome: formData.outcome as ResolutionOutcome,
            status: formData.outcome === "carried" ? "active" : "completed",
            actionOwner: formData.actionOwner || null,
            deadline: formData.deadline || null,
            financialCommitment: formData.financialCommitment
                ? parseFloat(formData.financialCommitment)
                : null,
            financialGst: formData.financialGst
                ? (formData.financialGst as "plus_gst" | "incl_gst")
                : null,
            portfolioTags: formData.portfolioTags,
            linkedBoardTask: null,
            rescindingResolution: null,
            rescindedBy: null,
            documents: [],
            activityLog: [
                {
                    timestamp: new Date().toISOString(),
                    actor: "system",
                    description: "Resolution created",
                    type: "creation",
                },
            ],
            createdAt: new Date().toISOString(),
            createdBy: formData.mover,
            locked: formData.outcome !== "",
        };

        onSubmit(newResolution);
        setFormData(initialFormData);
        onClose();
    };

    const updateField = (field: keyof FormData, value: string | string[]) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    const togglePortfolio = (value: string) => {
        setFormData((prev) => ({
            ...prev,
            portfolioTags: prev.portfolioTags.includes(value)
                ? prev.portfolioTags.filter((t) => t !== value)
                : [...prev.portfolioTags, value],
        }));
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="New Resolution"
            size="xl"
            position="center"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <h3 className="font-display text-sm font-semibold text-forest mb-3">
                        Header
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            label="Resolution Title *"
                            type="text"
                            value={formData.title}
                            onChange={(e) => updateField("title", e.target.value)}
                            placeholder="Short descriptor"
                            error={errors.title}
                        />
                        <FormInput
                            label="Meeting Date *"
                            type="date"
                            value={formData.meetingDate}
                            onChange={(e) => updateField("meetingDate", e.target.value)}
                            error={errors.meetingDate}
                        />
                    </div>
                </div>

                <div>
                    <h3 className="font-display text-sm font-semibold text-forest mb-3">
                        Governance
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormSelect
                            label="Mover *"
                            value={formData.mover}
                            onChange={(e) => updateField("mover", e.target.value)}
                            error={errors.mover}
                        >
                            <option value="">Select mover</option>
                            {memberOptions.map((m) => (
                                <option key={m.value} value={m.value}>
                                    {m.label}
                                </option>
                            ))}
                        </FormSelect>
                        <FormSelect
                            label="Seconder *"
                            value={formData.seconder}
                            onChange={(e) => updateField("seconder", e.target.value)}
                            error={errors.seconder}
                        >
                            <option value="">Select seconder</option>
                            {memberOptions.map((m) => (
                                <option key={m.value} value={m.value}>
                                    {m.label}
                                </option>
                            ))}
                        </FormSelect>
                        <FormInput
                            label="Members Present *"
                            type="number"
                            value={formData.membersPresent}
                            onChange={(e) =>
                                updateField("membersPresent", e.target.value)
                            }
                            error={errors.membersPresent}
                            min={0}
                        />
                    </div>
                </div>

                <div>
                    <h3 className="font-display text-sm font-semibold text-forest mb-3">
                        The Motion
                    </h3>
                    <FormTextarea
                        label="Motion Text *"
                        value={formData.motionText}
                        onChange={(e) => updateField("motionText", e.target.value)}
                        className="resize-none"
                        rows={3}
                        placeholder="That the committee..."
                        error={errors.motionText}
                    />
                </div>

                <div>
                    <h3 className="font-display text-sm font-semibold text-forest mb-3">
                        The Vote
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <FormInput
                            label="Votes For"
                            type="number"
                            value={formData.votesFor}
                            onChange={(e) => updateField("votesFor", e.target.value)}
                            error={errors.votesFor}
                            min={0}
                        />
                        <FormInput
                            label="Votes Against"
                            type="number"
                            value={formData.votesAgainst}
                            onChange={(e) =>
                                updateField("votesAgainst", e.target.value)
                            }
                            min={0}
                        />
                        <FormInput
                            label="Votes Abstain"
                            type="number"
                            value={formData.votesAbstain}
                            onChange={(e) =>
                                updateField("votesAbstain", e.target.value)
                            }
                            min={0}
                        />
                        <FormSelect
                            label="Outcome *"
                            value={formData.outcome}
                            onChange={(e) => {
                                updateField("outcome", e.target.value);
                                setShowExecutionSection(e.target.value === "carried");
                            }}
                            error={errors.outcome}
                        >
                            <option value="">Select outcome</option>
                            <option value="carried">Carried</option>
                            <option value="not_carried">Not Carried</option>
                        </FormSelect>
                    </div>
                </div>

                {showExecutionSection && (
                    <div>
                        <h3 className="font-display text-sm font-semibold text-forest mb-3">
                            Execution
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormSelect
                                label="Action Owner"
                                value={formData.actionOwner}
                                onChange={(e) =>
                                    updateField("actionOwner", e.target.value)
                                }
                            >
                                <option value="">Select owner</option>
                                {memberOptions.map((m) => (
                                    <option key={m.value} value={m.value}>
                                        {m.label}
                                    </option>
                                ))}
                            </FormSelect>
                            <FormInput
                                label="Deadline"
                                type="date"
                                value={formData.deadline}
                                onChange={(e) =>
                                    updateField("deadline", e.target.value)
                                }
                            />
                            <FormInput
                                label="Financial Commitment"
                                type="number"
                                value={formData.financialCommitment}
                                onChange={(e) =>
                                    updateField("financialCommitment", e.target.value)
                                }
                                placeholder="0.00"
                                min={0}
                                step={0.01}
                            />
                            <FormSelect
                                label="GST"
                                value={formData.financialGst}
                                onChange={(e) =>
                                    updateField(
                                        "financialGst",
                                        e.target.value as "plus_gst" | "incl_gst" | ""
                                    )
                                }
                            >
                                <option value="plus_gst">+ GST</option>
                                <option value="incl_gst">Incl. GST</option>
                            </FormSelect>
                        </div>
                        <div className="mt-4">
                            <label className="block text-xs font-medium text-forest/70 mb-2">
                                Portfolio Tags
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {PORTFOLIO_OPTIONS.map((p) => (
                                    <button
                                        key={p.value}
                                        type="button"
                                        onClick={() => togglePortfolio(p.value)}
                                        className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                                            formData.portfolioTags.includes(p.value)
                                                ? "bg-terracotta text-white border-terracotta"
                                                : "bg-white text-forest/60 border-sage/20 hover:border-sage/40"
                                        }`}
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-sage/20">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="primary">
                        Save Resolution
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
