/**
 * @file server/src/api/referrals.ts
 * @description Referral API routes - list and detail endpoints
 */

import { Router, Request, Response } from "express";
import { authenticate } from "../services/authz.js";
import { db } from "../services/firebase.js";

const referralRouter = Router();

// GET /api/referrals
// List all referrals
referralRouter.get("/", authenticate, async (req: Request, res: Response) => {
    try {
        // Query the 'referrals' collection (Read Model)
        // In a real app, we'd add pagination (limit/offset) and filters here.
        const snapshot = await db.collection("organizations").doc("default")
            .collection("referrals").limit(100).get(); // Safety limit

        const referrals = snapshot.docs.map(doc => ({
            referral_id: doc.id,
            ...doc.data()
        }));

        res.json({ referrals });
    } catch (error) {
        console.error("List Referrals Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// GET /api/referrals/:id
// Get single referral detail
referralRouter.get("/:id", authenticate, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const docRef = db.collection("organizations").doc("default")
            .collection("referrals").doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            res.status(404).json({ message: "Referral not found" });
            return;
        }

        // Optional: Include event history if requested?
        // For now, return the summary state.
        // If we need events, we sub-query the 'events' collection.

        const data = doc.data();
        let events = [];

        // Check if events are embedded or needed separately.
        // Implementation plan says "events: array (subset or full history for easy display)" might be in read model.
        // But our upload logic in uploads.ts didn't explicitly embed events in the referral doc, 
        // it stored them in sub-collection "events".
        // Let's fetch them for the detail view to be robust.

        const eventsSnapshot = await docRef.collection("events").orderBy("seq", "asc").get();
        events = eventsSnapshot.docs.map(d => d.data());

        res.json({
            ...data,
            referral_id: id,
            events
        });

    } catch (error) {
        console.error("Get Referral Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

export { referralRouter };
