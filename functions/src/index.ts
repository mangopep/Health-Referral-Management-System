/**
 * File: functions/src/index.ts
 * Responsibility: Cloud Functions entry point - wraps Express app as HTTPS function
 * Used by: Firebase deploy (exports.api)
 * Side effects: Yes - initializes Firebase Admin SDK on import
 * Notes: Complete Express app with all endpoints and Swagger UI for API documentation.
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";

// Initialize Firebase Admin (uses ADC in Cloud Functions automatically)
if (admin.apps.length === 0) {
    admin.initializeApp();
}

const db = admin.firestore();
const auth = admin.auth();

// Create Express App
const app = express();

// Middleware
app.use(cors({ origin: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false }));

// OpenAPI Spec for Swagger UI (full spec matching server)
const openapiSpec = {
    openapi: "3.0.0",
    info: {
        title: "Referral Management System API",
        version: "1.0.0",
        description: "API for managing Patient Referrals with Event Sourcing. Deploy at https://dashboard-b9ee6.web.app",
    },
    servers: [
        { url: "/api", description: "Production API" }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
                description: "Firebase ID Token"
            }
        }
    },
    security: [{ bearerAuth: [] }],
    paths: {
        "/health": {
            get: {
                summary: "Health Check",
                description: "Check if the API server is running",
                operationId: "healthCheck",
                security: [],
                responses: {
                    "200": {
                        description: "Server is healthy",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "ok" },
                                        mode: { type: "string", example: "cloud-functions" }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "/auth/login": {
            post: {
                summary: "Login (Get Token)",
                description: "Sign in with email/password and receive a Firebase ID token. Copy this token and use it in the Authorize button.",
                operationId: "login",
                security: [],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["email", "password"],
                                properties: {
                                    email: { type: "string", example: "admin@example.com" },
                                    password: { type: "string", example: "admin123" }
                                }
                            }
                        }
                    }
                },
                responses: {
                    "200": {
                        description: "Login successful - copy the idToken",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        idToken: { type: "string", description: "Use this token in Authorize" },
                                        email: { type: "string" },
                                        expiresIn: { type: "string" }
                                    }
                                }
                            }
                        }
                    },
                    "401": { description: "Invalid credentials" }
                }
            }
        },
        "/auth/me": {
            get: {
                summary: "Get Current User",
                description: "Get the current authenticated user's profile and role",
                operationId: "getCurrentUser",
                responses: {
                    "200": {
                        description: "Current authenticated user details",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        uid: { type: "string" },
                                        email: { type: "string" },
                                        role: { type: "string", enum: ["admin", "viewer"] }
                                    }
                                }
                            }
                        }
                    },
                    "401": { description: "Unauthorized" }
                }
            }
        },
        "/uploads": {
            post: {
                summary: "Upload Events JSON (Admin Only)",
                description: "Admin only. Uploads a raw events array to be reconciled and stored.",
                operationId: "uploadEvents",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        referral_id: { type: "string", example: "ref_001" },
                                        seq: { type: "integer", example: 1 },
                                        type: { type: "string", enum: ["STATUS_UPDATE", "APPOINTMENT_SET", "APPOINTMENT_CANCELLED"] },
                                        payload: { type: "object" }
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    "200": {
                        description: "Upload processed successfully",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        uploadId: { type: "string" },
                                        processed: { type: "integer" },
                                        referrals: { type: "integer" }
                                    }
                                }
                            }
                        }
                    },
                    "401": { description: "Unauthorized" },
                    "403": { description: "Admin access required" }
                }
            }
        },
        "/referrals": {
            get: {
                summary: "List Referrals",
                description: "Get all reconciled referrals",
                operationId: "listReferrals",
                responses: {
                    "200": {
                        description: "List of referrals",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        referrals: {
                                            type: "array",
                                            items: {
                                                type: "object",
                                                properties: {
                                                    referral_id: { type: "string" },
                                                    status: { type: "string" },
                                                    active_appointment: { type: "object", nullable: true }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    "401": { description: "Unauthorized" }
                }
            }
        },
        "/referrals/{id}": {
            get: {
                summary: "Get Referral Detail",
                description: "Get detailed information about a specific referral",
                operationId: "getReferral",
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: { type: "string" },
                        description: "Referral ID"
                    }
                ],
                responses: {
                    "200": {
                        description: "Referral detail",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        referral_id: { type: "string" },
                                        status: { type: "string" },
                                        active_appointment: { type: "object", nullable: true },
                                        events: { type: "array", items: { type: "object" } },
                                        metrics: { type: "object" }
                                    }
                                }
                            }
                        }
                    },
                    "404": { description: "Referral not found" },
                    "401": { description: "Unauthorized" }
                }
            }
        }
    }
};

// Swagger UI
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openapiSpec, {
    customSiteTitle: "Referral API Docs",
    customCss: ".swagger-ui .topbar { display: none }"
}));

// Health endpoint
app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", mode: "cloud-functions" });
});

// Firebase API Key for Auth REST API
const FIREBASE_API_KEY = "AIzaSyA_1w-hAjWxJsUdfdImSj3FRtVxSono_gc";

// Auth - Login (for Swagger testing)
app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ message: "Email and password required" });
            return;
        }

        // Use Firebase Auth REST API to sign in
        const response = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    password,
                    returnSecureToken: true
                })
            }
        );

        const data = await response.json() as any;

        if (!response.ok) {
            res.status(401).json({
                message: data.error?.message || "Authentication failed"
            });
            return;
        }

        res.json({
            idToken: data.idToken,
            refreshToken: data.refreshToken,
            expiresIn: data.expiresIn,
            email: data.email,
            message: "Copy the idToken and paste it in Swagger Authorize (Bearer token)"
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Auth - Get current user
app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const token = authHeader.split("Bearer ")[1];
        const decoded = await auth.verifyIdToken(token);

        // Get user role from Firestore
        const userDoc = await db
            .collection("organizations")
            .doc("default")
            .collection("users")
            .doc(decoded.uid)
            .get();

        const userData = userDoc.data();

        res.json({
            uid: decoded.uid,
            email: decoded.email,
            role: userData?.role || "viewer"
        });
    } catch (error) {
        console.error("Auth Error:", error);
        res.status(401).json({ message: "Unauthorized" });
    }
});

// Referrals - List all
app.get("/api/referrals", async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const token = authHeader.split("Bearer ")[1];
        await auth.verifyIdToken(token);

        const snapshot = await db
            .collection("organizations")
            .doc("default")
            .collection("referrals")
            .limit(100)
            .get();

        const referrals = snapshot.docs.map(doc => ({
            referral_id: doc.id,
            ...doc.data()
        }));

        res.json({ referrals });
    } catch (error) {
        console.error("Referrals Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Referrals - Get single
app.get("/api/referrals/:id", async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const token = authHeader.split("Bearer ")[1];
        await auth.verifyIdToken(token);

        const doc = await db
            .collection("organizations")
            .doc("default")
            .collection("referrals")
            .doc(req.params.id)
            .get();

        if (!doc.exists) {
            res.status(404).json({ message: "Referral not found" });
            return;
        }

        res.json({
            referral_id: doc.id,
            ...doc.data()
        });
    } catch (error) {
        console.error("Referral Detail Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Uploads - Admin only
app.post("/api/uploads", async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const token = authHeader.split("Bearer ")[1];
        const decoded = await auth.verifyIdToken(token);

        // Check admin role
        const userDoc = await db
            .collection("organizations")
            .doc("default")
            .collection("users")
            .doc(decoded.uid)
            .get();

        if (userDoc.data()?.role !== "admin") {
            res.status(403).json({ message: "Admin access required" });
            return;
        }

        const events = req.body;
        if (!Array.isArray(events)) {
            res.status(400).json({ message: "Expected array of events" });
            return;
        }

        // Generate upload ID
        const uploadId = Math.random().toString(36).substring(2, 15);
        const timestamp = new Date().toISOString();

        // --- INLINED RECONCILIATION LOGIC (to match server/src/domain/reconcile.ts) ---
        // We need to calculate duplicateCount, seqGaps, terminalOverrides, etc.

        const referralMap: Record<string, any> = {};
        const eventsByReferral: Record<string, any[]> = {};
        const TERMINAL_STATUSES = ["COMPLETED", "CANCELLED"];

        // Group events
        events.forEach(event => {
            if (!eventsByReferral[event.referral_id]) {
                eventsByReferral[event.referral_id] = [];
            }
            eventsByReferral[event.referral_id].push(event);
        });

        // Process each referral
        Object.keys(eventsByReferral).forEach(referralId => {
            const rawEvents = eventsByReferral[referralId];

            // 1. Deduplicate
            const uniqueEventsMap = new Map<number, any>();
            let duplicateCount = 0;
            rawEvents.forEach(event => {
                if (uniqueEventsMap.has(event.seq)) {
                    duplicateCount++;
                } else {
                    uniqueEventsMap.set(event.seq, event);
                }
            });
            const sortedEvents = Array.from(uniqueEventsMap.values()).sort((a, b) => a.seq - b.seq);

            // 2. Seq Gaps
            let seqGaps = 0;
            if (sortedEvents.length > 0) {
                for (let i = 0; i < sortedEvents.length - 1; i++) {
                    const diff = sortedEvents[i + 1].seq - sortedEvents[i].seq;
                    if (diff > 1) seqGaps += (diff - 1);
                }
            }

            // 3. State & Metrics
            const state: any = {
                referral_id: referralId,
                status: "CREATED",
                active_appointment: null,
                metrics: {
                    duplicates: duplicateCount,
                    seqGaps: seqGaps,
                    terminalOverrides: 0,
                    reschedules: 0,
                    cancelledAppts: 0
                },
                events: sortedEvents,
                appointments: {}
            };

            let isTerminal = false;

            // Replay events
            sortedEvents.forEach(event => {
                // Status Logic
                if (event.type === "STATUS_UPDATE" && event.payload?.status) {
                    const newStatus = event.payload.status;
                    const newIsTerminal = TERMINAL_STATUSES.includes(newStatus);

                    if (isTerminal) {
                        if (newIsTerminal) {
                            state.status = newStatus;
                            state.metrics.terminalOverrides++;
                        }
                    } else {
                        state.status = newStatus;
                        if (newIsTerminal) isTerminal = true;
                    }
                }

                // Appointment Logic
                if (event.type === "APPOINTMENT_SET" && event.payload?.appt_id && event.payload?.start_time) {
                    const apptId = event.payload.appt_id;
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

                if (event.type === "APPOINTMENT_CANCELLED" && event.payload?.appt_id) {
                    const apptId = event.payload.appt_id;
                    if (state.appointments[apptId]) {
                        state.appointments[apptId] = null;
                        state.metrics.cancelledAppts++;
                    }
                }
            });

            // Finalize active_appointment
            if (isTerminal) {
                state.active_appointment = null;
            } else {
                // Find earliest upcoming (simple check)
                let bestAppt: any = null;
                Object.values(state.appointments).forEach((appt: any) => {
                    if (!appt) return;
                    if (!bestAppt) bestAppt = appt;
                    else {
                        if (new Date(appt.start_time) < new Date(bestAppt.start_time)) {
                            bestAppt = appt;
                        }
                    }
                });
                state.active_appointment = bestAppt;
            }

            // Add metadata
            state.lastUpdated = timestamp;
            state.lastUploadId = uploadId;

            referralMap[referralId] = state;
        });

        // Calculate Aggregate Metrics
        const referrals = Object.values(referralMap);
        const metrics = {
            total: referrals.length,
            completed: referrals.filter(r => r.status === "COMPLETED").length,
            cancelled: referrals.filter(r => r.status === "CANCELLED").length,
            inProgress: referrals.filter(r => !["COMPLETED", "CANCELLED"].includes(r.status)).length,
            scheduled: referrals.filter(r => !["COMPLETED", "CANCELLED"].includes(r.status) && r.active_appointment).length,
            noAppointment: referrals.filter(r => !["COMPLETED", "CANCELLED"].includes(r.status) && !r.active_appointment).length
        };

        // --- END RECONCILIATION ---

        // Save to Firestore
        const batch = db.batch();

        // 1. Save Metrics
        const metricsRef = db.collection("organizations").doc("default").collection("metrics").doc(uploadId);
        batch.set(metricsRef, {
            ...metrics,
            timestamp,
            uploadId
        });

        // 2. Save Upload Meta
        const uploadRef = db.collection("organizations").doc("default").collection("uploads").doc(uploadId);
        batch.set(uploadRef, {
            id: uploadId,
            timestamp,
            eventCount: events.length,
            referralCount: referrals.length,
            status: "COMPLETED",
            metrics
        });

        // 3. Save Referrals
        Object.values(referralMap).forEach((referral: any) => {
            const ref = db
                .collection("organizations")
                .doc("default")
                .collection("referrals")
                .doc(referral.referral_id);
            batch.set(ref, referral, { merge: true });

            // Allow saving events subcollection if needed, but for dashboard the referral doc is key
        });
        await batch.commit();

        res.json({
            uploadId,
            processed: events.length,
            referrals: Object.keys(referralMap).length,
            message: "Events processed and saved successfully"
        });
    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Server Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
});

// Export as Cloud Function
export const api = functions.https.onRequest(app);
