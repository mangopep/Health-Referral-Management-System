/**
 * @file client/src/app/App.tsx
 * @description Root application component with routing configuration and global providers
 *
 * @responsibility
 *   - Owns: Route definitions, provider composition, app shell structure
 *   - Does NOT own: Individual page logic, business rules, UI primitives
 *
 * @dependencies wouter, @tanstack/react-query
 * @lastReviewed 2024-12-24
 */

import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "@/core/config/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/shared/ui/primitives/toaster";
import { TooltipProvider } from "@/shared/ui/primitives/tooltip";
import { AuthProvider, useAuth } from "@/app/providers/AuthProvider";
import { ReferralsProvider } from "@/app/providers/ReferralsProvider.tsx";
import { ProtectedRoute } from "@/app/routing/ProtectedRoute";
import NotFound from "@/app/pages/NotFoundPage";
import { DashboardLayout } from "@/app/layouts/DashboardLayout";

// Auth Pages
import LoginPage from "@/features/auth/pages/LoginPage";
import ForgotPasswordPage from "@/features/auth/pages/ForgotPasswordPage";

// Main Pages
import OverviewPage from "@/features/referrals/pages/OverviewPage";
import ReferralListPage from "@/features/referrals/pages/ReferralListPage";
import ReferralDetailPage from "@/features/referrals/pages/ReferralDetailPage";
import DataQualityPage from "@/features/referrals/pages/DataQualityPage";

// Admin Pages
import UploadPage from "@/features/admin/pages/UploadPage";

// Protected Dashboard wrapped with layout
function ProtectedDashboard({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}

// Root redirect based on auth state and role
function RootRedirect() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  if (user?.role === "admin") {
    return <Redirect to="/admin/dashboard" />;
  }

  return <Redirect to="/app/dashboard" />;
}

function Router() {
  return (
    <Switch>
      {/* Auth Routes (Public) */}
      <Route path="/login" component={LoginPage} />
      <Route path="/forgot-password" component={ForgotPasswordPage} />

      {/* Root redirect */}
      <Route path="/" component={RootRedirect} />

      {/* Admin Routes */}
      <Route path="/admin/upload">
        <ProtectedDashboard>
          <UploadPage />
        </ProtectedDashboard>
      </Route>
      <Route path="/admin/dashboard">
        <ProtectedDashboard>
          <OverviewPage />
        </ProtectedDashboard>
      </Route>
      <Route path="/admin/referrals">
        <ProtectedDashboard>
          <ReferralListPage />
        </ProtectedDashboard>
      </Route>
      <Route path="/admin/referrals/:id">
        <ProtectedDashboard>
          <ReferralDetailPage />
        </ProtectedDashboard>
      </Route>
      <Route path="/admin/data-quality">
        <ProtectedDashboard>
          <DataQualityPage />
        </ProtectedDashboard>
      </Route>

      {/* Viewer Routes */}
      <Route path="/app/dashboard">
        <ProtectedDashboard>
          <OverviewPage />
        </ProtectedDashboard>
      </Route>
      <Route path="/app/referrals">
        <ProtectedDashboard>
          <ReferralListPage />
        </ProtectedDashboard>
      </Route>
      <Route path="/app/referrals/:id">
        <ProtectedDashboard>
          <ReferralDetailPage />
        </ProtectedDashboard>
      </Route>
      <Route path="/app/data-quality">
        <ProtectedDashboard>
          <DataQualityPage />
        </ProtectedDashboard>
      </Route>

      {/* 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ReferralsProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ReferralsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

