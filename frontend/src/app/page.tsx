"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { LandingPage } from "@/features/auth/landing-page";
import { LoginForm } from "@/features/auth/login-form";
import { RegisterForm } from "@/features/auth/register-form";
import AppShell from "@/components/layout/app-shell";
import AdminDashboard from "@/features/admin/dashboard";
import AdminRooms from "@/features/admin/rooms";
import AdminTenants from "@/features/admin/tenants";
import AdminPayments from "@/features/admin/payments";
import AdminComplaints from "@/features/admin/complaints";
import AdminAnnouncements from "@/features/admin/announcements";
import AdminUsers from "@/features/admin/users";
import AdminReports from "@/features/admin/reports";
import AdminSettings from "@/features/admin/settings";
import AdminAuditLogs from "@/features/admin/audit-logs";
import UserDashboard from "@/features/user/dashboard";
import UserRoom from "@/features/user/room";
import UserPayments from "@/features/user/payments";
import UserComplaints from "@/features/user/complaints";
import UserAnnouncements from "@/features/user/announcements";
import UserNotifications from "@/features/user/notifications";
import UserProfile from "@/features/user/profile";
import type { AppPage } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const PAGE_TRANSITION = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};

const AUTH_PAGES = new Set<AppPage>(["landing", "login", "register"]);

const PAGE_COMPONENTS: Record<string, React.ComponentType> = {
  "admin-dashboard": AdminDashboard,
  "admin-rooms": AdminRooms,
  "admin-tenants": AdminTenants,
  "admin-payments": AdminPayments,
  "admin-complaints": AdminComplaints,
  "admin-announcements": AdminAnnouncements,
  "admin-users": AdminUsers,
  "admin-reports": AdminReports,
  "admin-settings": AdminSettings,
  "admin-audit-logs": AdminAuditLogs,
  "user-dashboard": UserDashboard,
  "user-room": UserRoom,
  "user-payments": UserPayments,
  "user-complaints": UserComplaints,
  "user-announcements": UserAnnouncements,
  "user-notifications": UserNotifications,
  "user-profile": UserProfile,
};

function PageContent({ page }: { page: AppPage }) {
  const Component = PAGE_COMPONENTS[page];
  if (!Component) return null;
  return <Component />;
}

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="size-8 animate-spin rounded-full border-2 border-muted-foreground border-t-emerald-600" />
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    </div>
  );
}

function AuthPages({ currentPage }: { currentPage: AppPage }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div key={currentPage} {...PAGE_TRANSITION}>
        {currentPage === "landing" && <LandingPage />}
        {currentPage === "login" && <LoginForm />}
        {currentPage === "register" && <RegisterForm />}
      </motion.div>
    </AnimatePresence>
  );
}

export default function Home() {
  const currentPage = useAppStore((s) => s.currentPage);
  const user = useAppStore((s) => s.user);
  const isLoading = useAppStore((s) => s.isLoading);
  const setUser = useAppStore((s) => s.setUser);
  const setLoading = useAppStore((s) => s.setLoading);

  // Restore session on mount
  useEffect(() => {
    async function restoreSession() {
      try {
        const res = await fetch(`${API_URL}/api/auth/me`);
        const json = await res.json();
        if (json.success && json.data) {
          setUser(json.data);
        } else {
          setLoading(false);
        }
      } catch {
        setLoading(false);
      }
    }
    restoreSession();
  }, [setUser, setLoading]);

  // Redirect authenticated users away from auth pages
  useEffect(() => {
    if (user && AUTH_PAGES.has(currentPage)) {
      const defaultPage = user.role === "admin" ? "admin-dashboard" : "user-dashboard";
      useAppStore.getState().setCurrentPage(defaultPage);
    }
  }, [user, currentPage]);

  if (isLoading) return <LoadingScreen />;

  if (!user) return <AuthPages currentPage={currentPage} />;

  return (
    <AppShell>
      <AnimatePresence mode="wait">
        <motion.div key={currentPage} {...PAGE_TRANSITION}>
          <PageContent page={currentPage} />
        </motion.div>
      </AnimatePresence>
    </AppShell>
  );
}