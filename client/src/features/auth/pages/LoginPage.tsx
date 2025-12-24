/**
 * @file client/src/features/auth/pages/LoginPage.tsx
 * @description Login page with email/password authentication form
 *
 * @responsibility
 *   - Owns: Login form UI, validation, submit handling
 *   - Does NOT own: Auth state, Firebase SDK calls (delegates to AuthProvider)
 *
 * @lastReviewed 2024-12-24
 */

import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/app/providers/AuthProvider";
import { Button } from "@/shared/ui/primitives/button";
import { Input } from "@/shared/ui/primitives/input";
import { Card, CardContent } from "@/shared/ui/primitives/card";
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    Loader2,
    CheckCircle2,
    AlertCircle,
    ArrowRight
} from "lucide-react";

export default function Login() {
    const [, navigate] = useLocation();
    const { login, isLoading, user, isAuthenticated } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [emailValid, setEmailValid] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Watch for auth state changes to redirect
    useEffect(() => {
        if (isAuthenticated && user) {
            if (user.role === "admin") {
                navigate("/admin/dashboard");
            } else {
                navigate("/app/dashboard");
            }
        }
    }, [isAuthenticated, user, navigate]);

    const validateEmail = (value: string) => {
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        setEmailValid(isValid);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!email || !password) {
            setError("Please fill in all fields");
            return;
        }

        if (!validateEmail(email)) {
            setError("Please enter a valid email address");
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await login(email, password);
            if (!result.success) {
                setError(result.error || "Login failed");
                setIsSubmitting(false);
            }
            // If success, the useEffect above will handle the redirect once user state updates
        } catch (error) {
            setError("An unexpected error occurred");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
            {/* Ambient Mesh Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Top left glow */}
                <div
                    className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-30 blur-3xl"
                    style={{ background: "hsl(var(--primary))" }}
                />
                {/* Bottom right glow */}
                <div
                    className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full opacity-20 blur-3xl"
                    style={{ background: "hsl(217, 91%, 60%)" }}
                />
                {/* Center accent */}
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl"
                    style={{ background: "hsl(var(--primary))" }}
                />
            </div>

            {/* Main Content */}
            <div className="relative z-10 w-full max-w-md px-6">
                {/* Logo & Branding */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border border-primary/20 mb-6">
                        <svg className="w-10 h-10 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                            <path d="M2 17l10 5 10-5" />
                            <path d="M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                        Referral Dashboard
                    </h1>
                    <div className="inline-flex px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                        <span className="text-xs font-semibold text-primary tracking-wider uppercase">
                            Healthcare Portal
                        </span>
                    </div>
                </div>

                {/* Login Card */}
                <Card className="border border-border/50 bg-card/80 backdrop-blur-sm shadow-xl">
                    <CardContent className="p-8">
                        <div className="text-center mb-8">
                            <h2 className="text-xl font-semibold text-foreground mb-2">
                                Welcome Back
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Enter your credentials to access your dashboard
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Email Field */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        type="email"
                                        placeholder="admin@example.com"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            validateEmail(e.target.value);
                                            if (error) setError(null);
                                        }}
                                        className="pl-12 pr-12 h-12 bg-muted/50 border-border/50 focus:border-primary/50 transition-colors"
                                    />
                                    {email && emailValid && (
                                        <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-500" />
                                    )}
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            if (error) setError(null);
                                        }}
                                        className="pl-12 pr-12 h-12 bg-muted/50 border-border/50 focus:border-primary/50 transition-colors"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Forgot Password Link */}
                            <div className="text-right">
                                <Link
                                    href="/forgot-password"
                                    className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                                >
                                    Forgot Password?
                                </Link>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={isSubmitting || isLoading}
                                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base shadow-lg shadow-primary/25 transition-all"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        Sign In
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </>
                                )}
                            </Button>
                        </form>

                        {/* Demo Credentials */}
                        <div className="mt-8 pt-6 border-t border-border/50">
                            <p className="text-xs text-muted-foreground text-center mb-3">
                                Demo Credentials
                            </p>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                                    <p className="font-semibold text-foreground mb-1">Admin</p>
                                    <p className="text-muted-foreground">admin@example.com</p>
                                    <p className="text-muted-foreground">admin123</p>
                                </div>
                                <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                                    <p className="font-semibold text-foreground mb-1">Viewer</p>
                                    <p className="text-muted-foreground">viewer@example.com</p>
                                    <p className="text-muted-foreground">viewer123</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer */}
                <p className="text-center text-xs text-muted-foreground mt-6">
                    Need help? Contact your administrator
                </p>
            </div>
        </div>
    );
}
