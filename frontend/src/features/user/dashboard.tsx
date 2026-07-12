"use client";
import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BedDouble, CreditCard, AlertTriangle, Megaphone, ArrowRight } from "lucide-react";
import { format } from "date-fns";

const fmt = (n: number) => new Intl.NumberFormat("id-ID").format(n);

export default function UserDashboard() {
  const { user } = useAppStore();
  const { data, isLoading } = useQuery({ queryKey: ["user-dashboard"], queryFn: () => fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard`).then(r => r.json()) });
  const d = data?.data;
  const tenant = d?.tenant;
  const room = tenant?.room;

  if (isLoading) return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>;

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold tracking-tight">Welcome back, {user?.name || "Tenant"}</h2><p className="text-muted-foreground">Here&apos;s your dashboard overview</p></div>

      {tenant?.room ? (
        <Card className="border-emerald-200 dark:border-emerald-900">
          <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-lg"><BedDouble className="h-5 w-5 text-emerald-600" />My Room</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3 text-sm">
              <div><span className="text-muted-foreground">Room</span><p className="font-medium">{room.name} ({room.number})</p></div>
              <div><span className="text-muted-foreground">Category</span><p className="font-medium">{room.category?.name || "Standard"}</p></div>
              <div><span className="text-muted-foreground">Monthly Rent</span><p className="font-medium">Rp {fmt(room.price)}</p></div>
            </div>
            {room.facilities?.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{room.facilities.map((f: any) => <Badge key={f.facilityId || f.name} variant="secondary" className="text-xs">{f.facility?.name || f.name}</Badge>)}</div>}
          </CardContent>
        </Card>
      ) : (
        <Card><CardContent className="py-8 text-center text-muted-foreground">You don&apos;t have an assigned room yet.</CardContent></Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card><CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><CreditCard className="h-4 w-4 text-emerald-600" />Upcoming Payments</CardTitle></CardHeader>
          <CardContent>{!d?.upcomingPayments?.length ? <p className="text-sm text-muted-foreground">No upcoming payments</p> : d.upcomingPayments.map((p: any) => (
            <div key={p.id} className="flex items-center justify-between py-2 border-b last:border-0">
              <div><p className="text-sm font-medium">{format(new Date(p.year, p.month - 1), "MMMM yyyy")}</p><p className="text-xs text-muted-foreground">Due: {format(new Date(p.dueDate), "MMM dd")}</p></div>
              <Badge variant={p.status === "overdue" ? "destructive" : "secondary"}>Rp {fmt(p.amount)}</Badge>
            </div>
          ))}</CardContent></Card>

        <Card><CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><AlertTriangle className="h-4 w-4 text-amber-500" />My Complaints</CardTitle></CardHeader>
          <CardContent>{!d?.complaints?.length ? <p className="text-sm text-muted-foreground">No complaints</p> : d.complaints.slice(0, 4).map((c: any) => (
            <div key={c.id} className="flex items-center justify-between py-2 border-b last:border-0">
              <div><p className="text-sm font-medium">{c.title}</p><p className="text-xs text-muted-foreground">{c.category}</p></div>
              <Badge variant="secondary" className={c.status === "resolved" ? "bg-emerald-100 text-emerald-700" : c.status === "open" ? "bg-amber-100 text-amber-700" : ""}>{c.status}</Badge>
            </div>
          ))}</CardContent></Card>
      </div>

      <Card><CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><Megaphone className="h-4 w-4 text-emerald-600" />Latest Announcements</CardTitle></CardHeader>
        <CardContent>{!d?.announcements?.length ? <p className="text-sm text-muted-foreground">No announcements</p> : d.announcements.map((a: any) => (
          <div key={a.id} className="py-3 border-b last:border-0"><p className="text-sm font-medium">{a.title}</p><p className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.content}</p><p className="text-xs text-muted-foreground mt-1">{a.publishedAt ? format(new Date(a.publishedAt), "MMM dd, yyyy") : ""}</p></div>
        ))}</CardContent>
      </Card>
    </div>
  );
}