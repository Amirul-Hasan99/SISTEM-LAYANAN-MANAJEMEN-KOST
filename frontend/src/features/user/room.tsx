"use client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BedDouble, Users, Wifi, Snowflake, Droplets, Car, CookingPot, Camera, Shirt, Monitor, Archive } from "lucide-react";

const iconMap: Record<string, any> = { wifi: Wifi, ac: Snowflake, "water heater": Droplets, "private bathroom": BedDouble, kitchen: CookingPot, parking: Car, laundry: Shirt, cctv: Camera, desk: Monitor, wardrobe: Archive };

export default function UserRoom() {
  const { data, isLoading } = useQuery({ queryKey: ["user-dashboard"], queryFn: () => fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard`).then(r => r.json()) });
  const tenant = data?.data?.tenant;
  const room = tenant?.room;
  const lease = tenant?.lease;
  const fmt = (n: number) => new Intl.NumberFormat("id-ID").format(n);

  if (isLoading) return <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}</div>;
  if (!room) return <Card><CardContent className="py-12 text-center text-muted-foreground">No room assigned yet. Please contact admin.</CardContent></Card>;

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold tracking-tight">My Room</h2><p className="text-muted-foreground">Room details and facilities</p></div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card><CardHeader><CardTitle>{room.name}</CardTitle></CardHeader><CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-muted-foreground">Number</span><p className="font-medium">{room.number}</p></div>
            <div><span className="text-muted-foreground">Floor</span><p className="font-medium">{room.floor}</p></div>
            <div><span className="text-muted-foreground">Category</span><p className="font-medium">{room.category?.name || "Standard"}</p></div>
            <div><span className="text-muted-foreground">Monthly Rent</span><p className="font-medium text-emerald-600">Rp {fmt(room.price)}</p></div>
          </div>
          {room.description && <div className="text-sm text-muted-foreground pt-2 border-t">{room.description}</div>}
        </CardContent></Card>

        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-4 w-4" />Lease Info</CardTitle></CardHeader><CardContent className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div><span className="text-muted-foreground">Status</span><p><Badge variant="secondary" className="bg-emerald-100 text-emerald-700">{lease?.status || tenant.status}</Badge></p></div>
            <div><span className="text-muted-foreground">Move In</span><p className="font-medium">{lease?.startDate ? new Date(lease.startDate).toLocaleDateString() : "-"}</p></div>
            <div><span className="text-muted-foreground">Monthly Rent</span><p className="font-medium">Rp {fmt(lease?.monthlyRent || room.price)}</p></div>
            <div><span className="text-muted-foreground">Capacity</span><p className="font-medium">{room.capacity} person(s)</p></div>
          </div>
        </CardContent></Card>
      </div>

      <Card><CardHeader><CardTitle>Facilities</CardTitle></CardHeader><CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {(room.facilities || []).map((f: any) => { const Icon = iconMap[f.facility?.name?.toLowerCase()] || BedDouble; return (
            <div key={f.facilityId || f.name} className="flex items-center gap-2 rounded-lg border p-3">
              <Icon className="h-4 w-4 text-emerald-600 shrink-0" />
              <span className="text-sm">{f.facility?.name || f.name}</span>
            </div>
          ); })}
          {(!room.facilities?.length) && <p className="text-sm text-muted-foreground col-span-full">No facilities listed</p>}
        </div>
      </CardContent></Card>
    </div>
  );
}