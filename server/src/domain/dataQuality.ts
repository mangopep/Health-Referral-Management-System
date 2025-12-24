/**
 * @file server/src/domain/dataQuality.ts
 * @description Data quality analysis - identifies issues in referral data
 */

import { type ReferralState } from "./models.js";

export interface ReferralIssue {
    id: string;
    duplicates: number;
    seqGaps: number;
    overrides: number;
    score: number;
}

export interface DataQualitySummary {
    totalDuplicates: number;
    totalSeqGaps: number;
    totalTerminalOverrides: number;
    totalReschedules: number;
    totalCancelledAppts: number;
    referralsWithIssues: ReferralIssue[];
}

export function computeDataQualitySummary(referrals: ReferralState[]): DataQualitySummary {
    const totalDuplicates = referrals.reduce((sum, r) => sum + r.metrics.duplicates, 0);
    const totalSeqGaps = referrals.reduce((sum, r) => sum + r.metrics.seqGaps, 0);
    const totalTerminalOverrides = referrals.reduce((sum, r) => sum + r.metrics.terminalOverrides, 0);
    const totalReschedules = referrals.reduce((sum, r) => sum + r.metrics.reschedules, 0);
    const totalCancelledAppts = referrals.reduce((sum, r) => sum + r.metrics.cancelledAppts, 0);

    const referralsWithIssues = referrals
        .map(r => ({
            id: r.referral_id,
            duplicates: r.metrics.duplicates,
            seqGaps: r.metrics.seqGaps,
            overrides: r.metrics.terminalOverrides,
            score: r.metrics.duplicates + r.metrics.seqGaps + (r.metrics.terminalOverrides * 2)
        }))
        .filter(r => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

    return {
        totalDuplicates,
        totalSeqGaps,
        totalTerminalOverrides,
        totalReschedules,
        totalCancelledAppts,
        referralsWithIssues
    };
}
