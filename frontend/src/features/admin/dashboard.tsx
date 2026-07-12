"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { BedDouble, TrendingUp, DollarSign, AlertCircle } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import type { DashboardStats, PaymentWithDetails, ComplaintWithDetails, RevenueData } from "@/types";

const fmt = (n: number) => `Rp ${new Intl.NumberFormat("id-ID").format(n)}`;

function StatusBadge({ status }: { status: string }) {
  const cls: Record<string, string> = {
    paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
    pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
    overdue: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
    rejected: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400",
    open: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
    in_progress: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
    resolved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${cls[status] ?? "bg-slate-100 text-slate-700"}`}>
      {status.replace("_", " ")}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const cls: Record<string, string> = {
    high: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
    medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
    low: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${cls[priority] ?? ""}`}>
      {priority}
    </span>
  );
}

export default function AdminDashboard() {
  const { data, isLoading, error } = useQuery<{
    stats: DashboardStats;
    revenueHistory: RevenueData[];
    recentPayments: PaymentWithDetails[];
    recentComplaints: ComplaintWithDetails[];
  }>({
    queryKey: ["admin-dashboard"],
    queryFn: () => fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard`).then((r) => r.json()).then((j) => j.data),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
          ))}
        </div>
        <Card><CardContent className="p-6"><Skeleton className="h-72 w-full" /></CardContent></Card>
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className="border-red-200 dark:border-red-900">
        <CardContent className="p-6 text-center text-red-600 dark:text-red-400">
          Failed to load dashboard data. Please try again later.
        </CardContent>
      </Card>
    );
  }

  const { stats, revenueHistory, recentPayments, recentComplaints } = data;

  const statCards = [
    { label: "Total Rooms", value: stats.totalRooms, sub: `${stats.availableRooms} available`, icon: BedDouble, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/50" },
    { label: "Occupancy Rate", value: `${stats.occupancyRate}%`, sub: `${stats.occupiedRooms} occupied`, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/50" },
    { label: "Monthly Revenue", value: fmt(stats.totalRevenue), sub: "This year", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/50" },
    { label: "Pending Actions", value: stats.pendingPayments + stats.openComplaints, sub: `${stats.pendingPayments} payments, ${stats.openComplaints} complaints`, icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/50" },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="border rounded-xl shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
                    <p className="text-2xl font-bold tracking-tight">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.sub}</p>
                  </div>
                  <div className={`rounded-xl p-3 ${s.bg}`}>
                    <Icon className={`h-5 w-5 ${s.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Revenue Chart */}
      <Card className="border rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Revenue Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {revenueHistory && revenueHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revenueHistory} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <defs>
                  <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" tickFormatter={(v: number) => `${(v / 1000000).toFixed(1)}M`} />
                <RechartsTooltip
                  formatter={(value: number) => [fmt(value), "Revenue"]}
                  contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", backgroundColor: "hsl(var(--card))" }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#059669" strokeWidth={2} fill="url(#emeraldGradient)" />
                <Area type="monotone" dataKey="target" stroke="#d1d5db" strokeWidth={1.5} strokeDasharray="5 5" fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">No revenue data available</div>
          )}
        </CardContent>
      </Card>

      {/* Recent Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <Card className="border rounded-xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            {recentPayments && recentPayments.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentPayments.map((p: PaymentWithDetails) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium text-sm">
                        {p.tenant?.user?.profile?.name || p.tenant?.user?.email || "—"}
                      </TableCell>
                      <TableCell className="text-sm">{fmt(p.amount)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {p.paidDate ? format(new Date(p.paidDate), "dd MMM") : format(new Date(p.dueDate), "dd MMM")}
                      </TableCell>
                      <TableCell><StatusBadge status={p.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-sm text-muted-foreground">No recent payments</div>
            )}
          </CardContent>
        </Card>

        {/* Recent Complaints */}
        <Card className="border rounded-xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Recent Complaints</CardTitle>
          </CardHeader>
          <CardContent>
            {recentComplaints && recentComplaints.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentComplaints.map((c: ComplaintWithDetails) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium text-sm max-w-[140px] truncate">{c.title}</TableCell>
                      <TableCell className="text-sm">
                        {c.tenant?.user?.profile?.name || c.tenant?.user?.email || "—"}
                      </TableCell>
                      <TableCell><PriorityBadge priority={c.priority} /></TableCell>
                      <TableCell><StatusBadge status={c.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-sm text-muted-foreground">No recent complaints</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}