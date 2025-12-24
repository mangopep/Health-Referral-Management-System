/**
 * @file client/src/app/layouts/DashboardLayout.tsx
 * @description Main dashboard layout with responsive sidebar, navigation, and theme toggle
 *
 * @responsibility
 *   - Owns: Navigation structure, sidebar rendering, theme toggle, layout shell
 *   - Does NOT own: Individual page content, business logic, authentication state
 *
 * @dependencies wouter, lucide-react
 * @lastReviewed 2024-12-24
 */

import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  Activity,
  ChevronRight,
  PanelLeft,
  Hospital,
  Moon,
  Sun,
  Upload,
  LogOut,
  Shield,
  Eye
} from "lucide-react";
import { cn } from "@/core/utils/cn";
import { Button } from "@/shared/ui/primitives/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger
} from "@/shared/ui/primitives/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/primitives/avatar";
import { useAuth } from "@/app/providers/AuthProvider";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location, navigate] = useLocation();
  const { user, logout } = useAuth();
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Determine route prefix based on role
  const routePrefix = user?.role === "admin" ? "/admin" : "/app";

  useEffect(() => {
    setMounted(true);
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    if (!mounted) return;
    const html = document.documentElement;
    html.classList.add('theme-transition');
    html.classList.toggle('dark');
    setIsDark(!isDark);
    setTimeout(() => {
      html.classList.remove('theme-transition');
    }, 300);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Build nav items based on role
  const navItems = [
    { href: `${routePrefix}/dashboard`, label: "Dashboard", icon: LayoutDashboard },
    { href: `${routePrefix}/referrals`, label: "Referrals", icon: Users },
    { href: `${routePrefix}/data-quality`, label: "Data Quality", icon: Activity },
  ];

  // Add Upload for admin only
  if (user?.role === "admin") {
    navItems.unshift({ href: "/admin/upload", label: "Upload JSON", icon: Upload });
  }

  const NavContent = () => (
    <div className="flex flex-col h-full bg-card border-r border-border dark:bg-card dark:border-border">
      <div className="p-6 flex items-center gap-3 border-b border-border">
        <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-md">
          <Hospital className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-bold text-base leading-tight text-foreground">ReferralOps</h1>
          <p className="text-xs text-muted-foreground font-medium">Healthcare Portal</p>
        </div>
      </div>

      {/* Role Badge */}
      <div className="px-4 pt-4">
        <div className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold",
          user?.role === "admin"
            ? "bg-primary/10 text-primary border border-primary/20"
            : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
        )}>
          {user?.role === "admin" ? (
            <Shield className="h-3.5 w-3.5" />
          ) : (
            <Eye className="h-3.5 w-3.5" />
          )}
          {user?.role === "admin" ? "ADMIN" : "VIEWER"}
        </div>
      </div>

      <div className="flex-1 px-3 py-4 space-y-1">
        <p className="px-3 text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Navigation</p>
        {navItems.map((item) => {
          const isActive = location === item.href ||
            (item.href !== `${routePrefix}/dashboard` && location.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "group flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-foreground/70 hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
                {isActive && <ChevronRight className="ml-auto h-3 w-3" />}
              </div>
            </Link>
          );
        })}
      </div>

      {/* User Info + Logout */}
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-9 w-9 border border-border">
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{user?.name || "User"}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="w-full gap-2 text-muted-foreground hover:text-destructive hover:border-destructive/50"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 shrink-0 fixed inset-y-0 z-50">
        <NavContent />
      </div>

      {/* Mobile Sidebar */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50 md:hidden">
              <PanelLeft className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 border-r-0">
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-card border-b border-border h-16 flex items-center px-6 justify-end">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-foreground"
              title={isDark ? "Light Mode" : "Dark Mode"}
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
