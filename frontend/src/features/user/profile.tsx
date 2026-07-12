"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";
import { User, Mail, Phone, MapPin, Lock, Save, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

const profileSchema = z.object({ name: z.string().min(1), phone: z.string().optional(), address: z.string().optional(), emergencyName: z.string().optional(), emergencyPhone: z.string().optional(), gender: z.string().optional(), birthDate: z.string().optional(), idNumber: z.string().optional() });
const pwSchema = z.object({ currentPassword: z.string().min(1), newPassword: z.string().min(6), confirmPassword: z.string().min(6) }).refine(d => d.newPassword === d.confirmPassword, { message: "Passwords don't match", path: ["confirmPassword"] });

export default function UserProfile() {
  const { user, setUser } = useAppStore();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["profile"], queryFn: () => fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile`).then(r => r.json()) });
  const p = data?.data as any;
  const [showPw, setShowPw] = useState(false);

  const { register, handleSubmit, reset } = useForm({ resolver: zodResolver(profileSchema), values: p ? { name: p.name || "", phone: p.phone || "", address: p.address || "", emergencyName: p.emergencyName || "", emergencyPhone: p.emergencyPhone || "", gender: p.gender || "", birthDate: p.birthDate || "", idNumber: p.idNumber || "" } : undefined });
  const pwForm = useForm({ resolver: zodResolver(pwSchema) });

  const saveProfile = useMutation({
    mutationFn: (v: any) => fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(v) }).then(r => r.json()),
    onSuccess: (d) => { if (d.success) { toast.success("Profile saved"); if (d.data?.name) setUser({ ...user!, name: d.data.name }); } else toast.error(d.error); },
    onError: () => toast.error("Failed"),
  });

  const changePw = useMutation({
    mutationFn: (v: any) => fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(v) }).then(r => r.json()),
    onSuccess: (d) => { if (d.success) { toast.success("Password changed"); setShowPw(false); pwForm.reset(); } else toast.error(d.error || "Current password incorrect"); },
    onError: () => toast.error("Failed"),
  });

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-64 rounded-xl" /><Skeleton className="h-40 rounded-xl" /></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h2 className="text-2xl font-bold tracking-tight">Profile</h2><p className="text-muted-foreground">Manage your personal information</p></div>

      <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><User className="h-4 w-4" />Personal Information</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(v => saveProfile.mutate(v))} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Full Name</Label><Input {...register("name")} /></div>
              <div className="space-y-2"><Label>Email</Label><Input value={user?.email || ""} disabled /></div>
              <div className="space-y-2"><Label>Phone</Label><Input {...register("phone")} /></div>
              <div className="space-y-2"><Label>Gender</Label>
                <select {...register("gender")} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="">Select</option><option value="male">Male</option><option value="female">Female</option>
                </select>
              </div>
              <div className="space-y-2 sm:col-span-2"><Label>Address</Label><Input {...register("address")} /></div>
              <div className="space-y-2"><Label>Emergency Contact Name</Label><Input {...register("emergencyName")} /></div>
              <div className="space-y-2"><Label>Emergency Contact Phone</Label><Input {...register("emergencyPhone")} /></div>
              <div className="space-y-2"><Label>ID Number</Label><Input {...register("idNumber")} /></div>
              <div className="space-y-2"><Label>Birth Date</Label><Input type="date" {...register("birthDate")} /></div>
            </div>
            <Button type="submit" disabled={saveProfile.isPending}>{saveProfile.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Save</Button>
          </form>
        </CardContent></Card>

      <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Lock className="h-4 w-4" />Change Password</CardTitle></CardHeader>
        <CardContent>
          {showPw ? (
            <form onSubmit={pwForm.handleSubmit((v) => changePw.mutate({ currentPassword: v.currentPassword, newPassword: v.newPassword }))} className="space-y-4">
              <div className="space-y-2"><Label>Current Password</Label><Input type="password" {...pwForm.register("currentPassword")} />{pwForm.formState.errors.currentPassword && <p className="text-xs text-destructive">Required</p>}</div>
              <div className="space-y-2"><Label>New Password</Label><Input type="password" {...pwForm.register("newPassword")} />{pwForm.formState.errors.newPassword && <p className="text-xs text-destructive">Min 6 characters</p>}</div>
              <div className="space-y-2"><Label>Confirm New Password</Label><Input type="password" {...pwForm.register("confirmPassword")} />{pwForm.formState.errors.confirmPassword && <p className="text-xs text-destructive">{pwForm.formState.errors.confirmPassword.message}</p>}</div>
              <div className="flex gap-2"><Button type="submit" disabled={changePw.isPending}>{changePw.isPending ? "Changing..." : "Update Password"}</Button><Button type="button" variant="outline" onClick={() => setShowPw(false)}>Cancel</Button></div>
            </form>
          ) : (
            <Button variant="outline" onClick={() => setShowPw(true)}>Change Password</Button>
          )}
        </CardContent></Card>
    </div>
  );
}