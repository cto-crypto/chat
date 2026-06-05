"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LayoutGrid, List, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PropertyCard } from "@/components/properties/property-card";
import { cn, formatCurrency, formatDate, formatPropertyStatus, PROPERTY_STATUS_COLORS, NYC_BOROUGHS } from "@/lib/utils";

type Property = {
  id: string;
  address: string;
  borough: string;
  neighborhood?: string | null;
  zipCode?: string | null;
  bedrooms: number;
  bathrooms?: number | string | null;
  rent: number | string;
  status: string;
  voucherAccepted: boolean;
  propertyName?: string | null;
  updatedAt: Date;
  landlord?: {
    contact: {
      fullName: string;
    };
  } | null;
};

interface PropertiesPageClientProps {
  properties: Property[];
  currentView: "table" | "grid";
  currentSearch?: string;
  currentBorough?: string;
  currentStatus?: string;
  currentBedrooms?: number;
}

export function PropertiesPageClient({
  properties,
  currentView,
  currentSearch,
  currentBorough,
  currentStatus,
  currentBedrooms,
}: PropertiesPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(currentSearch ?? "");
  const [borough, setBorough] = useState(currentBorough ?? "");
  const [status, setStatus] = useState(currentStatus ?? "");
  const [bedrooms, setBedrooms] = useState(currentBedrooms?.toString() ?? "");
  const [view, setView] = useState<"table" | "grid">(currentView);

  function applyFilters(overrides: Record<string, string | undefined> = {}) {
    const p = new URLSearchParams();
    const s = overrides.search ?? search;
    const b = overrides.borough ?? borough;
    const st = overrides.status ?? status;
    const bd = overrides.bedrooms ?? bedrooms;
    const v = overrides.view ?? view;
    if (s) p.set("search", s);
    if (b && b !== "all") p.set("borough", b);
    if (st && st !== "all") p.set("status", st);
    if (bd && bd !== "all") p.set("bedrooms", bd);
    if (v) p.set("view", v);
    startTransition(() => {
      router.push(`${pathname}?${p.toString()}`);
    });
  }

  function handleViewToggle(v: "table" | "grid") {
    setView(v);
    applyFilters({ view: v });
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    applyFilters();
  }

  return (
    <div className="space-y-4">
      {/* Filters row */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search address, neighborhood…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={borough || "all"} onValueChange={(v) => { setBorough(v === "all" ? "" : v); applyFilters({ borough: v === "all" ? "" : v }); }}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Borough" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Boroughs</SelectItem>
              {NYC_BOROUGHS.map((b) => (
                <SelectItem key={b} value={b}>{b}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={bedrooms || "all"} onValueChange={(v) => { setBedrooms(v === "all" ? "" : v); applyFilters({ bedrooms: v === "all" ? "" : v }); }}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Bedrooms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Beds</SelectItem>
              {[0, 1, 2, 3, 4, 5].map((n) => (
                <SelectItem key={n} value={String(n)}>{n === 0 ? "Studio" : `${n} BD`}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={status || "all"} onValueChange={(v) => { setStatus(v === "all" ? "" : v); applyFilters({ status: v === "all" ? "" : v }); }}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="AVAILABLE">Available</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="INSPECTION_SCHEDULED">Inspection Scheduled</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="OCCUPIED">Occupied</SelectItem>
              <SelectItem value="UNAVAILABLE">Unavailable</SelectItem>
            </SelectContent>
          </Select>

          <Button type="submit" variant="outline" className="gap-2" disabled={isPending}>
            <SlidersHorizontal className="h-4 w-4" />
            Filter
          </Button>

          {/* View Toggle */}
          <div className="flex items-center gap-1 ml-auto border rounded-lg p-1 bg-gray-50">
            <button
              type="button"
              onClick={() => handleViewToggle("table")}
              className={cn("p-1.5 rounded transition-colors", view === "table" ? "bg-white shadow-sm text-[#1a2b1a]" : "text-gray-400 hover:text-gray-600")}
              title="Table view"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => handleViewToggle("grid")}
              className={cn("p-1.5 rounded transition-colors", view === "grid" ? "bg-white shadow-sm text-[#1a2b1a]" : "text-gray-400 hover:text-gray-600")}
              title="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Results */}
      {properties.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <p className="text-gray-500">No properties found. Try adjusting your filters.</p>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Address</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Borough</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Beds/Baths</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Rent</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Voucher</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Landlord</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {properties.map((property) => (
                  <tr
                    key={property.id}
                    className="hover:bg-gray-50/50 cursor-pointer transition-colors"
                    onClick={() => router.push(`/properties/${property.id}`)}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-[#1a2b1a] hover:text-[#4caf50] truncate max-w-[200px]">
                        {property.address}
                      </div>
                      {property.neighborhood && (
                        <div className="text-xs text-gray-400">{property.neighborhood}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{property.borough}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {property.bedrooms} bd {property.bathrooms ? `/ ${Number(property.bathrooms)} ba` : ""}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {formatCurrency(Number(property.rent))}
                    </td>
                    <td className="px-4 py-3">
                      {property.voucherAccepted ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 rounded-full px-2 py-0.5 font-medium">
                          ✓ Yes
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">No</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        PROPERTY_STATUS_COLORS[property.status] ?? "bg-gray-100 text-gray-700"
                      )}>
                        {formatPropertyStatus(property.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs truncate max-w-[140px]">
                      {property.landlord?.contact.fullName ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {formatDate(property.updatedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-500">
            Showing {properties.length} properties
          </div>
        </div>
      )}
    </div>
  );
}
