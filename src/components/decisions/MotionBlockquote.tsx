"use client";

import { Lock } from "lucide-react";

interface MotionBlockquoteProps {
    motionText: string;
    locked: boolean;
    className?: string;
}

export default function MotionBlockquote({
    motionText,
    locked,
    className = "",
}: MotionBlockquoteProps) {
    return (
        <div className={`space-y-2 ${className}`}>
            <div className="flex items-center gap-2">
                <h4 className="font-display text-[10px] font-bold text-forest/40 uppercase tracking-widest">
                    The Motion
                </h4>
                {locked && (
                    <div className="flex items-center gap-1 text-forest/30">
                        <Lock className="w-3 h-3" />
                        <span className="text-[10px]">Locked</span>
                    </div>
                )}
            </div>

            <blockquote className="border-l-4 border-terracotta bg-bone/50 p-4 italic text-forest/80 font-body leading-relaxed rounded-r-lg">
                &ldquo;{motionText}&rdquo;
            </blockquote>
        </div>
    );
}
