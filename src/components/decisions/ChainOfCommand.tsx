"use client";

import { Resolution } from "@/types/decisions";
import { formatDate, getVoteTallyText } from "@/lib/decisions";

interface ChainOfCommandProps {
    resolution: Resolution;
    moverName: string;
    seconderName: string;
    className?: string;
}

export default function ChainOfCommand({
    resolution,
    moverName,
    seconderName,
    className = "",
}: ChainOfCommandProps) {
    const voteTallyText = getVoteTallyText(
        resolution.votesFor,
        resolution.votesAgainst,
        resolution.votesAbstain
    );

    const voteIsUnanimous =
        resolution.votesAgainst === 0 && resolution.votesAbstain === 0;

    return (
        <div className={`space-y-3 ${className}`}>
            <h4 className="font-display text-[10px] font-bold text-forest/40 uppercase tracking-widest">
                Chain of Command
            </h4>

            <div className="grid grid-cols-[120px_1fr] gap-x-4 gap-y-2 text-sm">
                <span className="text-forest/60">Meeting:</span>
                <span className="text-forest font-medium">
                    {formatDate(resolution.meetingDate)}
                </span>

                <span className="text-forest/60">Present:</span>
                <span className="text-forest font-medium">
                    {resolution.membersPresent} committee member
                    {resolution.membersPresent !== 1 ? "s" : ""}
                </span>

                <span className="text-forest/60">Moved:</span>
                <span className="text-forest font-medium">{moverName}</span>

                <span className="text-forest/60">Seconded:</span>
                <span className="text-forest font-medium">{seconderName}</span>

                <span className="text-forest/60">Vote:</span>
                <div className="flex items-center gap-2">
                    <span
                        className={`font-bold ${
                            voteIsUnanimous ? "text-green-600" : ""
                        }`}
                    >
                        {voteTallyText}
                    </span>
                    {!voteIsUnanimous && (
                        <div className="flex gap-1.5">
                            <span className="px-1.5 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded">
                                {resolution.votesFor} For
                            </span>
                            <span className="px-1.5 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded">
                                {resolution.votesAgainst} Against
                            </span>
                            {resolution.votesAbstain > 0 && (
                                <span className="px-1.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                                    {resolution.votesAbstain} Abstain
                                </span>
                            )}
                        </div>
                    )}
                </div>

                <span className="text-forest/60">Outcome:</span>
                <span
                    className={`font-bold uppercase ${
                        resolution.outcome === "carried"
                            ? "text-green-600"
                            : "text-forest/50"
                    }`}
                >
                    {resolution.outcome === "carried" ? "CARRIED" : "NOT CARRIED"}
                </span>
            </div>
        </div>
    );
}
