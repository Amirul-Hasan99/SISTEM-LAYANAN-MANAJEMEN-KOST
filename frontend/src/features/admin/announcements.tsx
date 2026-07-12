"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Pencil, Trash2, MoreVertical, Eye, EyeOff, Megaphone } from "lucide-react";
import { format, parseISO } from "date-fns";
import type { AnnouncementItem } from "@/types";

const categoryColors: Record<string, string> = {
  general: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  payment: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  maintenance: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  security: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  event: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
  policy: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-400",
};

const priorityColors: Record<string, string> = {
  high: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  normal: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  low: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500",
};

interface AnnouncementForm {
  title: string;
  content: string;
  category: string;
  priority: string;
  isPublished: boolean;
}

const emptyForm: AnnouncementForm = {
  title: "", content: "", category: "general", priority: "normal", isPublished: false,
};

export default function AdminAnnouncements() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AnnouncementItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState<AnnouncementForm>(emptyForm);

  const { data: announcements, isLoading, error } = useQuery<AnnouncementItem[]>({
    queryKey: ["admin-announcements"],
    queryFn: () => fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/announcements?all=true`).then((r) => r.json()).then((j) => j.data),
  });

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/announcements`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: (res) => {
      if (res.success) { toast.success("Announcement created"); queryClient.invalidateQueries({ queryKey: ["admin-announcements"] }); closeDialog(); }
      else toast.error(res.error || "Failed");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/announcements`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: (res) => {
      if (res.success) { toast.success("Announcement updated"); queryClient.invalidateQueries({ queryKey: ["admin-announcements"] }); closeDialog(); }
      else toast.error(res.error || "Failed");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/announcements?id=${id}`, { method: "DELETE" }).then((r) => r.json()),
    onSuccess: (res) => {
      if (res.success) { toast.success("Announcement deleted"); queryClient.invalidateQueries({ queryKey: ["admin-announcements"] }); setDeleteOpen(false); setDeletingId(null); }
      else toast.error(res.error || "Failed");
    },
  });

  const togglePublishMutation = useMutation({
    mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) =>
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/announcements`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, isPublished }) }).then((r) => r.json()),
    onSuccess: (res) => {
      if (res.success) { toast.success(res.data.isPublished ? "Announcement published" : "Announcement unpublished"); queryClient.invalidateQueries({ queryKey: ["admin-announcements"] }); }
      else toast.error(res.error || "Failed");
    },
  });

  function closeDialog() {
    setDialogOpen(false);
    setEditingItem(null);
    setForm(emptyForm);
  }

  function openCreate() {
    setEditingItem(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(a: AnnouncementItem) {
    setEditingItem(a);
    setForm({
      title: a.title,
      content: a.content,
      category: a.category,
      priority: a.priority,
      isPublished: a.isPublished,
    });
    setDialogOpen(true);
  }

  function handleSubmit() {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, ...form });
    } else {
      createMutation.mutate(form);
    }
  }

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-10 w-64" /><Skeleton className="h-96 w-full" /></div>;
  }

  if (error) {
    return <Card className="border-red-200 dark:border-red-900"><CardContent className="p-6 text-center text-red-600">Failed to load announcements.</CardContent></Card>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Megaphone className="h-4 w-4" />
          <span>{announcements?.length ?? 0} announcements</span>
        </div>
        <Button onClick={openCreate} className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Plus className="h-4 w-4 mr-2" />New Announcement
        </Button>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block">
        <Card className="border rounded-xl shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Published</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(!announcements || announcements.length === 0) ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No announcements found</TableCell></TableRow>
              ) : (
                announcements.map((a) => (
                  <TableRow key={a.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium max-w-[240px] truncate">{a.title}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${categoryColors[a.category] ?? categoryColors.general}`}>
                        {a.category}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${priorityColors[a.priority] ?? ""}`}>
                        {a.priority}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost" size="sm"
                        className={`h-7 text-xs ${a.isPublished ? "text-emerald-600 hover:text-emerald-700" : "text-muted-foreground"}`}
                        onClick={() => togglePublishMutation.mutate({ id: a.id, isPublished: !a.isPublished })}
                        disabled={togglePublishMutation.isPending}
                      >
                        {a.isPublished ? <Eye className="h-3.5 w-3.5 mr-1" /> : <EyeOff className="h-3.5 w-3.5 mr-1" />}
                        {a.isPublished ? "Published" : "Draft"}
                      </Button>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {a.publishedAt ? format(parseISO(a.publishedAt), "dd MMM yyyy") : format(parseISO(a.createdAt), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(a)}>
                            <Pencil className="h-4 w-4 mr-2" />Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => togglePublishMutation.mutate({ id: a.id, isPublished: !a.isPublished })}>
                            {a.isPublished ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                            {a.isPublished ? "Unpublish" : "Publish"}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => { setDeletingId(a.id); setDeleteOpen(true); }}>
                            <Trash2 className="h-4 w-4 mr-2" />Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {(!announcements || announcements.length === 0) ? (
          <div className="text-center py-12 text-muted-foreground">No announcements found</div>
        ) : (
          announcements.map((a) => (
            <motion.div key={a.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}>
              <Card className="border rounded-xl shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{a.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${categoryColors[a.category] ?? categoryColors.general}`}>
                          {a.category}
                        </span>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${priorityColors[a.priority] ?? ""}`}>
                          {a.priority}
                        </span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                          <MoreVertical className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(a)}><Pencil className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => togglePublishMutation.mutate({ id: a.id, isPublished: !a.isPublished })}>
                          {a.isPublished ? "Unpublish" : "Publish"}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => { setDeletingId(a.id); setDeleteOpen(true); }}>
                          <Trash2 className="h-4 w-4 mr-2" />Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{a.publishedAt ? format(parseISO(a.publishedAt), "dd MMM yyyy") : format(parseISO(a.createdAt), "dd MMM yyyy")}</span>
                    <Button
                      variant="ghost" size="sm"
                      className={`h-6 text-[11px] px-2 ${a.isPublished ? "text-emerald-600" : "text-muted-foreground"}`}
                      onClick={() => togglePublishMutation.mutate({ id: a.id, isPublished: !a.isPublished })}
                    >
                      {a.isPublished ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
                      {a.isPublished ? "Published" : "Draft"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) closeDialog(); }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Announcement" : "New Announcement"}</DialogTitle>
            <DialogDescription>
              {editingItem ? "Update announcement details." : "Create a new announcement for tenants."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="ann-title">Title</Label>
              <Input id="ann-title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Announcement title" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ann-content">Content</Label>
              <Textarea id="ann-content" value={form.content} onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))} placeholder="Write announcement content..." rows={5} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="payment">Payment</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="policy">Policy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={(v) => setForm((p) => ({ ...p, priority: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch id="ann-publish" checked={form.isPublished} onCheckedChange={(v) => setForm((p) => ({ ...p, isPublished: v }))} />
              <Label htmlFor="ann-publish" className="text-sm">Publish immediately</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending || !form.title || !form.content}
            >
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : editingItem ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Announcement</DialogTitle>
            <DialogDescription>Are you sure you want to delete this announcement? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deletingId && deleteMutation.mutate(deletingId)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}