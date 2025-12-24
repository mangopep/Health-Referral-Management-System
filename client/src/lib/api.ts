/**
 * File: client/src/lib/api.ts
 * Responsibility: HTTP client that injects Firebase auth token into API requests
 * Used by: client/src/app/providers/AuthProvider.tsx, client/src/app/providers/ReferralsProvider.tsx
 * Side effects: No - pure function, no global state
 * Notes: API_BASE_URL is /api (proxied in dev, rewritten in prod via Firebase Hosting)
 */

import { auth } from "@/lib/firebase";

const API_BASE_URL = "/api";

export async function apiClient<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const user = auth.currentUser;
    const token = user ? await user.getIdToken() : null;

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        if (response.status === 401) {
            console.warn("Unauthorized request");
        }
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.message || `API Error: ${response.statusText}`);
    }

    return response.json();
}
