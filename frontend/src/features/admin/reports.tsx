"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { DollarSign, Home, MessageSquareWarning, CreditCard } from "lucide-react";

const fmt = (n: number) => `Rp ${new Intl.NumberFormat("id-ID").format(n)}`;

const PIE_COLORS = ["#059669", "#d97706", "#dc2626", "#6b7280", "#8b5cf6", "#0891b2", "#c026d3", "#ea580c"];

const statusColors: Record<string, string> = {
  paid: "bg-emerald-500",
  pending: "bg-amber-500",
  overdue: "bg-red-500",
  rejected: "bg-slate-400",
  open: "bg-red-500",
  in_progress: "bg-amber-500",
  resolved: "bg-emerald-500",
};

export default function AdminReports() {
  const { data: revenueData, isLoading: revLoading } = useQuery<{ month: string; revenue: number; payments: number }[]>({
    queryKey: ["report-revenue"],
    queryFn: () => fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports?type=revenue`).then((r) => r.json()).then((j) => j.data),
  });

  const { data: occupancyData, isLoading: occLoading } = useQuery<{ floor: string; total: number; occupied: number; rate: number }[]>({
    queryKey: ["report-occupancy"],
    queryFn: () => fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports?type=occupancy`).then((r) => r.json()).then((j) => j.data),
  });

  const { data: complaintsData, isLoading: compLoading } = useQuery<{
    byCategory: { category: string; _count: number }[];
    byStatus: { status: string; _count: number }[];
  }>({
    queryKey: ["report-complaints"],
    queryFn: () => fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports?type=complaints`).then((r) => r.json()).then((j) => j.data),
  });

  const { data: paymentsData, isLoading: payLoading } = useQuery<{
    status: string;
    _count: number;
    _sum: { amount: number | null };
  }[]>({
    queryKey: ["report-payments"],
    queryFn: () => fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports?type=payments`).then((r) => r.json()).then((j) => j.data),
  });

  const loading = revLoading || occLoading || compLoading || payLoading;

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="revenue">
        <TabsList>
          <TabsTrigger value="revenue" className="gap-1.5">
            <DollarSign className="h-3.5 w-3.5" />Revenue
          </TabsTrigger>
          <TabsTrigger value="occupancy" className="gap-1.5">
            <Home className="h-3.5 w-3.5" />Occupancy
          </TabsTrigger>
          <TabsTrigger value="complaints" className="gap-1.5">
            <MessageSquareWarning className="h-3.5 w-3.5" />Complaints
          </TabsTrigger>
          <TabsTrigger value="payments" className="gap-1.5">
            <CreditCard className="h-3.5 w-3.5" />Payments
          </TabsTrigger>
        </TabsList>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="mt-6">
          <Card className="border rounded-xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Monthly Revenue (Last 12 Months)</CardTitle>
            </CardHeader>
            <CardContent>
              {revenueData && revenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={revenueData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                    <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" tickFormatter={(v: number) => `${(v / 1000000).toFixed(1)}M`} />
                    <RechartsTooltip
                      formatter={(value: number) => [fmt(value), "Revenue"]}
                      contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", backgroundColor: "hsl(var(--card))" }}
                    />
                    <Bar dataKey="revenue" fill="#059669" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">No revenue data available</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Occupancy Tab */}
        <TabsContent value="occupancy" className="mt-6">
          <Card className="border rounded-xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Occupancy by Floor</CardTitle>
            </CardHeader>
            <CardContent>
              {occupancyData && occupancyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={occupancyData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="floor" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                    <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
                    <RechartsTooltip
                      contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", backgroundColor: "hsl(var(--card))" }}
                    />
                    <Bar dataKey="total" fill="#e2e8f0" name="Total Rooms" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="occupied" fill="#059669" name="Occupied" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">No occupancy data available</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Complaints Tab */}
        <TabsContent value="complaints" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* By Category */}
            <Card className="border rounded-xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Complaints by Category</CardTitle>
              </CardHeader>
              <CardContent>
                {complaintsData?.byCategory && complaintsData.byCategory.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={complaintsData.byCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="_count"
                        nameKey="category"
                        label={({ category, _count }: { category: string; _count: number }) => `${category}: ${_count}`}
                      >
                        {complaintsData.byCategory.map((_entry, index) => (
                          <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", backgroundColor: "hsl(var(--card))" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">No complaint data available</div>
                )}
              </CardContent>
            </Card>

            {/* By Status */}
            <Card className="border rounded-xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Complaints by Status</CardTitle>
              </CardHeader>
              <CardContent>
                {complaintsData?.byStatus && complaintsData.byStatus.length > 0 ? (
                  <div className="space-y-4 mt-4">
                    {complaintsData.byStatus.map((s) => {
                      const total = complaintsData.byStatus.reduce((sum, x) => sum + x._count, 0);
                      const pct = total > 0 ? Math.round((s._count / total) * 100) : 0;
                      return (
                        <div key={s.status} className="space-y-1.5">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div className={`h-3 w-3 rounded-full ${statusColors[s.status] ?? "bg-slate-400"}`} />
                              <span className="capitalize font-medium">{s.status.replace("_", " ")}</span>
                            </div>
                            <span className="text-muted-foreground">{s._count} ({pct}%)</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${statusColors[s.status] ?? "bg-slate-400"}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">No status data available</div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="mt-6">
          {paymentsData && paymentsData.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {paymentsData.map((p) => (
                <Card key={p.status} className="border rounded-xl shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`h-3 w-3 rounded-full ${statusColors[p.status] ?? "bg-slate-400"}`} />
                      <p className="text-sm font-medium capitalize text-muted-foreground">{p.status.replace("_", " ")}</p>
                    </div>
                    <p className="text-3xl font-bold">{p._count}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {fmt(p._sum.amount ?? 0)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border rounded-xl shadow-sm">
              <CardContent className="p-6 text-center text-muted-foreground">No payment data available</CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}