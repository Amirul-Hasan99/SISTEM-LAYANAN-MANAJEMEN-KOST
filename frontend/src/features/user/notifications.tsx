"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, Check, CheckCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

const typeIcon: Record<string, string> = { payment: "💰", complaint: "📝", system: "⚙️", announcement: "📢" };

export default function UserNotifications() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["notifications"], queryFn: () => fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications`).then(r => r.json()) });
  const notifications = (data?.data?.notifications || []) as any[];
  const unreadCount = data?.data?.unreadCount || 0;

  const markAll = useMutation({
    mutationFn: () => fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ markAll: true }) }).then(r => r.json()),
    onSuccess: () => { toast.success("All marked as read"); qc.invalidateQueries({ queryKey: ["notifications"] }); qc.invalidateQueries({ queryKey: ["notifications-count"] }); },
  });

  const markOne = useMutation({
    mutationFn: (id: string) => fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["notifications"] }); qc.invalidateQueries({ queryKey: ["notifications-count"] }); },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold tracking-tight">Notifications</h2><p className="text-muted-foreground">{unreadCount} unread</p></div>
        {unreadCount > 0 && <Button variant="outline" size="sm" onClick={() => markAll.mutate()} disabled={markAll.isPending}><CheckCheck className="mr-2 h-4 w-4" />Mark all read</Button>}
      </div>

      {isLoading ? <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div> : !notifications.length ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground"><Bell className="h-10 w-10 mx-auto mb-3 opacity-30" />No notifications</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((n: any) => (
            <Card key={n.id} className={`transition-colors ${!n.isRead ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20" : ""}`}>
              <CardContent className="flex items-start gap-3 p-4">
                <span className="text-lg shrink-0 mt-0.5">{typeIcon[n.type] || "📋"}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm ${!n.isRead ? "font-semibold" : "font-medium"}`}>{n.title}</p>
                    {!n.isRead && <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</p>
                </div>
                {!n.isRead && <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => markOne.mutate(n.id)}><Check className="h-3.5 w-3.5" /></Button>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}