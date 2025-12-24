/**
 * @file client/src/features/referrals/pages/ReferralListPage.tsx
 * @description Paginated referral list with search, filtering, and CSV export
 *
 * @responsibility
 *   - Owns: List rendering, filtering UI, pagination, export functionality
 *   - Does NOT own: Data fetching, referral state, domain logic
 *
 * @dependencies date-fns
 * @lastReviewed 2024-12-24
 */

import { useState, useMemo } from "react";
import { useReferrals } from "@/app/providers/ReferralsProvider.tsx";
import { useAuth } from "@/app/providers/AuthProvider";
import { StatusBadge } from "@/shared/ui/composites/status-badge";
import { Input } from "@/shared/ui/primitives/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/shared/ui/primitives/select";
import { Button } from "@/shared/ui/primitives/button";
import { Link } from "wouter";
import { format, parseISO } from "date-fns";
import {
    Download,
    Search,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    X,
    FileText,
    CheckCircle2,
    Calendar,
    Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/primitives/card";

export default function ReferralList() {
    const { referrals } = useReferrals();
    const { user } = useAuth();
    const routePrefix = user?.role === "admin" ? "/admin" : "/app";
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [apptFilter, setApptFilter] = useState("ALL");
    const [page, setPage] = useState(1);
    const itemsPerPage = 10;

    // Filter referrals first
    const filteredReferrals = useMemo(() => referrals.filter(r => {
        const matchesSearch = r.referral_id.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
        const hasAppt = r.active_appointment !== null;
        const matchesAppt = apptFilter === "ALL"
            ? true
            : apptFilter === "YES" ? hasAppt : !hasAppt;

        return matchesSearch && matchesStatus && matchesAppt;
    }), [referrals, search, statusFilter, apptFilter]);

    // Calculate summary metrics based on filtered data
    const metrics = useMemo(() => {
        const total = filteredReferrals.length;
        const completed = filteredReferrals.filter(r => r.status === "COMPLETED").length;
        const scheduled = filteredReferrals.filter(r => r.status === "SCHEDULED").length;
        const withAppt = filteredReferrals.filter(r => r.active_appointment !== null).length;
        const cancelled = filteredReferrals.filter(r => r.status === "CANCELLED").length;
        return { total, completed, scheduled, withAppt, cancelled };
    }, [filteredReferrals]);

    const totalPages = Math.ceil(filteredReferrals.length / itemsPerPage);
    const paginatedReferrals = filteredReferrals.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    );

    const handleExport = () => {
        const csvContent = "data:text/csv;charset=utf-8,"
            + "Referral ID,Status,Active Appointment ID,Active Appointment Time\n"
            + filteredReferrals.map(r => {
                const time = r.active_appointment ? r.active_appointment.start_time : "";
                const apptId = r.active_appointment ? r.active_appointment.appt_id : "";
                return `${r.referral_id},${r.status},${apptId},${time}`;
            }).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "referrals_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleClearFilters = () => {
        setSearch("");
        setStatusFilter("ALL");
        setApptFilter("ALL");
        setPage(1);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-foreground">Referrals</h1>
                    <p className="text-muted-foreground mt-2">Manage and track patient referrals.</p>
                </div>
                <Button
                    size="sm"
                    className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all font-semibold"
                    onClick={handleExport}
                >
                    <Download className="h-4 w-4" />
                    Export CSV
                </Button>
            </div>

            {/* Summary Metric Cards */}
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                <Card className="premium-card">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium">Total Referrals</p>
                                <p className="text-2xl font-bold text-foreground">{metrics.total}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="premium-card">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium">Completed</p>
                                <p className="text-2xl font-bold text-foreground">{metrics.completed}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="premium-card">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
                                <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium">Scheduled</p>
                                <p className="text-2xl font-bold text-foreground">{metrics.scheduled}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="premium-card">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium">With Active Appt</p>
                                <p className="text-2xl font-bold text-foreground">{metrics.withAppt}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border border-border/50 bg-gradient-to-br from-card to-card/50 dark:from-card dark:to-card/80 shadow-sm hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-4">
                    <div className="flex flex-col gap-3">
                        <div className="flex flex-col md:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by Referral ID..."
                                    className="pl-10 bg-background border border-border/50 hover:border-border transition-colors duration-200 focus:border-primary/50"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full md:w-[160px] bg-background border border-border/50 hover:border-border transition-colors duration-200 focus:border-primary/50 font-medium">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent className="border border-border/50">
                                    <SelectItem value="ALL">All Statuses</SelectItem>
                                    <SelectItem value="CREATED">Created</SelectItem>
                                    <SelectItem value="SENT">Sent</SelectItem>
                                    <SelectItem value="ACKNOWLEDGED">Acknowledged</SelectItem>
                                    <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                                    <SelectItem value="COMPLETED">Completed</SelectItem>
                                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={apptFilter} onValueChange={setApptFilter}>
                                <SelectTrigger className="w-full md:w-[160px] bg-background border border-border/50 hover:border-border transition-colors duration-200 focus:border-primary/50 font-medium">
                                    <SelectValue placeholder="Appointment" />
                                </SelectTrigger>
                                <SelectContent className="border border-border/50">
                                    <SelectItem value="ALL">All Appointments</SelectItem>
                                    <SelectItem value="YES">Has Active Appt</SelectItem>
                                    <SelectItem value="NO">No Active Appt</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {(search || statusFilter !== "ALL" || apptFilter !== "ALL") && (
                            <div className="flex items-center gap-2 animate-in slide-in-from-top-2 duration-300">
                                <span className="text-sm text-muted-foreground font-semibold">Filters active</span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleClearFilters}
                                    className="gap-1 hover:bg-destructive/10 hover:text-destructive transition-all duration-200 border border-border/50"
                                >
                                    <X className="h-3.5 w-3.5" />
                                    Clear
                                </Button>
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-lg border border-border/50 overflow-hidden shadow-sm">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/30 dark:bg-muted/20 text-muted-foreground font-semibold border-b border-border/50">
                                <tr>
                                    <th className="h-12 px-4 text-left align-middle font-semibold">Referral ID</th>
                                    <th className="h-12 px-4 text-left align-middle font-semibold">Status</th>
                                    <th className="h-12 px-4 text-left align-middle font-semibold">Active Appt ID</th>
                                    <th className="h-12 px-4 text-left align-middle font-semibold">Appt Time</th>
                                    <th className="h-12 px-4 text-center align-middle font-semibold">Terminal</th>
                                    <th className="h-12 px-4 text-right align-middle font-semibold">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                                {paginatedReferrals.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-12 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center gap-2">
                                                <Search className="h-8 w-8 text-muted-foreground/50" />
                                                <p className="font-medium">No referrals found</p>
                                                <p className="text-sm">Try adjusting your filters</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedReferrals.map((referral) => {
                                        const isTerminal = ["COMPLETED", "CANCELLED"].includes(referral.status);
                                        return (
                                            <tr
                                                key={referral.referral_id}
                                                className="hover:bg-muted/50 dark:hover:bg-muted/20 transition-colors group"
                                            >
                                                <td className="p-4">
                                                    <span className="font-bold text-foreground text-base">{referral.referral_id}</span>
                                                </td>
                                                <td className="p-4">
                                                    <StatusBadge status={referral.status} />
                                                </td>
                                                <td className="p-4">
                                                    <span className="text-muted-foreground font-mono text-sm">
                                                        {referral.active_appointment?.appt_id || "—"}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <span className="text-foreground text-sm">
                                                        {referral.active_appointment
                                                            ? format(parseISO(referral.active_appointment.start_time), "MMM dd, yyyy • h:mm a")
                                                            : "—"
                                                        }
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center">
                                                    {isTerminal && (
                                                        <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" title="Terminal State" />
                                                    )}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        asChild
                                                        className="h-8 px-3 text-primary hover:text-primary hover:bg-primary/10 font-medium gap-1"
                                                    >
                                                        <Link href={`${routePrefix}/referrals/${referral.referral_id}`}>
                                                            View
                                                            <ChevronRight className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-6 gap-4 animate-in slide-in-from-bottom-2 duration-300">
                            <p className="text-xs text-muted-foreground font-medium">
                                Showing {(page - 1) * itemsPerPage + 1} to {Math.min(page * itemsPerPage, filteredReferrals.length)} of {filteredReferrals.length} entries
                            </p>
                            <div className="flex items-center space-x-1.5">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-9 w-9 border border-border/50 hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                                    onClick={() => setPage(1)}
                                    disabled={page === 1}
                                >
                                    <ChevronsLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-9 w-9 border border-border/50 hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <div className="text-xs font-bold text-muted-foreground px-3 py-1.5 bg-muted/30 rounded-md">
                                    {page} / {totalPages}
                                </div>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-9 w-9 border border-border/50 hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-9 w-9 border border-border/50 hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                                    onClick={() => setPage(totalPages)}
                                    disabled={page === totalPages}
                                >
                                    <ChevronsRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
