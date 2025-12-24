/**
 * @file client/src/features/referrals/domain/dataQuality.ts
 * @description Data quality analysis - identifies issues in referral data
 *
 * @responsibility
 *   - Owns: Issue detection, quality scoring, anomaly identification
 *   - Does NOT own: Data reconciliation, UI display logic
 *
 * @lastReviewed 2024-12-24
 */

import { ReferralState } from "@/features/referrals/domain/models";

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
    const totalDuplicates = referrals.reduce((sum, r) => sum + (r.metrics?.duplicates || 0), 0);
    const totalSeqGaps = referrals.reduce((sum, r) => sum + (r.metrics?.seqGaps || 0), 0);
    const totalTerminalOverrides = referrals.reduce((sum, r) => sum + (r.metrics?.terminalOverrides || 0), 0);
    const totalReschedules = referrals.reduce((sum, r) => sum + (r.metrics?.reschedules || 0), 0);
    const totalCancelledAppts = referrals.reduce((sum, r) => sum + (r.metrics?.cancelledAppts || 0), 0);

    const referralsWithIssues = referrals
        .map(r => {
            const duplicates = r.metrics?.duplicates || 0;
            const seqGaps = r.metrics?.seqGaps || 0;
            const overrides = r.metrics?.terminalOverrides || 0;
            return {
                id: r.referral_id,
                duplicates,
                seqGaps,
                overrides,
                score: duplicates + seqGaps + (overrides * 2)
            };
        })
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
