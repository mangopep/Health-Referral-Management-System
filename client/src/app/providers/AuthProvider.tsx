/**
 * File: client/src/app/providers/AuthProvider.tsx
 * Responsibility: Manages global auth state, login/logout actions, user profile fetching
 * Used by: client/src/app/App.tsx, client/src/app/routing/ProtectedRoute.tsx
 * Side effects: Yes - subscribes to Firebase onAuthStateChanged, fetches user profile on login
 * Notes: Requires /api/auth/me endpoint for role fetching. User role stored in Firestore.
 */

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    User as FirebaseUser
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { apiClient } from "@/lib/api";

export type UserRole = "admin" | "viewer";

export interface User {
    uid: string;
    email: string;
    role: UserRole;
    name?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
            if (firebaseUser) {
                // Fetch internal user details (role)
                try {
                    const profile = await apiClient<User>("/auth/me");
                    setUser(profile);
                } catch (error: any) {
                    console.error("Failed to fetch user profile from API:", error);
                    // Fallback: Use Firebase user data if API fails
                    // This allows the app to work even if backend is not available
                    setUser({
                        uid: firebaseUser.uid,
                        email: firebaseUser.email || "",
                        role: "viewer", // Default to viewer if we can't fetch role
                        name: firebaseUser.displayName || undefined
                    });
                    console.warn("Using Firebase user data as fallback (role defaulted to viewer)");
                }
            } else {
                setUser(null);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        try {
            console.log("Attempting Firebase login for:", email);
            await signInWithEmailAndPassword(auth, email, password);
            console.log("Firebase login successful");
            // onAuthStateChanged will handle the rest
            return { success: true };
        } catch (error: any) {
            console.error("Login Failed", error);
            const msg = `Login failed: ${error.code || 'unknown'} - ${error.message}`;
            alert(msg); // Show full error for debugging
            return { success: false, error: msg };
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            setUser(null);
            localStorage.removeItem("referral_auth_user"); // Clean up old legacy key just in case
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
