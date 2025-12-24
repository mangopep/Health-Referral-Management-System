/**
 * @file client/src/app/routing/ProtectedRoute.tsx
 * @description Route guard component that enforces authentication and role-based access
 *
 * @responsibility
 *   - Owns: Auth check, role validation, redirect logic
 *   - Does NOT own: Auth state management, UI components, navigation config
 *
 * @dependencies wouter
 * @lastReviewed 2024-12-24
 */

import { ReactNode } from "react";
import { Redirect, useLocation } from "wouter";
import { useAuth, UserRole } from "@/app/providers/AuthProvider";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
    children: ReactNode;
    allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { user, isAuthenticated, isLoading } = useAuth();
    const [location] = useLocation();

    // Show loading spinner while checking auth
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Redirect to="/login" />;
    }

    // Check role permissions if specified
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        // Redirect viewer trying to access admin routes
        if (user.role === "viewer" && location.startsWith("/admin")) {
            return <Redirect to="/app/dashboard" />;
        }
        // Redirect admin trying to access viewer routes (unlikely but handled)
        if (user.role === "admin" && location.startsWith("/app")) {
            return <Redirect to="/admin/dashboard" />;
        }
    }

    return <>{children}</>;
}

// HOC for easier route wrapping
export function withAuth<P extends object>(
    Component: React.ComponentType<P>,
    allowedRoles?: UserRole[]
) {
    return function AuthenticatedComponent(props: P) {
        return (
            <ProtectedRoute allowedRoles={allowedRoles}>
                <Component {...props} />
            </ProtectedRoute>
        );
    };
}
