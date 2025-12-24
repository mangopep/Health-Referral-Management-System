/**
 * @file client/src/features/referrals/domain/models.ts
 * @description Core domain type definitions for referral system
 *
 * @responsibility
 *   - Owns: Type definitions for events, statuses, referral state
 *   - Does NOT own: Business logic, data transformations
 *
 * @lastReviewed 2024-12-24
 */

export type EventType = "STATUS_UPDATE" | "APPOINTMENT_SET" | "APPOINTMENT_CANCELLED";

export type Status = "CREATED" | "SENT" | "ACKNOWLEDGED" | "SCHEDULED" | "COMPLETED" | "CANCELLED";

export interface ReferralEvent {
    referral_id: string;
    seq: number;
    type: EventType;
    payload: {
        status?: Status;
        appt_id?: string;
        start_time?: string;
    };
}

export interface Appointment {
    appt_id: string;
    start_time: string;
}

export interface ReferralState {
    referral_id: string;
    status: Status;
    active_appointment: Appointment | null;
    // For Data Quality metrics
    metrics: {
        duplicates: number;
        seqGaps: number;
        terminalOverrides: number;
        reschedules: number;
        cancelledAppts: number;
    };
    events: ReferralEvent[]; // Keep track of processed events for timeline
    appointments: Record<string, Appointment | null>; // Internal appointment tracking
}

export type ReconciledMap = Record<string, ReferralState>;
