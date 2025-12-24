/**
 * @file client/src/tests/unit/auth/AuthProvider.test.tsx
 * @description Unit tests for AuthProvider - authentication state management
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/app/providers/AuthProvider";
import * as firebaseAuth from "firebase/auth";
import * as api from "@/lib/api";

// Mock Firebase
vi.mock("firebase/auth", async () => {
    const actual = await vi.importActual("firebase/auth");
    return {
        ...actual,
        getAuth: vi.fn(),
        signInWithEmailAndPassword: vi.fn(),
        signOut: vi.fn(),
        onAuthStateChanged: vi.fn(),
    };
});

// Mock API
vi.mock("@/lib/api", () => ({
    apiClient: vi.fn(),
}));

// Test Component
function TestComponent() {
    const { user, isAuthenticated, login, logout, isLoading } = useAuth();
    if (isLoading) return <div>Loading...</div>;
    return (
        <div>
            <div data-testid="auth-status">{isAuthenticated ? "Authenticated" : "Guest"}</div>
            {user && <div data-testid="user-role">{user.role}</div>}
            <button onClick={() => login("test@example.com", "password")}>Login</button>
            <button onClick={() => logout()}>Logout</button>
        </div>
    );
}

describe("AuthProvider", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should start in loading state", () => {
        // Mock onAuthStateChanged to NOT resolve immediately (or just verify initial state)
        (firebaseAuth.onAuthStateChanged as any).mockImplementation(() => vi.fn());

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );
        expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    it("should render guest state when no user", async () => {
        (firebaseAuth.onAuthStateChanged as any).mockImplementation((auth: any, callback: any) => {
            callback(null); // No user
            return vi.fn();
        });

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId("auth-status")).toHaveTextContent("Guest");
        });
    });

    it("should fetch user profile on firebase login", async () => {
        const mockFirebaseUser = { uid: "123" };
        const mockProfile = { uid: "123", role: "admin", email: "test@example.com" };

        (firebaseAuth.onAuthStateChanged as any).mockImplementation((auth: any, callback: any) => {
            callback(mockFirebaseUser);
            return vi.fn();
        });

        (api.apiClient as any).mockResolvedValue(mockProfile);

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId("auth-status")).toHaveTextContent("Authenticated");
            expect(screen.getByTestId("user-role")).toHaveTextContent("admin");
        });
    });
});
