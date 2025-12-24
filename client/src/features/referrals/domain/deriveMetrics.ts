/**
 * @file client/src/features/referrals/domain/deriveMetrics.ts
 * @description Derives aggregate metrics from reconciled referral data
 *
 * @responsibility
 *   - Owns: Status counting, appointment metrics calculation
 *   - Does NOT own: Reconciliation logic, raw event processing
 *
 * @lastReviewed 2024-12-24
 */

import { ReconciledMap } from "./models";

export function getDerivedMetrics(reconciledMap: ReconciledMap) {
    const referrals = Object.values(reconciledMap);
    const total = referrals.length;

    let completed = 0;
    let cancelled = 0;
    let inProgress = 0;
    let scheduled = 0;
    let noAppointment = 0;

    referrals.forEach(r => {
        if (r.status === "COMPLETED") completed++;
        else if (r.status === "CANCELLED") cancelled++;
        else {
            inProgress++;
            if (r.active_appointment) scheduled++;
            else noAppointment++;
        }
    });

    return {
        total,
        completed,
        cancelled,
        inProgress,
        scheduled,
        noAppointment
    };
}
