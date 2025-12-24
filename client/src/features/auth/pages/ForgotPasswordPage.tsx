/**
 * @file client/src/features/auth/pages/ForgotPasswordPage.tsx
 * @description Password reset request page with email input form
 *
 * @responsibility
 *   - Owns: Forgot password form UI, email validation
 *   - Does NOT own: Password reset API call implementation
 *
 * @lastReviewed 2024-12-24
 */

import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/shared/ui/primitives/button";
import { Input } from "@/shared/ui/primitives/input";
import { Card, CardContent } from "@/shared/ui/primitives/card";
import {
    Mail,
    Loader2,
    CheckCircle2,
    AlertCircle,
    ArrowLeft,
    KeyRound
} from "lucide-react";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [emailValid, setEmailValid] = useState(false);

    const validateEmail = (value: string) => {
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        setEmailValid(isValid);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!email) {
            setError("Please enter your email address");
            return;
        }

        if (!validateEmail(email)) {
            setError("Please enter a valid email address");
            return;
        }

        setIsLoading(true);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        setIsLoading(false);
        setSuccess(true);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
            {/* Ambient Mesh Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Top right glow */}
                <div
                    className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20 blur-3xl"
                    style={{ background: "hsl(217, 91%, 60%)" }}
                />
                {/* Bottom left glow */}
                <div
                    className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full opacity-30 blur-3xl"
                    style={{ background: "hsl(var(--primary))" }}
                />
            </div>

            {/* Back Button */}
            <Link
                href="/login"
                className="absolute top-6 left-6 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 text-muted-foreground hover:text-foreground hover:bg-card transition-all shadow-sm"
            >
                <ArrowLeft className="h-5 w-5" />
            </Link>

            {/* Main Content */}
            <div className="relative z-10 w-full max-w-md px-6">
                {/* Icon */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border border-primary/20 mb-6 shadow-lg shadow-primary/10">
                        <KeyRound className="w-10 h-10 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground mb-3">
                        Forgot Password?
                    </h1>
                    <p className="text-muted-foreground leading-relaxed">
                        Don't worry! It happens. Please enter the email address associated with your account.
                    </p>
                </div>

                {/* Card */}
                <Card className="border border-border/50 bg-card/80 backdrop-blur-sm shadow-xl">
                    <CardContent className="p-8">
                        {success ? (
                            /* Success State */
                            <div className="text-center py-6">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
                                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                                </div>
                                <h3 className="text-lg font-semibold text-foreground mb-2">
                                    Check Your Email
                                </h3>
                                <p className="text-sm text-muted-foreground mb-6">
                                    We've sent a password reset link to<br />
                                    <span className="font-medium text-foreground">{email}</span>
                                </p>
                                <Link href="/login">
                                    <Button className="w-full h-12">
                                        Back to Login
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            /* Form State */
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
                                            placeholder="Enter your email"
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

                                {/* Error Message */}
                                {error && (
                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                                        <AlertCircle className="h-4 w-4 shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base shadow-lg shadow-primary/25 transition-all"
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        "Send Reset Link"
                                    )}
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>

                {/* Footer */}
                {!success && (
                    <p className="text-center text-sm text-muted-foreground mt-6">
                        Remember your password?{" "}
                        <Link
                            href="/login"
                            className="font-medium text-primary hover:text-primary/80 transition-colors"
                        >
                            Sign In
                        </Link>
                    </p>
                )}
            </div>
        </div>
    );
}
