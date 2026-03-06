"use client";

import { useState } from "react";
import { Resolution, ResolutionOutcome, ResolutionStatus } from "@/types/decisions";
import { PORTFOLIO_OPTIONS } from "@/lib/decisions";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

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
                        <div>
                            <label className="block text-xs font-medium text-forest/70 mb-1">
                                Resolution Title *
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => updateField("title", e.target.value)}
                                className={`w-full px-3 py-2 rounded-lg border ${
                                    errors.title ? "border-red-500" : "border-sage/20"
                                } bg-white text-forest focus:outline-none focus:ring-2 focus:ring-terracotta/30`}
                                placeholder="Short descriptor"
                            />
                            {errors.title && (
                                <p className="text-xs text-red-500 mt-1">{errors.title}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-forest/70 mb-1">
                                Meeting Date *
                            </label>
                            <input
                                type="date"
                                value={formData.meetingDate}
                                onChange={(e) => updateField("meetingDate", e.target.value)}
                                className={`w-full px-3 py-2 rounded-lg border ${
                                    errors.meetingDate ? "border-red-500" : "border-sage/20"
                                } bg-white text-forest focus:outline-none focus:ring-2 focus:ring-terracotta/30`}
                            />
                            {errors.meetingDate && (
                                <p className="text-xs text-red-500 mt-1">
                                    {errors.meetingDate}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="font-display text-sm font-semibold text-forest mb-3">
                        Governance
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-forest/70 mb-1">
                                Mover *
                            </label>
                            <select
                                value={formData.mover}
                                onChange={(e) => updateField("mover", e.target.value)}
                                className={`w-full px-3 py-2 rounded-lg border ${
                                    errors.mover ? "border-red-500" : "border-sage/20"
                                } bg-white text-forest focus:outline-none focus:ring-2 focus:ring-terracotta/30`}
                            >
                                <option value="">Select mover</option>
                                {memberOptions.map((m) => (
                                    <option key={m.value} value={m.value}>
                                        {m.label}
                                    </option>
                                ))}
                            </select>
                            {errors.mover && (
                                <p className="text-xs text-red-500 mt-1">{errors.mover}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-forest/70 mb-1">
                                Seconder *
                            </label>
                            <select
                                value={formData.seconder}
                                onChange={(e) => updateField("seconder", e.target.value)}
                                className={`w-full px-3 py-2 rounded-lg border ${
                                    errors.seconder ? "border-red-500" : "border-sage/20"
                                } bg-white text-forest focus:outline-none focus:ring-2 focus:ring-terracotta/30`}
                            >
                                <option value="">Select seconder</option>
                                {memberOptions.map((m) => (
                                    <option key={m.value} value={m.value}>
                                        {m.label}
                                    </option>
                                ))}
                            </select>
                            {errors.seconder && (
                                <p className="text-xs text-red-500 mt-1">{errors.seconder}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-forest/70 mb-1">
                                Members Present *
                            </label>
                            <input
                                type="number"
                                value={formData.membersPresent}
                                onChange={(e) =>
                                    updateField("membersPresent", e.target.value)
                                }
                                className={`w-full px-3 py-2 rounded-lg border ${
                                    errors.membersPresent
                                        ? "border-red-500"
                                        : "border-sage/20"
                                } bg-white text-forest focus:outline-none focus:ring-2 focus:ring-terracotta/30`}
                                min="0"
                            />
                            {errors.membersPresent && (
                                <p className="text-xs text-red-500 mt-1">
                                    {errors.membersPresent}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="font-display text-sm font-semibold text-forest mb-3">
                        The Motion
                    </h3>
                    <div>
                        <label className="block text-xs font-medium text-forest/70 mb-1">
                            Motion Text *
                        </label>
                        <textarea
                            value={formData.motionText}
                            onChange={(e) => updateField("motionText", e.target.value)}
                            className={`w-full px-3 py-2 rounded-lg border ${
                                errors.motionText ? "border-red-500" : "border-sage/20"
                            } bg-white text-forest focus:outline-none focus:ring-2 focus:ring-terracotta/30 resize-none`}
                            rows={3}
                            placeholder="That the committee..."
                        />
                        {errors.motionText && (
                            <p className="text-xs text-red-500 mt-1">{errors.motionText}</p>
                        )}
                    </div>
                </div>

                <div>
                    <h3 className="font-display text-sm font-semibold text-forest mb-3">
                        The Vote
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-forest/70 mb-1">
                                Votes For
                            </label>
                            <input
                                type="number"
                                value={formData.votesFor}
                                onChange={(e) => updateField("votesFor", e.target.value)}
                                className={`w-full px-3 py-2 rounded-lg border ${
                                    errors.votesFor ? "border-red-500" : "border-sage/20"
                                } bg-white text-forest focus:outline-none focus:ring-2 focus:ring-terracotta/30`}
                                min="0"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-forest/70 mb-1">
                                Votes Against
                            </label>
                            <input
                                type="number"
                                value={formData.votesAgainst}
                                onChange={(e) =>
                                    updateField("votesAgainst", e.target.value)
                                }
                                className="w-full px-3 py-2 rounded-lg border border-sage/20 bg-white text-forest focus:outline-none focus:ring-2 focus:ring-terracotta/30"
                                min="0"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-forest/70 mb-1">
                                Votes Abstain
                            </label>
                            <input
                                type="number"
                                value={formData.votesAbstain}
                                onChange={(e) =>
                                    updateField("votesAbstain", e.target.value)
                                }
                                className="w-full px-3 py-2 rounded-lg border border-sage/20 bg-white text-forest focus:outline-none focus:ring-2 focus:ring-terracotta/30"
                                min="0"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-forest/70 mb-1">
                                Outcome *
                            </label>
                            <select
                                value={formData.outcome}
                                onChange={(e) => {
                                    updateField("outcome", e.target.value);
                                    setShowExecutionSection(e.target.value === "carried");
                                }}
                                className={`w-full px-3 py-2 rounded-lg border ${
                                    errors.outcome ? "border-red-500" : "border-sage/20"
                                } bg-white text-forest focus:outline-none focus:ring-2 focus:ring-terracotta/30`}
                            >
                                <option value="">Select outcome</option>
                                <option value="carried">Carried</option>
                                <option value="not_carried">Not Carried</option>
                            </select>
                        </div>
                    </div>
                </div>

                {showExecutionSection && (
                    <div>
                        <h3 className="font-display text-sm font-semibold text-forest mb-3">
                            Execution
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-forest/70 mb-1">
                                    Action Owner
                                </label>
                                <select
                                    value={formData.actionOwner}
                                    onChange={(e) =>
                                        updateField("actionOwner", e.target.value)
                                    }
                                    className="w-full px-3 py-2 rounded-lg border border-sage/20 bg-white text-forest focus:outline-none focus:ring-2 focus:ring-terracotta/30"
                                >
                                    <option value="">Select owner</option>
                                    {memberOptions.map((m) => (
                                        <option key={m.value} value={m.value}>
                                            {m.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-forest/70 mb-1">
                                    Deadline
                                </label>
                                <input
                                    type="date"
                                    value={formData.deadline}
                                    onChange={(e) =>
                                        updateField("deadline", e.target.value)
                                    }
                                    className="w-full px-3 py-2 rounded-lg border border-sage/20 bg-white text-forest focus:outline-none focus:ring-2 focus:ring-terracotta/30"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-forest/70 mb-1">
                                    Financial Commitment
                                </label>
                                <input
                                    type="number"
                                    value={formData.financialCommitment}
                                    onChange={(e) =>
                                        updateField("financialCommitment", e.target.value)
                                    }
                                    className="w-full px-3 py-2 rounded-lg border border-sage/20 bg-white text-forest focus:outline-none focus:ring-2 focus:ring-terracotta/30"
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-forest/70 mb-1">
                                    GST
                                </label>
                                <select
                                    value={formData.financialGst}
                                    onChange={(e) =>
                                        updateField(
                                            "financialGst",
                                            e.target.value as "plus_gst" | "incl_gst" | ""
                                        )
                                    }
                                    className="w-full px-3 py-2 rounded-lg border border-sage/20 bg-white text-forest focus:outline-none focus:ring-2 focus:ring-terracotta/30"
                                >
                                    <option value="plus_gst">+ GST</option>
                                    <option value="incl_gst">Incl. GST</option>
                                </select>
                            </div>
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
