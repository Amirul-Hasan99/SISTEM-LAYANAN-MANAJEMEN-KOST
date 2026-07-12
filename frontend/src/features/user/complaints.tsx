"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, MessageSquare, ChevronDown, ChevronUp, Send } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";

const schema = z.object({ title: z.string().min(3), description: z.string().min(10), category: z.enum(["maintenance", "facility", "disturbance", "cleanliness", "security", "general"]) });
const priorityColor: Record<string, string> = { high: "bg-red-100 text-red-700", medium: "bg-amber-100 text-amber-700", low: "bg-slate-100 text-slate-600" };
const statusColor: Record<string, string> = { open: "bg-amber-100 text-amber-700", in_progress: "bg-blue-100 text-blue-700 dark:bg-sky-900/30 dark:text-sky-400", resolved: "bg-emerald-100 text-emerald-700" };

export default function UserComplaints() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["user-complaints"], queryFn: () => fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/complaints`).then(r => r.json()) });
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const create = useMutation({
    mutationFn: (vals: any) => fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/complaints`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(vals) }).then(r => r.json()),
    onSuccess: () => { toast.success("Complaint submitted"); qc.invalidateQueries({ queryKey: ["user-complaints"] }); setOpen(false); reset(); },
    onError: () => toast.error("Failed to submit"),
  });

  const reply = useMutation({
    mutationFn: ({ id, comment }: { id: string; comment: string }) => fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/complaints`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, comment }) }).then(r => r.json()),
    onSuccess: () => { toast.success("Reply sent"); qc.invalidateQueries({ queryKey: ["user-complaints"] }); setReplyText(""); },
    onError: () => toast.error("Failed"),
  });

  const complaints = (data?.data || []) as any[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold tracking-tight">My Complaints</h2><p className="text-muted-foreground">Track and manage your complaints</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />New Complaint</Button></DialogTrigger>
          <DialogContent><DialogHeader><DialogTitle>Submit a Complaint</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit((v) => create.mutate(v))} className="space-y-4">
              <div className="space-y-2"><Label>Title</Label><Input {...register("title")} placeholder="Brief description" />{errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}</div>
              <div className="space-y-2"><Label>Category</Label><Select defaultValue="general" onValueChange={v => {}} {...register("category")}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="maintenance">Maintenance</SelectItem><SelectItem value="facility">Facility</SelectItem><SelectItem value="disturbance">Disturbance</SelectItem><SelectItem value="cleanliness">Cleanliness</SelectItem><SelectItem value="security">Security</SelectItem><SelectItem value="general">General</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label>Description</Label><Textarea {...register("description")} rows={4} placeholder="Describe your issue in detail" />{errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}</div>
              <DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit" disabled={create.isPending}>{create.isPending ? "Submitting..." : "Submit"}</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div> : !complaints.length ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No complaints yet. Click &quot;New Complaint&quot; to submit one.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {complaints.map((c: any) => {
            const isExpanded = expanded === c.id;
            return (
              <Card key={c.id} className="overflow-hidden">
                <div className="flex items-start justify-between p-4 cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => setExpanded(isExpanded ? null : c.id)}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-sm">{c.title}</h3>
                      <Badge variant="secondary" className={statusColor[c.status] || ""}>{c.status}</Badge>
                      <Badge variant="outline" className="text-xs">{c.priority}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{c.category} · {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</p>
                  </div>
                  {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
                </div>
                <AnimatePresence>{isExpanded && (
                  <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className="border-t px-4 pb-4 pt-3 space-y-4">
                      <p className="text-sm text-muted-foreground">{c.description}</p>
                      {c.comments?.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Thread ({c.comments.length})</p>
                          {c.comments.map((cm: any) => (
                            <div key={cm.id} className={`rounded-lg p-3 text-sm ${cm.isInternal ? "bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800" : "bg-muted"}`}>
                              <div className="flex items-center gap-2 mb-1"><span className="font-medium text-xs">{cm.user?.profile?.name || "Admin"}</span>{cm.isInternal && <Badge variant="outline" className="text-[10px]">Internal</Badge>}<span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(cm.createdAt), { addSuffix: true })}</span></div>
                              <p>{cm.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      {c.status !== "resolved" && (
                        <div className="flex gap-2">
                          <Input placeholder="Write a reply..." value={replyText} onChange={e => setReplyText(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && replyText.trim()) { reply.mutate({ id: c.id, comment: replyText.trim() }); } }} />
                          <Button size="icon" onClick={() => { if (replyText.trim()) reply.mutate({ id: c.id, comment: replyText.trim() }); }} disabled={reply.isPending || !replyText.trim()}><Send className="h-4 w-4" /></Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}</AnimatePresence>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}