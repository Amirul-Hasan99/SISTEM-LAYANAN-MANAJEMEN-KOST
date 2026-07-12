"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";

export default function AdminSettings() {
  const { data } = useQuery({ queryKey: ["settings"], queryFn: () => fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/settings`).then(r => r.json()) });
  const qc = useQueryClient();
  const [form, setForm] = useState<Record<string, string>>({});

  const { mutate, isPending } = useMutation({
    mutationFn: (vals: Record<string, string>) => fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/settings`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(vals) }).then(r => r.json()),
    onSuccess: () => { toast.success("Settings saved"); qc.invalidateQueries({ queryKey: ["settings"] }); },
    onError: () => toast.error("Failed to save"),
  });

  const s = (data?.data as Record<string, string>) || {};
  const v = (key: string) => form[key] !== undefined ? form[key] : s[key] || "";
  const set = (key: string, val: string) => setForm(p => ({ ...p, [key]: val }));

  const fields = [
    { key: "boarding_house_name", label: "Boarding House Name", type: "text" },
    { key: "boarding_house_address", label: "Address", type: "text" },
    { key: "boarding_house_phone", label: "Phone", type: "text" },
    { key: "boarding_house_email", label: "Email", type: "email" },
    { key: "bank_name", label: "Bank Name", type: "text" },
    { key: "bank_account", label: "Account Number", type: "text" },
    { key: "bank_holder", label: "Account Holder", type: "text" },
    { key: "late_penalty_percent", label: "Late Penalty (%)", type: "number" },
    { key: "payment_due_day", label: "Payment Due Day", type: "number" },
  ];

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold tracking-tight">Settings</h2><p className="text-muted-foreground">Manage boarding house configuration</p></div>
      <Card><CardHeader><CardTitle>General Settings</CardTitle></CardHeader><CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map(f => (
            <div key={f.key} className="space-y-2"><Label>{f.label}</Label>
              <Input type={f.type} value={v(f.key)} onChange={e => set(f.key, e.target.value)} />
            </div>
          ))}
        </div>
        <Button className="mt-6" onClick={() => mutate(form)} disabled={isPending}>
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Save Changes
        </Button>
      </CardContent></Card>
    </div>
  );
}