"use client";

import { useState, useCallback } from "react";
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
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Download, CheckCircle, XCircle, FileText, Eye, MoreVertical } from "lucide-react";
import { format, parseISO } from "date-fns";
import type { PaymentWithDetails, TenantWithDetails, RoomWithDetails } from "@/types";

const fmt = (n: number) => `Rp ${new Intl.NumberFormat("id-ID").format(n)}`;

const statusConfig: Record<string, string> = {
  paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  overdue: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  rejected: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

interface InvoiceForm {
  tenantId: string;
  month: string;
  year: string;
  amount: string;
  dueDate: string;
}

export default function AdminPayments() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [form, setForm] = useState<InvoiceForm>({
    tenantId: "", month: String(new Date().getMonth() + 1),
    year: String(new Date().getFullYear()), amount: "", dueDate: "",
  });

  const params = new URLSearchParams();
  if (statusFilter !== "all") params.set("status", statusFilter);
  if (monthFilter !== "all") params.set("month", monthFilter);
  if (yearFilter) params.set("year", yearFilter);

  const { data: payments, isLoading, error } = useQuery<PaymentWithDetails[]>({
    queryKey: ["admin-payments", statusFilter, monthFilter, yearFilter],
    queryFn: () => fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments?${params}`).then((r) => r.json()).then((j) => j.data),
  });

  const { data: tenants } = useQuery<TenantWithDetails[]>({
    queryKey: ["tenants-invoice"],
    queryFn: () => fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tenants`).then((r) => r.json()).then((j) => j.data),
  });

  const { data: rooms } = useQuery<{ rooms: RoomWithDetails[] }>({
    queryKey: ["all-rooms-invoice"],
    queryFn: () => fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rooms`).then((r) => r.json()).then((j) => j.data),
  });

  const activeTenants = (tenants ?? []).filter((t) => t.status === "active");

  const approveMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status: "paid" }) }).then((r) => r.json()),
    onSuccess: (res) => {
      if (res.success) { toast.success("Payment approved"); queryClient.invalidateQueries({ queryKey: ["admin-payments"] }); }
      else toast.error(res.error || "Failed");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status: "rejected" }) }).then((r) => r.json()),
    onSuccess: (res) => {
      if (res.success) { toast.success("Payment rejected"); queryClient.invalidateQueries({ queryKey: ["admin-payments"] }); }
      else toast.error(res.error || "Failed");
    },
  });

  const invoiceMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: (res) => {
      if (res.success) { toast.success("Invoice generated"); queryClient.invalidateQueries({ queryKey: ["admin-payments"] }); setInvoiceOpen(false); resetForm(); }
      else toast.error(res.error || "Failed");
    },
  });

  function resetForm() {
    setForm({ tenantId: "", month: String(new Date().getMonth() + 1), year: String(new Date().getFullYear()), amount: "", dueDate: "" });
  }

  function handleInvoice() {
    const tenant = activeTenants.find((t) => t.id === form.tenantId);
    if (!tenant) return;
    invoiceMutation.mutate({
      tenantId: form.tenantId,
      userId: tenant.user.id,
      roomId: tenant.room?.id,
      leaseId: tenant.lease?.[0]?.id,
      month: parseInt(form.month),
      year: parseInt(form.year),
      amount: parseFloat(form.amount) || 0,
      dueDate: form.dueDate,
    });
  }

  const exportCSV = useCallback(() => {
    if (!payments || payments.length === 0) { toast.error("No data to export"); return; }
    const header = "Tenant,Email,Room,Month,Year,Amount,Due Date,Paid Date,Status\n";
    const rows = payments.map((p) =>
      `"${p.tenant?.user?.profile?.name || ""}","${p.tenant?.user?.email || ""}","${p.room?.name || ""}","${p.month}","${p.year}","${p.amount}","${p.dueDate}","${p.paidDate || ""}","${p.status}"`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payments-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  }, [payments]);

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-10 w-64" /><Skeleton className="h-96 w-full" /></div>;
  }

  if (error) {
    return <Card className="border-red-200 dark:border-red-900"><CardContent className="p-6 text-center text-red-600">Failed to load payments.</CardContent></Card>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select value={monthFilter} onValueChange={setMonthFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Month" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Months</SelectItem>
              {monthNames.map((m, i) => (
                <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-[110px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[2024, 2025, 2026].map((y) => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportCSV}>
            <Download className="h-4 w-4 mr-2" />Export CSV
          </Button>
          <Button onClick={() => setInvoiceOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <FileText className="h-4 w-4 mr-2" />Generate Invoice
          </Button>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block">
        <Card className="border rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Month/Year</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Proof</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(!payments || payments.length === 0) ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No payments found</TableCell></TableRow>
                ) : (
                  payments.map((p) => (
                    <TableRow key={p.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium text-sm">
                        {p.tenant?.user?.profile?.name || p.tenant?.user?.email || "—"}
                      </TableCell>
                      <TableCell className="text-sm">{p.room ? `${p.room.name} (${p.room.number})` : "—"}</TableCell>
                      <TableCell className="text-sm">{monthNames[(p.month ?? 1) - 1]} {p.year}</TableCell>
                      <TableCell className="text-sm font-medium">{fmt(p.amount)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {p.dueDate ? format(parseISO(p.dueDate), "dd MMM yyyy") : "—"}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusConfig[p.status] ?? ""}`}>
                          {p.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {p.proofUrl ? (
                          <a href={p.proofUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline text-sm flex items-center gap-1">
                            <Eye className="h-3.5 w-3.5" />View
                          </a>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {p.status === "pending" && (
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 h-8"
                              onClick={() => approveMutation.mutate(p.id)}
                              disabled={approveMutation.isPending}
                            >
                              <CheckCircle className="h-3.5 w-3.5 mr-1" />Approve
                            </Button>
                            <Button
                              variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8"
                              onClick={() => rejectMutation.mutate(p.id)}
                              disabled={rejectMutation.isPending}
                            >
                              <XCircle className="h-3.5 w-3.5 mr-1" />Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {(!payments || payments.length === 0) ? (
          <div className="text-center py-12 text-muted-foreground">No payments found</div>
        ) : (
          payments.map((p) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}>
              <Card className="border rounded-xl shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm">{p.tenant?.user?.profile?.name || "—"}</p>
                      <p className="text-xs text-muted-foreground">{p.room ? `${p.room.name} (${p.room.number})` : ""}</p>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusConfig[p.status] ?? ""}`}>
                      {p.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-semibold">{fmt(p.amount)}</span>
                      <span className="text-muted-foreground ml-2">{monthNames[(p.month ?? 1) - 1]} {p.year}</span>
                    </div>
                    {p.status === "pending" && (
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" className="h-7 text-xs text-emerald-600" onClick={() => approveMutation.mutate(p.id)}>
                          <CheckCircle className="h-3 w-3 mr-1" />Approve
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 text-xs text-red-500" onClick={() => rejectMutation.mutate(p.id)}>
                          <XCircle className="h-3 w-3 mr-1" />Reject
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                    <span>Due: {p.dueDate ? format(parseISO(p.dueDate), "dd MMM yyyy") : "—"}</span>
                    {p.proofUrl && (
                      <a href={p.proofUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">View Proof</a>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Generate Invoice Dialog */}
      <Dialog open={invoiceOpen} onOpenChange={(open) => { if (!open) { setInvoiceOpen(false); resetForm(); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Invoice</DialogTitle>
            <DialogDescription>Create a new payment invoice for a tenant.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label>Tenant</Label>
              <Select value={form.tenantId} onValueChange={(v) => {
                setForm((p) => ({ ...p, tenantId: v }));
                const t = activeTenants.find((t) => t.id === v);
                if (t?.room?.price) setForm((p) => ({ ...p, amount: String(t.room.price) }));
              }}>
                <SelectTrigger><SelectValue placeholder="Select tenant" /></SelectTrigger>
                <SelectContent>
                  {activeTenants.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.user.profile?.name || t.user.email}{t.room ? ` — ${t.room.name}` : ""}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Month</Label>
                <Select value={form.month} onValueChange={(v) => setForm((p) => ({ ...p, month: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {monthNames.map((m, i) => (
                      <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Year</Label>
                <Select value={form.year} onValueChange={(v) => setForm((p) => ({ ...p, year: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[2024, 2025, 2026].map((y) => (
                      <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="inv-amount">Amount</Label>
                <Input id="inv-amount" type="number" min={0} value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} placeholder="1500000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inv-due">Due Date</Label>
                <Input id="inv-due" type="date" value={form.dueDate} onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setInvoiceOpen(false); resetForm(); }}>Cancel</Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleInvoice}
              disabled={invoiceMutation.isPending || !form.tenantId || !form.amount || !form.dueDate}
            >
              {invoiceMutation.isPending ? "Generating..." : "Generate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}