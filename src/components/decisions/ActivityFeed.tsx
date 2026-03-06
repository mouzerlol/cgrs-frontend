"use client";

import { useState } from "react";
import { ResolutionActivity } from "@/types/decisions";
import { formatDate } from "@/lib/decisions";

interface ActivityFeedProps {
    activityLog: ResolutionActivity[];
    memberMap: Map<string, string>;
    onAddActivity: (description: string) => void;
    className?: string;
}

export default function ActivityFeed({
    activityLog,
    memberMap,
    onAddActivity,
    className = "",
}: ActivityFeedProps) {
    const [newEntry, setNewEntry] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    const sortedActivities = [...activityLog].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newEntry.trim()) {
            onAddActivity(newEntry.trim());
            setNewEntry("");
            setIsAdding(false);
        }
    };

    return (
        <div className={`space-y-3 ${className}`}>
            <h4 className="font-display text-[10px] font-bold text-forest/40 uppercase tracking-widest">
                Activity Feed
            </h4>

            <div className="space-y-2">
                {isAdding && (
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <input
                            type="text"
                            value={newEntry}
                            onChange={(e) => setNewEntry(e.target.value)}
                            placeholder="Add update..."
                            className="flex-1 px-3 py-2 text-sm rounded-lg border border-sage/20 bg-white text-forest placeholder:text-forest/40 focus:outline-none focus:ring-2 focus:ring-terracotta/30"
                            autoFocus
                        />
                        <button
                            type="submit"
                            className="px-3 py-2 text-sm font-medium text-white bg-terracotta rounded-lg hover:bg-terracotta-dark transition-colors"
                        >
                            Post
                        </button>
                    </form>
                )}

                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="text-xs text-forest/50 hover:text-terracotta transition-colors"
                    >
                        + Add update
                    </button>
                )}

                {sortedActivities.length === 0 ? (
                    <p className="text-sm text-forest/40 italic py-2">
                        No activity recorded yet.
                    </p>
                ) : (
                    sortedActivities.map((activity, index) => {
                        const actorName =
                            activity.actor === "system"
                                ? "System"
                                : memberMap.get(activity.actor) || "Unknown";
                        const isSystem = activity.actor === "system";

                        return (
                            <div
                                key={index}
                                className="flex gap-3 text-sm py-2 border-b border-sage/10 last:border-0"
                            >
                                <div className="flex-shrink-0 w-20 text-xs text-forest/40">
                                    {formatDate(activity.timestamp)}
                                </div>
                                <div className="flex-1">
                                    <span
                                        className={`font-medium ${
                                            isSystem
                                                ? "text-forest/40"
                                                : "text-forest"
                                        }`}
                                    >
                                        {actorName}
                                    </span>
                                    <span className="text-forest/60 mx-1">
                                        —
                                    </span>
                                    <span
                                        className={
                                            isSystem
                                                ? "text-forest/40"
                                                : "text-forest/80"
                                        }
                                    >
                                        {activity.description}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
