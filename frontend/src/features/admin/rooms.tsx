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
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Pencil, Trash2, BedDouble, Users as UsersIcon } from "lucide-react";
import type { RoomWithDetails } from "@/types";

const fmt = (n: number) => `Rp ${new Intl.NumberFormat("id-ID").format(n)}`;

const statusConfig: Record<string, string> = {
  available: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  occupied: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  maintenance: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
};

interface RoomFormState {
  name: string;
  number: string;
  floor: string;
  price: string;
  capacity: string;
  description: string;
  categoryId: string;
  facilityIds: string[];
  status: string;
}

const emptyForm: RoomFormState = {
  name: "", number: "", floor: "1", price: "", capacity: "1",
  description: "", categoryId: "", facilityIds: [], status: "available",
};

export default function AdminRooms() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomWithDetails | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState<RoomFormState>(emptyForm);

  const { data, isLoading, error } = useQuery<{
    rooms: RoomWithDetails[];
    categories: { id: string; name: string }[];
    facilities: { id: string; name: string; icon: string | null }[];
  }>({
    queryKey: ["admin-rooms", search, statusFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search) params.set("search", search);
      return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rooms?${params}`).then((r) => r.json()).then((j) => j.data);
    },
  });

  const rooms = data?.rooms ?? [];
  const categories = data?.categories ?? [];
  const facilities = data?.facilities ?? [];

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rooms`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: (res) => {
      if (res.success) { toast.success("Room created"); queryClient.invalidateQueries({ queryKey: ["admin-rooms"] }); closeDialog(); }
      else toast.error(res.error || "Failed");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rooms`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: (res) => {
      if (res.success) { toast.success("Room updated"); queryClient.invalidateQueries({ queryKey: ["admin-rooms"] }); closeDialog(); }
      else toast.error(res.error || "Failed");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rooms?id=${id}`, { method: "DELETE" }).then((r) => r.json()),
    onSuccess: (res) => {
      if (res.success) { toast.success("Room deleted"); queryClient.invalidateQueries({ queryKey: ["admin-rooms"] }); setDeleteOpen(false); setDeletingId(null); }
      else toast.error(res.error || "Failed");
    },
  });

  function closeDialog() {
    setDialogOpen(false);
    setEditingRoom(null);
    setForm(emptyForm);
  }

  function openCreate() {
    setEditingRoom(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(room: RoomWithDetails) {
    setEditingRoom(room);
    setForm({
      name: room.name,
      number: room.number,
      floor: String(room.floor),
      price: String(room.price),
      capacity: String(room.capacity),
      description: room.description || "",
      categoryId: room.category?.id || "",
      facilityIds: room.facilities.map((f) => f.id),
      status: room.status,
    });
    setDialogOpen(true);
  }

  function handleSubmit() {
    const body: Record<string, unknown> = {
      name: form.name,
      number: form.number,
      floor: parseInt(form.floor) || 1,
      price: parseFloat(form.price) || 0,
      capacity: parseInt(form.capacity) || 1,
      description: form.description || undefined,
      categoryId: form.categoryId || undefined,
      facilityIds: form.facilityIds,
      status: form.status,
    };
    if (editingRoom) {
      body.id = editingRoom.id;
      updateMutation.mutate(body);
    } else {
      createMutation.mutate(body);
    }
  }

  const toggleFacility = (id: string) => {
    setForm((prev) => ({
      ...prev,
      facilityIds: prev.facilityIds.includes(id)
        ? prev.facilityIds.filter((f) => f !== id)
        : [...prev.facilityIds, id],
    }));
  };

  const filtered = rooms;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error) {
    return <Card className="border-red-200 dark:border-red-900"><CardContent className="p-6 text-center text-red-600">Failed to load rooms.</CardContent></Card>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search rooms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={openCreate} className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Plus className="h-4 w-4 mr-2" />Add Room
        </Button>
      </div>

      {/* Status Tabs */}
      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="available">Available</TabsTrigger>
          <TabsTrigger value="occupied">Occupied</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Desktop Table */}
      <div className="hidden md:block">
        <Card className="border rounded-xl shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Room</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Floor</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tenants</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No rooms found</TableCell></TableRow>
              ) : (
                filtered.map((room) => (
                  <TableRow key={room.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <BedDouble className="h-4 w-4 text-emerald-600" />
                        <span>{room.name}</span>
                        <span className="text-xs text-muted-foreground">#{room.number}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{room.category?.name || "—"}</TableCell>
                    <TableCell className="text-sm">{room.floor}</TableCell>
                    <TableCell className="text-sm">{fmt(room.price)}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusConfig[room.status] ?? ""}`}>
                        {room.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{room._count.tenants}/{room.capacity}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(room)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => { setDeletingId(room.id); setDeleteOpen(true); }}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
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
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No rooms found</div>
        ) : (
          filtered.map((room) => (
            <motion.div key={room.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}>
              <Card className="border rounded-xl shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <BedDouble className="h-4 w-4 text-emerald-600" />
                        <span className="font-medium">{room.name}</span>
                        <span className="text-xs text-muted-foreground">#{room.number}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{room.category?.name || "No category"} · Floor {room.floor}</p>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusConfig[room.status] ?? ""}`}>
                      {room.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-sm">
                      <span className="font-semibold">{fmt(room.price)}</span>
                      <span className="text-muted-foreground flex items-center gap-1">
                        <UsersIcon className="h-3.5 w-3.5" />{room._count.tenants}/{room.capacity}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(room)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => { setDeletingId(room.id); setDeleteOpen(true); }}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) closeDialog(); else setDialogOpen(true); }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRoom ? "Edit Room" : "Add New Room"}</DialogTitle>
            <DialogDescription>
              {editingRoom ? "Update room details below." : "Fill in the details to create a new room."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="room-name">Room Name</Label>
                <Input id="room-name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Room A1" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="room-number">Room Number</Label>
                <Input id="room-number" value={form.number} onChange={(e) => setForm((p) => ({ ...p, number: e.target.value }))} placeholder="e.g. 101" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="room-floor">Floor</Label>
                <Input id="room-floor" type="number" min={1} value={form.floor} onChange={(e) => setForm((p) => ({ ...p, floor: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="room-price">Price</Label>
                <Input id="room-price" type="number" min={0} value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} placeholder="1500000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="room-capacity">Capacity</Label>
                <Input id="room-capacity" type="number" min={1} value={form.capacity} onChange={(e) => setForm((p) => ({ ...p, capacity: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.categoryId} onValueChange={(v) => setForm((p) => ({ ...p, categoryId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="room-desc">Description</Label>
              <Textarea id="room-desc" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Room description..." rows={2} />
            </div>
            {editingRoom && (
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm((p) => ({ ...p, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            {facilities.length > 0 && (
              <div className="space-y-2">
                <Label>Facilities</Label>
                <div className="grid grid-cols-2 gap-2">
                  {facilities.map((f) => (
                    <label key={f.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox
                        checked={form.facilityIds.includes(f.id)}
                        onCheckedChange={() => toggleFacility(f.id)}
                      />
                      {f.name}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending || !form.name || !form.number}
            >
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : editingRoom ? "Update Room" : "Create Room"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Room</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this room? This action cannot be undone. Rooms with active tenants cannot be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => deletingId && deleteMutation.mutate(deletingId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}