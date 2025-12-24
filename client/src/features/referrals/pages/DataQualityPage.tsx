/**
 * @file client/src/features/referrals/pages/DataQualityPage.tsx
 * @description Data quality dashboard showing feed integrity and anomaly analysis
 *
 * @responsibility
 *   - Owns: Quality metrics display, charts, anomaly table
 *   - Does NOT own: Quality computation logic, data fetching
 *
 * @dependencies recharts
 * @lastReviewed 2024-12-24
 */

import { useReferrals } from "@/app/providers/ReferralsProvider.tsx";
import { computeDataQualitySummary } from "@/features/referrals/domain/dataQuality";
import { MetricCard } from "@/shared/ui/composites/metric-card";
import {
    AlertTriangle,
    Copy,
    SkipForward,
    RefreshCcw,
    XSquare,
    CheckCircle2
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/primitives/card";
import { Badge } from "@/shared/ui/primitives/badge";

export default function DataQuality() {
    const { referrals } = useReferrals();

    const {
        totalDuplicates,
        totalSeqGaps,
        totalTerminalOverrides,
        totalReschedules,
        totalCancelledAppts,
        referralsWithIssues
    } = computeDataQualitySummary(referrals);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-bold text-foreground">Data Quality Health</h1>
                <p className="text-muted-foreground mt-2">Analysis of feed integrity and event sequence anomalies.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-5">
                <MetricCard
                    title="Duplicates Ignored"
                    value={totalDuplicates}
                    icon={Copy}
                    iconColor="text-gray-600"
                />
                <MetricCard
                    title="Sequence Gaps"
                    value={totalSeqGaps}
                    icon={SkipForward}
                    iconColor="text-amber-600"
                />
                <MetricCard
                    title="Terminal Overrides"
                    value={totalTerminalOverrides}
                    icon={RefreshCcw}
                    iconColor="text-purple-600"
                />
                <MetricCard
                    title="Reschedules"
                    value={totalReschedules}
                    icon={CheckCircle2}
                    iconColor="text-blue-600"
                />
                <MetricCard
                    title="Cancelled Appts"
                    value={totalCancelledAppts}
                    icon={XSquare}
                    iconColor="text-red-600"
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="premium-card">
                    <CardHeader>
                        <CardTitle className="text-lg">Issues by Referral</CardTitle>
                        <CardDescription>Top referrals with data inconsistencies</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={referralsWithIssues}
                                    layout="vertical"
                                    margin={{ left: 10, right: 20, top: 10, bottom: 10 }}
                                    barCategoryGap="20%"
                                >
                                    <defs>
                                        <linearGradient id="duplicatesGradient" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.9} />
                                            <stop offset="100%" stopColor="#A78BFA" stopOpacity={0.7} />
                                        </linearGradient>
                                        <linearGradient id="gapsGradient" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stopColor="#F97316" stopOpacity={0.9} />
                                            <stop offset="100%" stopColor="#FB923C" stopOpacity={0.7} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        horizontal={true}
                                        vertical={false}
                                        stroke="hsl(var(--border))"
                                        opacity={0.4}
                                    />
                                    <XAxis
                                        type="number"
                                        stroke="hsl(var(--muted-foreground))"
                                        fontSize={11}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        dataKey="id"
                                        type="category"
                                        stroke="hsl(var(--muted-foreground))"
                                        fontSize={13}
                                        fontWeight={500}
                                        tickLine={false}
                                        axisLine={false}
                                        width={45}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--card))',
                                            borderColor: 'hsl(var(--border))',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                            border: '1px solid hsl(var(--border))',
                                            padding: '10px 14px'
                                        }}
                                        labelStyle={{ color: 'hsl(var(--foreground))', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}
                                        itemStyle={{ color: 'hsl(var(--foreground))', fontSize: '12px', padding: '2px 0' }}
                                    />
                                    <Bar
                                        dataKey="duplicates"
                                        fill="url(#duplicatesGradient)"
                                        name="Duplicates"
                                        radius={[0, 6, 6, 0]}
                                        animationDuration={500}
                                        animationEasing="ease-out"
                                    />
                                    <Bar
                                        dataKey="seqGaps"
                                        fill="url(#gapsGradient)"
                                        name="Sequence Gaps"
                                        radius={[0, 6, 6, 0]}
                                        animationDuration={500}
                                        animationEasing="ease-out"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        {/* Legend */}
                        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border/50">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-sm bg-gradient-to-r from-purple-500 to-purple-400" />
                                <span className="text-sm text-muted-foreground">Duplicates</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-sm bg-gradient-to-r from-orange-500 to-orange-400" />
                                <span className="text-sm text-muted-foreground">Sequence Gaps</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="premium-card">
                    <CardHeader>
                        <CardTitle className="text-lg">Anomalies Log</CardTitle>
                        <CardDescription>Detailed breakdown of detected issues</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-lg border border-border overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/40 text-foreground font-semibold border-b border-border">
                                    <tr>
                                        <th className="h-10 px-4 text-left font-medium">Referral</th>
                                        <th className="h-10 px-4 text-center font-medium">Dupes</th>
                                        <th className="h-10 px-4 text-center font-medium">Gaps</th>
                                        <th className="h-10 px-4 text-center font-medium">Overrides</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {referralsWithIssues.map((r) => (
                                        <tr key={r.id} className="table-row-hover">
                                            <td className="p-3 font-medium text-foreground">{r.id}</td>
                                            <td className="p-3 text-center">
                                                {r.duplicates > 0 ? (
                                                    <Badge variant="secondary" className="bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100">{r.duplicates}</Badge>
                                                ) : <span className="text-muted-foreground">—</span>}
                                            </td>
                                            <td className="p-3 text-center">
                                                {r.seqGaps > 0 ? (
                                                    <Badge variant="destructive" className="bg-red-200 dark:bg-red-900 text-red-900 dark:text-red-100">{r.seqGaps}</Badge>
                                                ) : <span className="text-muted-foreground">—</span>}
                                            </td>
                                            <td className="p-3 text-center">
                                                {r.overrides > 0 ? (
                                                    <Badge variant="outline" className="border-purple-300 dark:border-purple-700 text-purple-900 dark:text-purple-200 bg-purple-100 dark:bg-purple-950/50">Yes</Badge>
                                                ) : <span className="text-muted-foreground">—</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
