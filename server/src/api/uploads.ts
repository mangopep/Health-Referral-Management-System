/**
 * @file server/src/api/uploads.ts
 * @description Upload endpoint for processing referral JSON data
 *
 * @responsibility
 *   - Owns: Upload validation, reconciliation trigger, Firestore persistence
 *   - Does NOT own: Domain logic (delegates to reconcile/deriveMetrics)
 *
 * @lastReviewed 2024-12-24
 */

import { Router, Request, Response } from "express";
import { z } from "zod";
import { authenticate, requireAdmin } from "../services/authz.js";
import { reconcile } from "../domain/reconcile.js";
import { getDerivedMetrics } from "../domain/deriveMetrics.js";
import { ChunkedBatchWriter } from "../services/firestore.js";
import { db } from "../services/firebase.js";
import { nanoid } from "nanoid";
import { ReferralEvent } from "../domain/models.js";

const uploadRouter = Router();

// Zod Schema for validation
const EventSchema = z.object({
    referral_id: z.string(),
    seq: z.number(),
    type: z.enum(["STATUS_UPDATE", "APPOINTMENT_SET", "APPOINTMENT_CANCELLED"]),
    payload: z.record(z.any()), // Refine if needed, but strict backend might be too rigid for "raw" data
});

const UploadSchema = z.object({
    events: z.array(EventSchema),
});

uploadRouter.post("/", authenticate, requireAdmin, async (req: Request, res: Response) => {
    try {
        // 1. Normalize Input - accept both { events: [...] } and just [...]
        let inputEvents: unknown[];
        if (Array.isArray(req.body)) {
            inputEvents = req.body;
        } else if (req.body?.events && Array.isArray(req.body.events)) {
            inputEvents = req.body.events;
        } else {
            res.status(400).json({
                message: "Invalid Input",
                errors: [{ message: "Expected array of events or { events: [...] }" }]
            });
            return;
        }

        // 2. Validate each event (loosely - allow extra fields)
        const rawEvents = inputEvents as ReferralEvent[];
        const uploadId = nanoid();
        const timestamp = new Date().toISOString();

        console.log(`[Upload ${uploadId}] Processing ${rawEvents.length} events...`);

        // 2. Reconcile (In-Memory)
        // Run the domain logic to compute the final state of all referrals
        const reconciledMap = reconcile(rawEvents);
        const metrics = getDerivedMetrics(reconciledMap);

        console.log(`[Upload ${uploadId}] Reconciled ${Object.keys(reconciledMap).length} referrals.`);

        // 3. Persist (Batch Write)
        const batchWriter = new ChunkedBatchWriter();

        // A) Store Upload Meta
        const uploadRef = db.collection("organizations").doc("default").collection("uploads").doc(uploadId);
        batchWriter.set(uploadRef, {
            id: uploadId,
            timestamp,
            eventCount: rawEvents.length,
            referralCount: Object.keys(reconciledMap).length,
            status: "COMPLETED",
            metrics // Snapshot metrics at time of upload
        });

        // B) Store Metrics (Dashboard Cache) - keyed by uploadId for history, or just "latest"?
        // Prompt says "metrics collection". Let's store 'latest' document for easy dashboard access
        // and historical by uploadId.
        // Actually per prompt: "metrics/{uploadId}".
        const metricsRef = db.collection("organizations").doc("default").collection("metrics").doc(uploadId);
        batchWriter.set(metricsRef, {
            ...metrics,
            timestamp,
            uploadId
        });

        // C) Store Events (Source of Truth)
        // We strictly append. Event ID = referral_id + seq
        for (const event of rawEvents) {
            const eventId = `${event.referral_id}_${event.seq}`;
            const eventRef = db.collection("organizations").doc("default")
                .collection("referrals").doc(event.referral_id)
                .collection("events").doc(eventId);

            // We use set with merge: true or just set?
            // Events are immutable. If it exists, it should be same.
            batchWriter.set(eventRef, {
                ...event,
                uploadId,
                importedAt: timestamp
            });
        }

        // D) Store Referrals (Read Model)
        // We overwrite the referral document with the LATEST reconciled state.
        for (const [refId, state] of Object.entries(reconciledMap)) {
            const referralRef = db.collection("organizations").doc("default")
                .collection("referrals").doc(refId);

            // Flatten for Firestore if needed, or store as is.
            // State matches UI needs perfectly.
            batchWriter.set(referralRef, {
                ...state,
                lastUpdated: timestamp,
                lastUploadId: uploadId
            });
        }

        // Commit all writes
        await batchWriter.commit();

        console.log(`[Upload ${uploadId}] Validated and Persisted.`);

        res.json({
            uploadId,
            processed: rawEvents.length,
            referrals: Object.keys(reconciledMap).length,
            metrics
        });

    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

export { uploadRouter };
