/**
 * @file server/src/api/auth.ts
 * @description Authentication routes - login and user profile endpoints
 */

import { Router, Request, Response } from "express";
import { authenticate } from "../services/authz.js";

const authRouter = Router();

// Firebase Auth REST API endpoint
const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY || "AIzaSyA_1w-hAjWxJsUdfdImSj3FRtVxSono_gc";

// POST /auth/login - Sign in and get token (for Swagger testing)
authRouter.post("/login", async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ message: "Email and password required" });
        return;
    }

    try {
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

authRouter.get("/me", authenticate, (req: Request, res: Response) => {
    // req.user is populated by authenticate middleware
    if (!req.user) {
        res.status(401).json({ message: "Not authenticated" });
        return;
    }

    res.json({
        uid: req.user.uid,
        email: req.user.email,
        role: req.user.role
    });
});

export { authRouter };

