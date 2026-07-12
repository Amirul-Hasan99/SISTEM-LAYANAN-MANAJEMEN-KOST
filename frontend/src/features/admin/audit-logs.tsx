"use client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";

const actionColor: Record<string, string> = { create: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", update: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", delete: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", login: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300", register: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" };

export default function AuditLogs() {
  const { data, isLoading } = useQuery({ queryKey: ["audit-logs"], queryFn: () => fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/audit-logs`).then(r => r.json()) });
  const [search, setSearch] = useState("");
  const logs = ((data?.data || []) as any[]).filter((l: any) => !search || l.details?.toLowerCase().includes(search.toLowerCase()) || l.action?.includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold tracking-tight">Audit Logs</h2><p className="text-muted-foreground">Track all system activities</p></div>
      <Card><CardHeader className="pb-3"><div className="flex items-center gap-2"><Search className="h-4 w-4 text-muted-foreground" /><Input placeholder="Search logs..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" /></div></CardHeader>
        <CardContent><ScrollArea className="max-h-[600px]">
          {isLoading ? <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div> : (
            <Table><TableHeader><TableRow><TableHead>Time</TableHead><TableHead>User</TableHead><TableHead>Action</TableHead><TableHead>Entity</TableHead><TableHead>Details</TableHead></TableRow></TableHeader>
              <TableBody>{logs.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No logs found</TableCell></TableRow> : logs.map((l: any) => (
                <TableRow key={l.id}><TableCell className="whitespace-nowrap text-xs">{l.createdAt ? formatDistanceToNow(new Date(l.createdAt), { addSuffix: true }) : "-"}</TableCell>
                  <TableCell className="text-sm">{l.user?.profile?.name || l.user?.email || "System"}</TableCell>
                  <TableCell><Badge variant="secondary" className={actionColor[l.action] || ""}>{l.action}</Badge></TableCell>
                  <TableCell className="text-sm">{l.entity || "-"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{l.details || "-"}</TableCell>
                </TableRow>
              ))}</TableBody></Table>
          )}
        </ScrollArea></CardContent></Card>
    </div>
  );
}