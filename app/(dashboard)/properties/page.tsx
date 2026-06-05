import { Suspense } from "react";
import Link from "next/link";
import { Home, Building2, CheckCircle, Clock, LayoutGrid, List } from "lucide-react";
import { getProperties } from "@/lib/db/queries";
import { cn, formatCurrency, formatPropertyStatus, PROPERTY_STATUS_COLORS, NYC_BOROUGHS } from "@/lib/utils";
import { AddPropertyDialog } from "@/components/properties/add-property-dialog";
import { PropertyCard } from "@/components/properties/property-card";
import { Badge } from "@/components/ui/badge";
import { PropertiesPageClient } from "@/components/properties/properties-page-client";

export const metadata = { title: "Properties — KeevOS" };

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  const search = typeof params.search === "string" ? params.search : undefined;
  const borough = typeof params.borough === "string" ? params.borough : undefined;
  const status = typeof params.status === "string" ? params.status : undefined;
  const bedroomsParam = typeof params.bedrooms === "string" ? parseInt(params.bedrooms) : undefined;
  const bedrooms = bedroomsParam && !isNaN(bedroomsParam) ? bedroomsParam : undefined;
  const minRent = typeof params.minRent === "string" ? parseInt(params.minRent) : undefined;
  const maxRent = typeof params.maxRent === "string" ? parseInt(params.maxRent) : undefined;
  const voucherAccepted =
    params.voucher === "true" ? true : params.voucher === "false" ? false : undefined;
  const view = params.view === "grid" ? "grid" : "table";

  const { properties, total } = await getProperties({
    search,
    status,
    borough,
    bedrooms,
    minRent,
    maxRent,
    voucherAccepted,
    limit: 100,
  });

  // Stats
  const available = properties.filter((p: { status: string }) => p.status === "AVAILABLE").length;
  const pending = properties.filter((p: { status: string }) => p.status === "PENDING" || p.status === "INSPECTION_SCHEDULED").length;
  const occupied = properties.filter((p: { status: string }) => p.status === "OCCUPIED").length;

  const stats = [
    { label: "Available", value: available, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
    { label: "Pending", value: pending, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
    { label: "Occupied", value: occupied, icon: Building2, color: "text-slate-600", bg: "bg-slate-50" },
    { label: "Total", value: total, icon: Home, color: "text-[#1a2b1a]", bg: "bg-[#f7f4ef]" },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a2b1a]">Properties</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} properties in system</p>
        </div>
        <AddPropertyDialog />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className={cn("inline-flex p-2 rounded-lg mb-3", s.bg)}>
              <s.icon className={cn("w-4 h-4", s.color)} />
            </div>
            <div className="text-2xl font-bold text-[#1a2b1a]">{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Client-side filters + view toggle + list */}
      <PropertiesPageClient
        properties={properties as unknown as Parameters<typeof PropertiesPageClient>[0]["properties"]}
        currentView={view}
        currentSearch={search}
        currentBorough={borough}
        currentStatus={status}
        currentBedrooms={bedrooms}
      />
    </div>
  );
}
