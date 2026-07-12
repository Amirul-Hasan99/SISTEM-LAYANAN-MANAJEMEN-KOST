"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, UserMinus, Users } from "lucide-react";
import { format, parseISO } from "date-fns";
import type { TenantWithDetails, RoomWithDetails } from "@/types";

const statusConfig: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  inactive: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

interface AddTenantForm {
  userId: string;
  roomId: string;
  moveInDate: string;
  monthlyRent: string;
}

export default function AdminTenants() {
  const queryClient = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [moveOutOpen, setMoveOutOpen] = useState(false);
  const [moveOutId, setMoveOutId] = useState<string | null>(null);
  const [form, setForm] = useState<AddTenantForm>({ userId: "", roomId: "", moveInDate: new Date().toISOString().split("T")[0], monthlyRent: "" });

  const { data: tenants, isLoading, error } = useQuery<TenantWithDetails[]>({
    queryKey: ["admin-tenants"],
    queryFn: () => fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tenants`).then((r) => r.json()).then((j) => j.data),
  });

  const { data: usersData } = useQuery<{ id: string; email: string; profile: { name: string | null } | null }[]>({
    queryKey: ["users-for-tenant"],
    queryFn: () => fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`).then((r) => r.json()).then((j) => j.data),
  });

  const { data: roomsData } = useQuery<{ rooms: RoomWithDetails[] }>({
    queryKey: ["available-rooms"],
    queryFn: () => fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rooms?status=available`).then((r) => r.json()).then((j) => j.data),
  });

  // Users that don't have a tenant record
  const tenantUserIds = new Set(tenants?.map((t) => t.user.id));
  const availableUsers = (usersData ?? []).filter((u) => !tenantUserIds.has(u.id));
  const availableRooms = roomsData?.rooms ?? [];

  const addMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tenants`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: (res) => {
      if (res.success) { toast.success("Tenant added"); queryClient.invalidateQueries({ queryKey: ["admin-tenants"] }); closeAdd(); }
      else toast.error(res.error || "Failed");
    },
  });

  const moveOutMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tenants`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, moveOutDate: new Date().toISOString(), status: "inactive" }) }).then((r) => r.json()),
    onSuccess: (res) => {
      if (res.success) { toast.success("Tenant moved out"); queryClient.invalidateQueries({ queryKey: ["admin-tenants"] }); setMoveOutOpen(false); setMoveOutId(null); }
      else toast.error(res.error || "Failed");
    },
  });

  function closeAdd() {
    setAddOpen(false);
    setForm({ userId: "", roomId: "", moveInDate: new Date().toISOString().split("T")[0], monthlyRent: "" });
  }

  function handleAdd() {
    addMutation.mutate({
      userId: form.userId,
      roomId: form.roomId || undefined,
      moveInDate: form.moveInDate,
      monthlyRent: parseFloat(form.monthlyRent) || 0,
    });
  }

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-10 w-48" /><Skeleton className="h-96 w-full" /></div>;
  }

  if (error) {
    return <Card className="border-red-200 dark:border-red-900"><CardContent className="p-6 text-center text-red-600">Failed to load tenants.</CardContent></Card>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{tenants?.length ?? 0} tenants total</span>
        </div>
        <Button onClick={() => setAddOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Plus className="h-4 w-4 mr-2" />Add Tenant
        </Button>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block">
        <Card className="border rounded-xl shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Move-in Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(!tenants || tenants.length === 0) ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No tenants found</TableCell></TableRow>
              ) : (
                tenants.map((t) => (
                  <TableRow key={t.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{t.user.profile?.name || "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{t.user.email}</TableCell>
                    <TableCell className="text-sm">{t.room ? `${t.room.name} (${t.room.number})` : "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {t.moveInDate ? format(parseISO(t.moveInDate), "dd MMM yyyy") : "—"}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusConfig[t.status] ?? ""}`}>
                        {t.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {t.status === "active" && (
                        <Button
                          variant="ghost" size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => { setMoveOutId(t.id); setMoveOutOpen(true); }}
                        >
                          <UserMinus className="h-3.5 w-3.5 mr-1" />Move Out
                        </Button>
                      )}
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
        {(!tenants || tenants.length === 0) ? (
          <div className="text-center py-12 text-muted-foreground">No tenants found</div>
        ) : (
          tenants.map((t) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}>
              <Card className="border rounded-xl shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium">{t.user.profile?.name || "—"}</p>
                      <p className="text-sm text-muted-foreground">{t.user.email}</p>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusConfig[t.status] ?? ""}`}>
                      {t.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {t.room ? `${t.room.name} (${t.room.number})` : "No room assigned"}
                      {t.moveInDate && ` · ${format(parseISO(t.moveInDate), "dd MMM yyyy")}`}
                    </div>
                    {t.status === "active" && (
                      <Button variant="ghost" size="sm" className="text-red-500 h-7 text-xs" onClick={() => { setMoveOutId(t.id); setMoveOutOpen(true); }}>
                        <UserMinus className="h-3 w-3 mr-1" />Move Out
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Add Tenant Dialog */}
      <Dialog open={addOpen} onOpenChange={(open) => { if (!open) closeAdd(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Tenant</DialogTitle>
            <DialogDescription>Assign a user as tenant and optionally assign a room.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label>User</Label>
              <Select value={form.userId} onValueChange={(v) => setForm((p) => ({ ...p, userId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select a user" /></SelectTrigger>
                <SelectContent>
                  {availableUsers.map((u) => (
                    <SelectItem key={u.id} value={u.id}>{u.profile?.name || u.email}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {availableUsers.length === 0 && (
                <p className="text-xs text-muted-foreground">All registered users already have tenant records.</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Room (optional)</Label>
              <Select value={form.roomId} onValueChange={(v) => setForm((p) => ({ ...p, roomId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select a room" /></SelectTrigger>
                <SelectContent>
                  {availableRooms.map((r) => (
                    <SelectItem key={r.id} value={r.id}>{r.name} ({r.number}) — Rp {new Intl.NumberFormat("id-ID").format(r.price)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="move-in">Move-in Date</Label>
                <Input id="move-in" type="date" value={form.moveInDate} onChange={(e) => setForm((p) => ({ ...p, moveInDate: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthly-rent">Monthly Rent</Label>
                <Input id="monthly-rent" type="number" min={0} value={form.monthlyRent} onChange={(e) => setForm((p) => ({ ...p, monthlyRent: e.target.value }))} placeholder="1500000" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeAdd}>Cancel</Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleAdd}
              disabled={addMutation.isPending || !form.userId}
            >
              {addMutation.isPending ? "Adding..." : "Add Tenant"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move Out Dialog */}
      <Dialog open={moveOutOpen} onOpenChange={setMoveOutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Move Out</DialogTitle>
            <DialogDescription>
              Are you sure this tenant is moving out? The room will be marked as available. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMoveOutOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => moveOutId && moveOutMutation.mutate(moveOutId)}
              disabled={moveOutMutation.isPending}
            >
              {moveOutMutation.isPending ? "Processing..." : "Confirm Move Out"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}