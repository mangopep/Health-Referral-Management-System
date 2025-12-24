/**
 * @file client/src/shared/ui/composites/timeline.tsx
 * @description Timeline component with item, header, and body subcomponents
 */

import * as React from "react";
import { cn } from "@/core/utils/cn";

interface TimelineProps {
    children: React.ReactNode;
    className?: string;
}

export function Timeline({ children, className }: TimelineProps) {
    return (
        <div className={cn("relative pl-6", className)}>
            <div className="timeline-rail" />
            {children}
        </div>
    );
}

interface TimelineItemProps {
    children: React.ReactNode;
    icon?: React.ReactNode;
    isLatest?: boolean;
    variant?: "default" | "success" | "danger" | "warning" | "info";
    className?: string;
}

const variantStyles = {
    default: "border-muted-foreground/30 bg-card text-muted-foreground",
    success: "border-emerald-400 bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-600",
    danger: "border-red-400 bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400 dark:border-red-600",
    warning: "border-amber-400 bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-600",
    info: "border-blue-400 bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-600",
};

export function TimelineItem({
    children,
    icon,
    isLatest = false,
    variant = "default",
    className
}: TimelineItemProps) {
    return (
        <div className={cn("timeline-item", className)}>
            <div
                className={cn(
                    "timeline-dot",
                    variantStyles[variant],
                    isLatest && "timeline-dot-latest"
                )}
            >
                {icon && <span className="h-3 w-3">{icon}</span>}
            </div>
            <div className="timeline-content">
                {children}
            </div>
        </div>
    );
}

interface TimelineHeaderProps {
    title: string;
    badge?: React.ReactNode;
    timestamp?: string;
    className?: string;
}

export function TimelineHeader({ title, badge, timestamp, className }: TimelineHeaderProps) {
    return (
        <div className={cn("flex items-center justify-between gap-2 flex-wrap", className)}>
            <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-sm font-medium text-foreground truncate">{title}</span>
                {badge}
            </div>
            {timestamp && (
                <span className="text-xs text-muted-foreground shrink-0">{timestamp}</span>
            )}
        </div>
    );
}

interface TimelineBodyProps {
    children: React.ReactNode;
    className?: string;
}

export function TimelineBody({ children, className }: TimelineBodyProps) {
    return (
        <div className={cn("text-sm bg-muted/30 dark:bg-muted/20 p-3 rounded-md border border-border/50 min-w-0", className)}>
            {children}
        </div>
    );
}
