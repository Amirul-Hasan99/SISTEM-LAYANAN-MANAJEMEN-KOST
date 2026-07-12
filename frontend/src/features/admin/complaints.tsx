"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { MessageSquare, Send, ChevronDown, ChevronUp, MessageSquareWarning, Eye, EyeOff } from "lucide-react";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import type { ComplaintWithDetails } from "@/types";

const priorityConfig: Record<string, string> = {
  high: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  low: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

const statusConfig: Record<string, string> = {
  open: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  in_progress: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  resolved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
};

const categoryLabels: Record<string, string> = {
  maintenance: "Maintenance",
  facility: "Facility",
  disturbance: "Disturbance",
  cleanliness: "Cleanliness",
  security: "Security",
  general: "General",
};

export default function AdminComplaints() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState<ComplaintWithDetails | null>(null);
  const [newStatus, setNewStatus] = useState("");

  const params = new URLSearchParams();
  if (statusFilter !== "all") params.set("status", statusFilter);

  const { data: complaints, isLoading, error } = useQuery<ComplaintWithDetails[]>({
    queryKey: ["admin-complaints", statusFilter],
    queryFn: () => fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/complaints?${params}`).then((r) => r.json()).then((j) => j.data),
  });

  const replyMutation = useMutation({
    mutationFn: ({ id, comment, isInternal: internal }: { id: string; comment: string; isInternal: boolean }) =>
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/complaints`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, comment, isInternal: internal }) }).then((r) => r.json()),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Reply added");
        setReplyText("");
        queryClient.invalidateQueries({ queryKey: ["admin-complaints"] });
      } else toast.error(res.error || "Failed");
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/complaints`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) }).then((r) => r.json()),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Status updated");
        queryClient.invalidateQueries({ queryKey: ["admin-complaints"] });
        setStatusDialogOpen(false);
        setStatusTarget(null);
      } else toast.error(res.error || "Failed");
    },
  });

  function handleReply(complaintId: string) {
    if (!replyText.trim()) return;
    replyMutation.mutate({ id: complaintId, comment: replyText.trim(), isInternal });
  }

  function openStatusDialog(c: ComplaintWithDetails) {
    setStatusTarget(c);
    setNewStatus(c.status);
    setStatusDialogOpen(true);
  }

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-10 w-48" /><Skeleton className="h-96 w-full" /></div>;
  }

  if (error) {
    return <Card className="border-red-200 dark:border-red-900"><CardContent className="p-6 text-center text-red-600">Failed to load complaints.</CardContent></Card>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MessageSquareWarning className="h-4 w-4" />
          <span>{complaints?.length ?? 0} complaints</span>
        </div>
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Complaint List */}
      <div className="space-y-3">
        {(!complaints || complaints.length === 0) ? (
          <div className="text-center py-16">
            <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">No complaints found</p>
          </div>
        ) : (
          complaints.map((c) => {
            const isExpanded = expandedId === c.id;
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Card className="border rounded-xl shadow-sm overflow-hidden">
                  {/* Complaint Header */}
                  <button
                    className="w-full text-left p-4 md:p-5 hover:bg-muted/30 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : c.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-medium text-sm md:text-base">{c.title}</h3>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${priorityConfig[c.priority] ?? ""}`}>
                            {c.priority}
                          </span>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${statusConfig[c.status] ?? ""}`}>
                            {c.status.replace("_", " ")}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">{c.description}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span>{c.tenant?.user?.profile?.name || c.tenant?.user?.email || "Unknown"}</span>
                          <span>·</span>
                          <span>{categoryLabels[c.category] || c.category}</span>
                          {c.room && <span>· {c.room.name}</span>}
                          <span>·</span>
                          <span>{formatDistanceToNow(parseISO(c.createdAt), { addSuffix: true })}</span>
                          {c._count.comments > 0 && (
                            <>
                              <span>·</span>
                              <span className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />{c._count.comments}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="shrink-0 mt-1">
                        {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                      </div>
                    </div>
                  </button>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Separator />
                        <div className="p-4 md:p-5 space-y-4">
                          {/* Actions */}
                          <div className="flex flex-wrap items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openStatusDialog(c)}
                            >
                              Update Status
                            </Button>
                            <span className="text-xs text-muted-foreground">
                              Created {format(parseISO(c.createdAt), "dd MMM yyyy, HH:mm")}
                              {c.resolvedAt && ` · Resolved ${format(parseISO(c.resolvedAt), "dd MMM yyyy")}`}
                            </span>
                          </div>

                          {/* Description */}
                          <p className="text-sm whitespace-pre-wrap">{c.description}</p>
                          {c.imageUrl && (
                            <div className="mt-2">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={c.imageUrl} alt="Complaint" className="rounded-lg max-h-64 object-cover border" />
                            </div>
                          )}

                          {/* Comments */}
                          {c.comments && c.comments.length > 0 && (
                            <div className="space-y-3">
                              <h4 className="text-sm font-medium">Comments ({c.comments.length})</h4>
                              <ScrollArea className="max-h-64">
                                <div className="space-y-3 pr-2">
                                  {c.comments.map((comment) => (
                                    <div key={comment.id} className="flex gap-3">
                                      <Avatar className="h-7 w-7 shrink-0">
                                        <AvatarFallback className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                                          {comment.user?.profile?.name?.charAt(0)?.toUpperCase() || "A"}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm font-medium">{comment.user?.profile?.name || "Admin"}</span>
                                          {comment.isInternal && (
                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-amber-300 text-amber-600 dark:border-amber-700 dark:text-amber-400">
                                              Internal
                                            </Badge>
                                          )}
                                          <span className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(parseISO(comment.createdAt), { addSuffix: true })}
                                          </span>
                                        </div>
                                        <p className="text-sm mt-0.5">{comment.content}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </ScrollArea>
                            </div>
                          )}

                          {/* Reply Form */}
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Label htmlFor={`reply-${c.id}`} className="text-sm font-medium">Reply</Label>
                              <div className="flex items-center gap-2 ml-auto">
                                <Label htmlFor={`internal-${c.id}`} className="text-xs text-muted-foreground cursor-pointer">Internal note</Label>
                                <Switch id={`internal-${c.id}`} checked={isInternal} onCheckedChange={setIsInternal} />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Input
                                id={`reply-${c.id}`}
                                placeholder={isInternal ? "Write an internal note..." : "Write a reply..."}
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleReply(c.id); } }}
                              />
                              <Button
                                size="icon"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
                                onClick={() => handleReply(c.id)}
                                disabled={replyMutation.isPending || !replyText.trim()}
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                            </div>
                            {isInternal && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <EyeOff className="h-3 w-3" />This note is only visible to admins
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Update Complaint Status</DialogTitle>
            <DialogDescription>Change the status for: &ldquo;{statusTarget?.title}&rdquo;</DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Label className="text-sm">New Status</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => statusTarget && statusMutation.mutate({ id: statusTarget.id, status: newStatus })}
              disabled={statusMutation.isPending || newStatus === statusTarget?.status}
            >
              {statusMutation.isPending ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}