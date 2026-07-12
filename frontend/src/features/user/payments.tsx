"use client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Upload } from "lucide-react";
import { format } from "date-fns";
import { useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";

const fmt = (n: number) => new Intl.NumberFormat("id-ID").format(n);
const statusColor: Record<string, string> = { paid: "bg-emerald-100 text-emerald-700", pending: "bg-amber-100 text-amber-700", overdue: "bg-red-100 text-red-700", rejected: "bg-slate-100 text-slate-600" };

export default function UserPayments() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["user-payments"], queryFn: () => fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments`).then(r => r.json()) });
  const [uploadId, setUploadId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const uploadProof = async (paymentId: string, file: File) => {
    setUploading(true);
    try {
      const fd = new FormData(); fd.append("file", file);
      const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, { method: "POST", body: fd });
      const uploadData = await uploadRes.json();
      if (!uploadData.success) throw new Error("Upload failed");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: paymentId, proofUrl: uploadData.data.url, notes: "Payment proof uploaded" }) });
      const data = await res.json();
      if (data.success) { toast.success("Proof uploaded"); qc.invalidateQueries({ queryKey: ["user-payments"] }); setUploadId(null); }
      else toast.error(data.error || "Failed");
    } catch { toast.error("Upload failed"); }
    setUploading(false);
  };

  if (isLoading) return <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>;

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold tracking-tight">My Payments</h2><p className="text-muted-foreground">View and manage your payment history</p></div>
      <Card><CardContent className="p-0">
        <Table><TableHeader><TableRow><TableHead>Period</TableHead><TableHead>Room</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Due Date</TableHead><TableHead>Paid Date</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
          <TableBody>{!(data?.data as any[])?.length ? <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No payments found</TableCell></TableRow> : (data.data as any[]).map((p: any) => (
            <TableRow key={p.id}><TableCell className="font-medium">{format(new Date(p.year, p.month - 1), "MMMM yyyy")}</TableCell>
              <TableCell className="text-sm">{p.room?.name || p.room?.number || "-"}</TableCell>
              <TableCell className="text-right">Rp {fmt(p.amount)}</TableCell>
              <TableCell className="text-sm">{format(new Date(p.dueDate), "MMM dd, yyyy")}</TableCell>
              <TableCell className="text-sm">{p.paidDate ? format(new Date(p.paidDate), "MMM dd") : "-"}</TableCell>
              <TableCell><Badge variant="secondary" className={statusColor[p.status] || ""}>{p.status}</Badge></TableCell>
              <TableCell className="text-right">
                {(p.status === "pending" || p.status === "overdue") && (
                  <Dialog open={uploadId === p.id} onOpenChange={o => { setUploadId(o ? p.id : null); }}>
                    <DialogTrigger asChild><Button size="sm" variant="outline"><Upload className="mr-1 h-3 w-3" />Upload Proof</Button></DialogTrigger>
                    <DialogContent><DialogHeader><DialogTitle>Upload Payment Proof</DialogTitle></DialogHeader>
                      <input ref={fileRef} type="file" accept="image/*" className="block w-full text-sm text-muted-foreground file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" />
                      <DialogFooter><Button variant="outline" onClick={() => setUploadId(null)}>Cancel</Button>
                        <Button disabled={uploading} onClick={() => { const f = fileRef.current?.files?.[0]; if (f) uploadProof(p.id, f); else toast.error("Select a file"); }}>{uploading ? "Uploading..." : "Upload"}</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </TableCell>
            </TableRow>
          ))}</TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
}