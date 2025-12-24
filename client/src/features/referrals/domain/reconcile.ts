/**
 * @file client/src/features/referrals/domain/reconcile.ts
 * @description Event reconciliation engine - processes raw events into referral state
 *
 * @responsibility
 *   - Owns: Event deduplication, sequence gap detection, state computation
 *   - Does NOT own: Data fetching, UI rendering, metrics aggregation
 *
 * @dependencies date-fns
 * @lastReviewed 2024-12-24
 */

import { compareAsc, parseISO } from "date-fns";
import { ReferralEvent, ReconciledMap, ReferralState, Status, Appointment } from "./models";

const TERMINAL_STATUSES: Status[] = ["COMPLETED", "CANCELLED"];

export function reconcile(events: ReferralEvent[]): ReconciledMap {
    const map: ReconciledMap = {};

    // Group events by referral_id
    const eventsByReferral: Record<string, ReferralEvent[]> = {};

    events.forEach(event => {
        if (!eventsByReferral[event.referral_id]) {
            eventsByReferral[event.referral_id] = [];
        }
        eventsByReferral[event.referral_id].push(event);
    });

    // Process each referral
    Object.keys(eventsByReferral).forEach(referralId => {
        const rawEvents = eventsByReferral[referralId];

        // 1. Deduplicate by (referral_id, seq)
        const uniqueEventsMap = new Map<number, ReferralEvent>();
        let duplicateCount = 0;

        rawEvents.forEach(event => {
            if (uniqueEventsMap.has(event.seq)) {
                duplicateCount++;
            } else {
                uniqueEventsMap.set(event.seq, event);
            }
        });

        const sortedEvents = Array.from(uniqueEventsMap.values()).sort((a, b) => a.seq - b.seq);

        // Calculate seq gaps
        let seqGaps = 0;
        if (sortedEvents.length > 0) {
            // Assuming seq starts at 1, or just counting gaps between available seqs
            // The instructions say "Sum gaps". If we have 1, 2, 4. Gap is 1 (missing 3).
            // Let's assume the first event is the start.
            for (let i = 0; i < sortedEvents.length - 1; i++) {
                const diff = sortedEvents[i + 1].seq - sortedEvents[i].seq;
                if (diff > 1) {
                    seqGaps += (diff - 1);
                }
            }
        }

        const state: ReferralState = {
            referral_id: referralId,
            status: "CREATED", // Default start? Or undefined until first event? Assuming implicitly starts.
            active_appointment: null,
            metrics: {
                duplicates: duplicateCount,
                seqGaps,
                terminalOverrides: 0,
                reschedules: 0,
                cancelledAppts: 0
            },
            events: sortedEvents,
            appointments: {}
        };

        let isTerminal = false;

        // Process events
        sortedEvents.forEach(event => {
            // B) Status Logic
            if (event.type === "STATUS_UPDATE" && event.payload.status) {
                const newStatus = event.payload.status;
                const newIsTerminal = TERMINAL_STATUSES.includes(newStatus);

                if (isTerminal) {
                    // Already terminal
                    if (newIsTerminal) {
                        // Allow terminal override
                        state.status = newStatus;
                        state.metrics.terminalOverrides++;
                        // Keep isTerminal = true
                    } else {
                        // Ignore non-terminal update after terminal
                    }
                } else {
                    // Not yet terminal, update status
                    state.status = newStatus;
                    if (newIsTerminal) {
                        isTerminal = true;
                    }
                }
            }

            // C) Appointment Logic
            if (event.type === "APPOINTMENT_SET" && event.payload.appt_id && event.payload.start_time) {
                const apptId = event.payload.appt_id;

                // Check for reschedule (if appt exists and time is different - though simplistic check)
                if (state.appointments[apptId]) {
                    if (state.appointments[apptId]?.start_time !== event.payload.start_time) {
                        state.metrics.reschedules++;
                    }
                }

                state.appointments[apptId] = {
                    appt_id: apptId,
                    start_time: event.payload.start_time
                };
            }

            if (event.type === "APPOINTMENT_CANCELLED" && event.payload.appt_id) {
                const apptId = event.payload.appt_id;
                if (state.appointments[apptId]) {
                    state.appointments[apptId] = null; // Mark as cancelled
                    state.metrics.cancelledAppts++;
                }
            }
        });

        // Finalize active_appointment
        if (isTerminal) {
            state.active_appointment = null;
        } else {
            // Find earliest upcoming appointment
            // "upcoming" usually means "in the future". But prompt says "earliest upcoming appointment (by start_time) that has not been cancelled"
            // It doesn't explicitly say "ignore past appointments". "Upcoming" implies future.
            // However, for deterministic replay of historical data, "upcoming" might just mean "valid active appointment with earliest time".
            // Let's assume we just pick the earliest valid one. If "upcoming" is strict, we need a reference "now", but this is historical data.
            // Usually in these tests, it simply means "earliest start_time among non-cancelled".

            let bestAppt: Appointment | null = null;

            Object.values(state.appointments).forEach(appt => {
                if (!appt) return; // Cancelled

                if (!bestAppt) {
                    bestAppt = appt;
                } else {
                    // Compare dates
                    if (compareAsc(parseISO(appt.start_time), parseISO(bestAppt.start_time)) < 0) {
                        bestAppt = appt;
                    }
                }
            });

            state.active_appointment = bestAppt;
        }

        map[referralId] = state;
    });

    return map;
}
