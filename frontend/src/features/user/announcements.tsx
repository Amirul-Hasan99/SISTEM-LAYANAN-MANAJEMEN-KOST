"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Megaphone, Calendar, Tag } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

const catColor: Record<string, string> = { general: "bg-slate-100 text-slate-700", payment: "bg-emerald-100 text-emerald-700", maintenance: "bg-amber-100 text-amber-700", security: "bg-red-100 text-red-700", event: "bg-violet-100 text-violet-700", policy: "bg-sky-100 text-sky-700" };
const prioColor: Record<string, string> = { high: "border-l-red-500", normal: "border-l-slate-300", low: "border-l-slate-200" };

export default function UserAnnouncements() {
  const [cat, setCat] = useState("all");
  const { data, isLoading } = useQuery({ queryKey: ["announcements", cat], queryFn: () => fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/announcements${cat !== "all" ? `)?category=${cat}` : ""}`).then(r => r.json()) });
  const items = (data?.data || []) as any[];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h2 className="text-2xl font-bold tracking-tight">Announcements</h2><p className="text-muted-foreground">Stay updated with the latest news</p></div>
        <Select value={cat} onValueChange={setCat}><SelectTrigger className="w-40"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="general">General</SelectItem><SelectItem value="payment">Payment</SelectItem><SelectItem value="maintenance">Maintenance</SelectItem><SelectItem value="security">Security</SelectItem><SelectItem value="event">Event</SelectItem><SelectItem value="policy">Policy</SelectItem></SelectContent>
        </Select>
      </div>

      {isLoading ? <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}</div> : !items.length ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No announcements found.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {items.map((a: any, i: number) => (
            <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className={`border-l-4 ${prioColor[a.priority] || ""}`}>
                <CardHeader className="pb-2"><div className="flex items-start justify-between gap-2 flex-wrap">
                  <CardTitle className="text-base">{a.title}</CardTitle>
                  <div className="flex gap-1.5 shrink-0"><Badge variant="secondary" className={catColor[a.category] || ""}>{a.category}</Badge>{a.priority === "high" && <Badge variant="destructive" className="text-xs">Important</Badge>}</div>
                </div></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{a.content}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{a.publishedAt ? format(new Date(a.publishedAt), "MMMM dd, yyyy") : "Draft"}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}