/**
 * File: server/src/services/firebase.ts
 * Responsibility: Initialize Firebase Admin SDK with ADC-first strategy
 * Used by: server/src/services/authz.ts, server/src/api/uploads.ts, server/src/api/referrals.ts
 * Side effects: Yes - initializes Firebase Admin singleton on import
 * Notes: Production uses ADC automatically. Local dev uses GOOGLE_APPLICATION_CREDENTIALS env var.
 */

import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync, existsSync } from "fs";

// Project ID required for token verification
const PROJECT_ID = "dashboard-b9ee6";

// Initialize Firebase Admin
if (getApps().length === 0) {
    // Cloud Functions/Cloud Run: ADC available automatically
    const isCloudEnvironment = process.env.FUNCTION_TARGET ||
        process.env.K_SERVICE ||
        process.env.GOOGLE_CLOUD_PROJECT;

    if (isCloudEnvironment) {
        initializeApp({ projectId: PROJECT_ID });
        console.log("Firebase Admin initialized with ADC (cloud environment)");
    } else {
        // Local dev: Use GOOGLE_APPLICATION_CREDENTIALS env var
        const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

        if (serviceAccountPath && existsSync(serviceAccountPath)) {
            try {
                const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf-8"));
                initializeApp({ credential: cert(serviceAccount), projectId: PROJECT_ID });
                console.log("Firebase Admin initialized from GOOGLE_APPLICATION_CREDENTIALS");
            } catch (e) {
                console.error("Failed to load service account:", e);
                initializeApp({ projectId: PROJECT_ID });
                console.log("Firebase Admin initialized with ADC (fallback)");
            }
        } else {
            // gcloud auth application-default login
            initializeApp({ projectId: PROJECT_ID });
            console.log("Firebase Admin initialized with ADC");
        }
    }
}

export const auth = getAuth();
export const db = getFirestore();
db.settings({ ignoreUndefinedProperties: true });
