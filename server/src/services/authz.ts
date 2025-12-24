/**
 * @file server/src/services/authz.ts
 * @description Authentication/authorization middleware with Firebase token verification
 *
 * @responsibility
 *   - Owns: Token verification, role extraction, request user injection
 *   - Does NOT own: Route definitions, business logic
 *
 * @lastReviewed 2024-12-24
 */

import { Request, Response, NextFunction } from "express";
import { auth, db } from "./firebase.js";

// Extend Express Request
declare global {
    namespace Express {
        interface Request {
            user?: {
                uid: string;
                email?: string;
                role?: "admin" | "viewer";
            };
        }
    }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
        res.status(401).json({ message: "Unauthorized: Missing Bearer Token" });
        return;
    }

    const token = authHeader.split("Bearer ")[1];

    try {
        const decodedToken = await auth.verifyIdToken(token);

        // Fetch User Role from Firestore (Role Based Access Control)
        // We trust the token for authentication, but rely on DB for Authorization (Role)
        // For optimization, we could include role in Custom Claims, but for now DB lookup is safer/easier.
        const userDoc = await db.collection("organizations").doc("default").collection("users").doc(decodedToken.uid).get();
        const userData = userDoc.data();

        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            role: userData?.role || "viewer" // Default to Viewer if no role assigned
        };

        next();
    } catch (error: any) {
        console.error("Auth Error:", error);
        // Expose underlying error for debugging (safe enough for dev, maybe sanitize for prod)
        res.status(401).json({ message: `Unauthorized: ${error.message}` });
        return;
    }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    // Standardize on lowercase 'admin'
    if (req.user?.role !== "admin") {
        res.status(403).json({ message: "Forbidden: Admins Only" });
        return;
    }
    next();
};
