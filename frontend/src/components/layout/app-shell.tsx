"use client";

import { useAppStore } from "@/lib/store";
import { useTheme } from "next-themes";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard, BedDouble, Users, CreditCard, MessageSquareWarning,
  Megaphone, UserCog, BarChart3, Settings, ScrollText, LogOut,
  Menu, Bell, Moon, Sun, ChevronLeft, Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet, SheetContent, SheetTrigger,
} from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { AppPage } from "@/types";

const adminNav: { icon: typeof LayoutDashboard; label: string; page: AppPage }[] = [
  { icon: LayoutDashboard, label: "Dashboard", page: "admin-dashboard" },
  { icon: BedDouble, label: "Kamar", page: "admin-rooms" },
  { icon: Users, label: "Penyewa", page: "admin-tenants" },
  { icon: CreditCard, label: "Pembayaran", page: "admin-payments" },
  { icon: MessageSquareWarning, label: "Pengaduan", page: "admin-complaints" },
  { icon: Megaphone, label: "Pengumuman", page: "admin-announcements" },
  { icon: UserCog, label: "Pengguna", page: "admin-users" },
  { icon: BarChart3, label: "Laporan", page: "admin-reports" },
  { icon: Settings, label: "Pengaturan", page: "admin-settings" },
  { icon: ScrollText, label: "Log Audit", page: "admin-audit-logs" },
];

const userNav: { icon: typeof LayoutDashboard; label: string; page: AppPage }[] = [
  { icon: LayoutDashboard, label: "Dashboard", page: "user-dashboard" },
  { icon: BedDouble, label: "Kamar Saya", page: "user-room" },
  { icon: CreditCard, label: "Pembayaran", page: "user-payments" },
  { icon: MessageSquareWarning, label: "Pengaduan", page: "user-complaints" },
  { icon: Megaphone, label: "Pengumuman", page: "user-announcements" },
  { icon: Bell, label: "Notifikasi", page: "user-notifications" },
  { icon: Home, label: "Profil", page: "user-profile" },
];

function NavItem({ item, collapsed }: { item: { icon: typeof LayoutDashboard; label: string; page: AppPage }; collapsed: boolean }) {
  const { currentPage, setCurrentPage } = useAppStore();
  const isActive = currentPage === item.page;
  const Icon = item.icon;

  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <button
          onClick={() => setCurrentPage(item.page)}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 w-full text-left",
            isActive
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <Icon className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="truncate">{item.label}</span>}
        </button>
      </TooltipTrigger>
      {collapsed && <TooltipContent side="right">{item.label}</TooltipContent>}
    </Tooltip>
  );
}

function Sidebar({ collapsed, nav }: { collapsed: boolean; nav: typeof adminNav }) {
  const { user } = useAppStore();
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-5">
        <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
          K
        </div>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            className="font-semibold text-base whitespace-nowrap overflow-hidden"
          >
            Kost Pak Mun Cepoko
          </motion.span>
        )}
      </div>
      <Separator />
      <ScrollArea className="flex-1 px-3 py-3">
        <nav className="flex flex-col gap-1">
          {nav.map((item) => (
            <NavItem key={item.page} item={item} collapsed={collapsed} />
          ))}
        </nav>
      </ScrollArea>
      <Separator />
      <div className="px-3 py-3">
        <button
          onClick={() => useAppStore.getState().logout()}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-150 w-full text-left"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Keluar</span>}
        </button>
      </div>
    </div>
  );
}

function MobileSidebar({ nav }: { nav: typeof adminNav }) {
  const { currentPage, setCurrentPage, user, logout } = useAppStore();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <div className="flex items-center gap-2 px-4 py-5">
          <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
            K
          </div>
          <span className="font-semibold text-base">Kost Pak Mun Cepoko</span>
        </div>
        <Separator />
        <ScrollArea className="flex-1 px-3 py-3">
          <nav className="flex flex-col gap-1">
            {nav.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.page;
              return (
                <button
                  key={item.page}
                  onClick={() => { setCurrentPage(item.page); }}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all w-full text-left",
                    isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </ScrollArea>
        <Separator />
        <div className="px-3 py-3">
          <button
            onClick={logout}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all w-full text-left"
          >
            <LogOut className="h-4 w-4" />
            <span>Keluar</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Header() {
  const { user, currentPage, setCurrentPage } = useAppStore();
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();

  const { data: notifData } = useQuery({
    queryKey: ["notifications-count"],
    queryFn: () => fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications`).then((r) => r.json()),
    refetchInterval: 30000,
  });
  const unreadCount = (notifData?.data?.unreadCount as number) || 0;

  const nav = user?.role === "admin" ? adminNav : userNav;
  const currentLabel = nav.find((n) => n.page === currentPage)?.label || "Dashboard";

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6">
      <MobileSidebar nav={nav} />

      <div className="flex-1">
        <h1 className="text-lg font-semibold hidden sm:block">{currentLabel}</h1>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {user?.role === "user" && (
          <Button variant="ghost" size="icon" className="relative" onClick={() => setCurrentPage("user-notifications")}>
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] bg-emerald-600 text-white border-0">
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="h-7 w-7">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="text-xs bg-emerald-100 text-emerald-700">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:inline text-sm font-medium max-w-[120px] truncate">{user?.name || user?.email}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>{user?.name || user?.email}</DropdownMenuLabel>
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">{user?.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setCurrentPage(user?.role === "admin" ? "admin-settings" : "user-profile")}>
              <Settings className="mr-2 h-4 w-4" />Pengaturan
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => useAppStore.getState().logout()} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, sidebarOpen, setSidebarOpen } = useAppStore();
  const nav = user?.role === "admin" ? adminNav : userNav;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside
        className={cn(
          "hidden md:flex flex-col border-r bg-card transition-all duration-300",
          sidebarOpen ? "w-60" : "w-[60px]"
        )}
      >
        <Sidebar collapsed={!sidebarOpen} nav={nav} />
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={useAppStore.getState().currentPage}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="max-w-7xl mx-auto"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <Button
        variant="outline"
        size="icon"
        className="hidden md:flex absolute bottom-4 left-[calc(var(--sidebar-width,240px)-16px)] z-10 h-7 w-7 rounded-full"
        style={{ left: sidebarOpen ? "calc(240px - 16px)" : "calc(60px - 16px)" }}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <ChevronLeft className={cn("h-3.5 w-3.5 transition-transform", !sidebarOpen && "rotate-180")} />
      </Button>
    </div>
  );
}