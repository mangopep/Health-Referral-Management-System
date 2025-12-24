/**
 * @file client/src/tests/unit/referrals/referral-engine.test.ts
 * @description Unit tests for reconcile and deriveMetrics domain functions
 */

import { describe, it, expect } from "vitest";
import { reconcile } from "@/features/referrals/domain/reconcile";
import { getDerivedMetrics } from "@/features/referrals/domain/deriveMetrics";
import { ReferralEvent } from "@/features/referrals/domain/models";

describe("referral-engine", () => {
    describe("reconcile", () => {
        it("should handle empty events", () => {
            const result = reconcile([]);
            expect(result).toEqual({});
        });

        it("should process a single referral status update", () => {
            const events: ReferralEvent[] = [
                {
                    referral_id: "ref_1",
                    seq: 1,
                    type: "STATUS_UPDATE",
                    payload: { status: "SENT" },
                },
            ];
            const result = reconcile(events);
            const referral = result["ref_1"];
            expect(referral).toBeDefined();
            expect(referral?.referral_id).toBe("ref_1");
            expect(referral?.status).toBe("SENT");
        });

        it("should handle multiple events in sequence", () => {
            const events: ReferralEvent[] = [
                {
                    referral_id: "ref_1",
                    seq: 1,
                    type: "STATUS_UPDATE",
                    payload: { status: "SENT" },
                },
                {
                    referral_id: "ref_1",
                    seq: 2,
                    type: "STATUS_UPDATE",
                    payload: { status: "ACKNOWLEDGED" },
                }
            ];
            const result = reconcile(events);
            expect(result["ref_1"].status).toBe("ACKNOWLEDGED");
        });

        it("should calculate sequence gaps", () => {
            const events: ReferralEvent[] = [
                { referral_id: "ref_1", seq: 1, type: "STATUS_UPDATE", payload: { status: "SENT" } },
                { referral_id: "ref_1", seq: 3, type: "STATUS_UPDATE", payload: { status: "ACKNOWLEDGED" } }
            ];
            const result = reconcile(events);
            // Gap between 1 and 3 is 1 (seq 2 missing)
            expect(result["ref_1"].metrics.seqGaps).toBe(1);
        });
    });

    describe("getDerivedMetrics", () => {
        it("should calculate metrics correctly", () => {
            // Mock a ReconciledMap
            const mockMap = {
                "ref_1": { status: "COMPLETED", active_appointment: null } as any,
                "ref_2": { status: "CANCELLED", active_appointment: null } as any,
                "ref_3": { status: "SENT", active_appointment: null } as any,
                "ref_4": { status: "SCHEDULED", active_appointment: { appt_id: "1", start_time: "2023-01-01" } } as any,
            };
            const metrics = getDerivedMetrics(mockMap);
            expect(metrics.total).toBe(4);
            expect(metrics.completed).toBe(1);
            expect(metrics.cancelled).toBe(1);
            expect(metrics.inProgress).toBe(2); // SENT + SCHEDULED
            expect(metrics.scheduled).toBe(1);
            expect(metrics.noAppointment).toBe(1); // SENT
        });
    });
});
