/**
 * @file client/src/features/referrals/pages/ReferralDetailPage.tsx
 * @description Single referral detail view with event timeline and data quality metrics
 *
 * @responsibility
 *   - Owns: Detail layout, timeline rendering, appointment display
 *   - Does NOT own: Data fetching, referral state, domain logic
 *
 * @dependencies date-fns, wouter
 * @lastReviewed 2024-12-24
 */

import { useParams, Link, useLocation } from "wouter";
import { useReferrals } from "@/app/providers/ReferralsProvider.tsx";
import { useAuth } from "@/app/providers/AuthProvider";
import { StatusBadge } from "@/shared/ui/composites/status-badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/primitives/card";
import { Button } from "@/shared/ui/primitives/button";
import { Badge } from "@/shared/ui/primitives/badge";
import { format, parseISO } from "date-fns";
import {
    Calendar,
    CheckCircle2,
    AlertOctagon,
    ArrowLeft,
    History,
    FileText,
    Clock,
    Hash,
    AlertTriangle,
    CalendarX,
    Send,
    Eye
} from "lucide-react";

export default function ReferralDetail() {
    const params = useParams<{ id: string }>();
    const { referralsMap } = useReferrals();
    const { user } = useAuth();
    const routePrefix = user?.role === "admin" ? "/admin" : "/app";
    const id = params.id;
    const referral = id ? referralsMap[id] : null;

    if (!referral) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center px-4">
                <AlertOctagon className="h-16 w-16 text-muted-foreground/30 mb-6" />
                <h2 className="text-2xl font-bold text-foreground">Referral Not Found</h2>
                <p className="text-muted-foreground mt-2 text-base">The referral ID "{id}" does not exist in our records.</p>
                <Button variant="outline" asChild className="mt-6">
                    <Link href={`${routePrefix}/referrals`}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Referrals
                    </Link>
                </Button>
            </div>
        );
    }

    const latestSeq = Math.max(...referral.events.map(e => e.seq));

    // Helper to get event icon and color
    const getEventStyle = (event: typeof referral.events[0]) => {
        if (event.type === "STATUS_UPDATE") {
            switch (event.payload.status) {
                case "COMPLETED":
                    return {
                        icon: <CheckCircle2 className="h-4 w-4" />,
                        bg: "bg-emerald-100 dark:bg-emerald-900/40",
                        border: "border-emerald-400 dark:border-emerald-600",
                        iconColor: "text-emerald-600 dark:text-emerald-400",
                        label: "Completed"
                    };
                case "CANCELLED":
                    return {
                        icon: <AlertOctagon className="h-4 w-4" />,
                        bg: "bg-red-100 dark:bg-red-900/40",
                        border: "border-red-400 dark:border-red-600",
                        iconColor: "text-red-600 dark:text-red-400",
                        label: "Cancelled"
                    };
                case "SENT":
                    return {
                        icon: <Send className="h-4 w-4" />,
                        bg: "bg-purple-100 dark:bg-purple-900/40",
                        border: "border-purple-400 dark:border-purple-600",
                        iconColor: "text-purple-600 dark:text-purple-400",
                        label: "Sent"
                    };
                case "ACKNOWLEDGED":
                    return {
                        icon: <Eye className="h-4 w-4" />,
                        bg: "bg-amber-100 dark:bg-amber-900/40",
                        border: "border-amber-400 dark:border-amber-600",
                        iconColor: "text-amber-600 dark:text-amber-400",
                        label: "Acknowledged"
                    };
                case "SCHEDULED":
                    return {
                        icon: <Calendar className="h-4 w-4" />,
                        bg: "bg-blue-100 dark:bg-blue-900/40",
                        border: "border-blue-400 dark:border-blue-600",
                        iconColor: "text-blue-600 dark:text-blue-400",
                        label: "Scheduled"
                    };
                default:
                    return {
                        icon: <FileText className="h-4 w-4" />,
                        bg: "bg-slate-100 dark:bg-slate-800/40",
                        border: "border-slate-400 dark:border-slate-600",
                        iconColor: "text-slate-600 dark:text-slate-400",
                        label: "Created"
                    };
            }
        }
        if (event.type === "APPOINTMENT_SET") {
            return {
                icon: <Calendar className="h-4 w-4" />,
                bg: "bg-blue-100 dark:bg-blue-900/40",
                border: "border-blue-400 dark:border-blue-600",
                iconColor: "text-blue-600 dark:text-blue-400",
                label: "Appointment Set"
            };
        }
        if (event.type === "APPOINTMENT_CANCELLED") {
            return {
                icon: <CalendarX className="h-4 w-4" />,
                bg: "bg-orange-100 dark:bg-orange-900/40",
                border: "border-orange-400 dark:border-orange-600",
                iconColor: "text-orange-600 dark:text-orange-400",
                label: "Appointment Cancelled"
            };
        }
        return {
            icon: <FileText className="h-4 w-4" />,
            bg: "bg-slate-100 dark:bg-slate-800/40",
            border: "border-slate-400 dark:border-slate-600",
            iconColor: "text-slate-600 dark:text-slate-400",
            label: "Event"
        };
    };

    return (
        <div className="space-y-8 pb-8">
            {/* Page Header */}
            <div className="space-y-4">
                <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground -ml-3">
                    <Link href={`${routePrefix}/referrals`}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Referrals
                    </Link>
                </Button>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-4 flex-wrap">
                            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                                Referral {referral.referral_id}
                            </h1>
                            <StatusBadge status={referral.status} className="text-sm px-3 py-1" />
                        </div>
                        <p className="text-base text-muted-foreground mt-2 flex items-center gap-2">
                            <History className="h-4 w-4 shrink-0" />
                            Last updated via event sequence #{latestSeq}
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Grid - 8/4 on desktop, stacked on mobile */}
            <div className="grid gap-8 lg:grid-cols-12">
                {/* Timeline Card - Primary content */}
                <div className="lg:col-span-8">
                    <Card className="premium-card">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-3 text-xl">
                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <History className="h-5 w-5 text-primary" />
                                </div>
                                Event Timeline
                            </CardTitle>
                            <CardDescription className="text-base mt-1">
                                Chronological sequence of {referral.events.length} events
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-2">
                            <div className="relative border-l-2 border-border ml-4 pl-8 space-y-6">
                                {referral.events.map((event, idx) => {
                                    const isLatest = event.seq === latestSeq;
                                    const style = getEventStyle(event);

                                    return (
                                        <div
                                            key={idx}
                                            className={`relative ${isLatest ? 'pb-0' : ''}`}
                                        >
                                            {/* Timeline dot */}
                                            <div
                                                className={`absolute -left-[41px] top-1 h-8 w-8 rounded-full border-2 ${style.border} ${style.bg} flex items-center justify-center ${isLatest ? 'ring-4 ring-primary/20' : ''}`}
                                            >
                                                <span className={style.iconColor}>{style.icon}</span>
                                            </div>

                                            {/* Event content */}
                                            <div className={`rounded-lg border ${isLatest ? 'border-primary/40 bg-primary/5 dark:bg-primary/10' : 'border-border bg-muted/30 dark:bg-muted/20'} p-4`}>
                                                {/* Event header */}
                                                <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-base font-semibold text-foreground">
                                                            {style.label}
                                                        </span>
                                                        {isLatest && (
                                                            <Badge className="bg-primary text-primary-foreground text-xs px-2">
                                                                Latest
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <Badge variant="outline" className="font-mono text-xs text-muted-foreground shrink-0">
                                                        SEQ #{event.seq}
                                                    </Badge>
                                                </div>

                                                {/* Event body */}
                                                {event.type === "STATUS_UPDATE" && (
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm text-muted-foreground">New Status:</span>
                                                        <StatusBadge status={event.payload.status!} />
                                                    </div>
                                                )}
                                                {event.type === "APPOINTMENT_SET" && (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                                        <div className="flex items-center justify-between sm:justify-start gap-2 p-2 rounded bg-background/50">
                                                            <span className="text-muted-foreground">ID:</span>
                                                            <span className="font-mono font-medium">{event.payload.appt_id}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between sm:justify-start gap-2 p-2 rounded bg-background/50">
                                                            <span className="text-muted-foreground">Time:</span>
                                                            <span className="font-medium">{format(parseISO(event.payload.start_time!), "MMM dd, yyyy • h:mm a")}</span>
                                                        </div>
                                                    </div>
                                                )}
                                                {event.type === "APPOINTMENT_CANCELLED" && (
                                                    <div className="flex items-center gap-3 p-2 rounded bg-orange-50 dark:bg-orange-900/20">
                                                        <span className="text-sm text-muted-foreground">Cancelled Appointment:</span>
                                                        <span className="font-mono text-sm font-medium text-orange-700 dark:text-orange-400">
                                                            {event.payload.appt_id}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Key Info Column */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Active Appointment Card */}
                    <Card className="premium-card overflow-hidden">
                        <div className="h-1.5 bg-gradient-to-r from-primary to-primary/60 w-full" />
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg font-semibold flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-primary" />
                                Active Appointment
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {referral.active_appointment ? (
                                <div className="space-y-4">
                                    <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-xl border border-primary/20">
                                        <Calendar className="h-8 w-8 text-primary mb-3" />
                                        <span className="text-3xl font-bold text-primary tracking-tight">
                                            {format(parseISO(referral.active_appointment.start_time), "MMM dd")}
                                        </span>
                                        <span className="text-sm font-medium text-primary/80 mt-1">
                                            {format(parseISO(referral.active_appointment.start_time), "yyyy")}
                                        </span>
                                        <div className="mt-4 flex items-center gap-2 text-base text-foreground font-semibold">
                                            <Clock className="h-4 w-4" />
                                            {format(parseISO(referral.active_appointment.start_time), "h:mm a")}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between py-3 border-t border-border">
                                        <span className="text-sm text-muted-foreground">Appointment ID</span>
                                        <span className="font-mono text-sm font-medium">{referral.active_appointment.appt_id}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                                    <Calendar className="h-12 w-12 mb-4 opacity-30" />
                                    <p className="text-base font-medium">No active appointment</p>
                                    {["COMPLETED", "CANCELLED"].includes(referral.status) && (
                                        <p className="text-sm opacity-70 mt-1">(Referral is terminal)</p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Data Quality Card */}
                    <Card className="premium-card">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg font-semibold flex items-center gap-3">
                                <AlertTriangle className="h-5 w-5 text-amber-500" />
                                Data Quality
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-1">
                                <div className="flex items-center justify-between py-3 border-b border-border/50">
                                    <span className="text-sm text-muted-foreground">Duplicate Events</span>
                                    <Badge
                                        variant="secondary"
                                        className={`text-sm px-3 ${referral.metrics?.duplicates && referral.metrics.duplicates > 0 ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300' : ''}`}
                                    >
                                        {referral.metrics?.duplicates || 0}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between py-3 border-b border-border/50">
                                    <span className="text-sm text-muted-foreground">Sequence Gaps</span>
                                    <Badge
                                        variant="secondary"
                                        className={`text-sm px-3 ${referral.metrics?.seqGaps && referral.metrics.seqGaps > 0 ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' : ''}`}
                                    >
                                        {referral.metrics?.seqGaps || 0}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between py-3 border-b border-border/50">
                                    <span className="text-sm text-muted-foreground">Terminal Overrides</span>
                                    <Badge
                                        variant="secondary"
                                        className={`text-sm px-3 ${referral.metrics?.terminalOverrides && referral.metrics.terminalOverrides > 0 ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300' : ''}`}
                                    >
                                        {referral.metrics?.terminalOverrides && referral.metrics.terminalOverrides > 0 ? "Yes" : "No"}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between py-3">
                                    <span className="text-sm text-muted-foreground">Reschedules</span>
                                    <Badge variant="secondary" className="text-sm px-3">
                                        {referral.metrics?.reschedules || 0}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Appointment History Card */}
                    <Card className="premium-card">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg font-semibold">Appointment History</CardTitle>
                            <CardDescription className="text-sm">
                                {Object.keys(referral.appointments).length} tracked slot(s)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                                {Object.entries(referral.appointments).map(([apptId, appt]) => {
                                    const isCancelled = appt === null;
                                    return (
                                        <div
                                            key={apptId}
                                            className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors"
                                        >
                                            <div className="flex items-center gap-2 min-w-0">
                                                <Hash className="h-4 w-4 text-muted-foreground shrink-0" />
                                                <span className="font-mono text-sm font-medium truncate">
                                                    {apptId}
                                                </span>
                                            </div>
                                            {isCancelled ? (
                                                <Badge variant="outline" className="text-xs text-red-600 bg-red-50 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800 shrink-0">
                                                    Cancelled
                                                </Badge>
                                            ) : (
                                                <span className="text-sm font-medium text-foreground shrink-0">
                                                    {format(parseISO(appt!.start_time), "MMM dd")}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
