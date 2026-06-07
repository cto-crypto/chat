"use client";

import { useState, useCallback, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Search,
  UserPlus,
  Home,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import {
  cn,
  formatDate,
  formatRelativeDate,
  formatCurrency,
  NYC_BOROUGHS,
  URGENCY_COLORS,
} from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Tenant = {
  id: string;
  tenantStatus: string;
  urgencyLevel: string;
  voucherType?: string | null;
  voucherSize?: number | null;
  maxRent?: unknown;
  preferredBoroughs: string[];
  moveInDeadline?: string | Date | null;
  documentsComplete: boolean;
  contact: {
    id: string;
    fullName: string;
    phone?: string | null;
    email?: string | null;
  };
  assignedCaseworker?: {
    id: string;
    contact: {
      fullName: string;
    };
  } | null;
};

const TENANT_STATUS_STYLES: Record<string, string> = {
  NEW: "bg-gray-100 text-gray-600",
  SEARCHING: "bg-blue-100 text-blue-700",
  VIEWING: "bg-cyan-100 text-cyan-700",
  APPLICATION_SUBMITTED: "bg-purple-100 text-purple-700",
  INSPECTION_PENDING: "bg-orange-100 text-orange-700",
  APPROVED: "bg-green-100 text-green-700",
  HOUSED: "bg-emerald-100 text-emerald-700",
  INACTIVE: "bg-slate-100 text-slate-500",
};

function formatTenantStatus(s: string) {
  const map: Record<string, string> = {
    NEW: "New",
    SEARCHING: "Searching",
    VIEWING: "Viewing",
    APPLICATION_SUBMITTED: "Application",
    INSPECTION_PENDING: "Inspection",
    APPROVED: "Approved",
    HOUSED: "Housed",
    INACTIVE: "Inactive",
  };
  return map[s] ?? s.replace(/_/g, " ");
}

interface TenantsPageClientProps {
  tenants: Tenant[];
  total: number;
  page: number;
  pages: number;
  stats: {
    total: number;
    newCount: number;
    searchingCount: number;
    applicationCount: number;
    housedCount: number;
  };
  initialSearch: string;
  initialStatus: string;
  initialUrgency: string;
  initialBorough: string;
  initialVoucherSize: string;
  openAddDialog: boolean;
}

export function TenantsPageClient({
  tenants,
  total,
  page,
  pages,
  stats,
  initialSearch,
  initialStatus,
  initialUrgency,
  initialBorough,
  initialVoucherSize,
}: TenantsPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  const [search, setSearch] = useState(initialSearch);
  const [status, setStatus] = useState(initialStatus || "all");
  const [urgency, setUrgency] = useState(initialUrgency || "all");
  const [borough, setBorough] = useState(initialBorough || "all");
  const [voucherSize, setVoucherSize] = useState(initialVoucherSize || "all");

  const pushFilters = useCallback(
    (overrides: Record<string, string>) => {
      const params = new URLSearchParams();
      const s = overrides.search ?? search;
      const st = overrides.status ?? status;
      const u = overrides.urgency ?? urgency;
      const b = overrides.borough ?? borough;
      const vs = overrides.voucherSize ?? voucherSize;
      const p = overrides.page ?? "1";

      if (s) params.set("search", s);
      if (st && st !== "all") params.set("status", st);
      if (u && u !== "all") params.set("urgency", u);
      if (b && b !== "all") params.set("borough", b);
      if (vs && vs !== "all") params.set("voucherSize", vs);
      if (p !== "1") params.set("page", p);

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [router, pathname, search, status, urgency, borough, voucherSize]
  );

  return (
    <div className="min-h-screen bg-[#f7f4ef]">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#1a2b1a] flex items-center justify-center">
              <Home className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#1a2b1a]">Tenants</h1>
              <p className="text-sm text-gray-500">{total.toLocaleString()} total tenants</p>
            </div>
          </div>
          <Button
            onClick={() => router.push("/contacts?action=add")}
            className="bg-[#1a2b1a] hover:bg-[#2a3b2a] text-white"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Tenant
          </Button>
        </div>

        {/* Status Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: "Active", value: stats.total, status: "all", color: "bg-[#1a2b1a] text-white" },
            { label: "New", value: stats.newCount, status: "NEW", color: "bg-gray-100 text-gray-700" },
            { label: "Searching", value: stats.searchingCount, status: "SEARCHING", color: "bg-blue-100 text-blue-700" },
            { label: "Application", value: stats.applicationCount, status: "APPLICATION_SUBMITTED", color: "bg-purple-100 text-purple-700" },
            { label: "Housed", value: stats.housedCount, status: "HOUSED", color: "bg-emerald-100 text-emerald-700" },
          ].map(({ label, value, status: s, color }) => (
            <button
              key={label}
              onClick={() => {
                setStatus(s);
                pushFilters({ status: s });
              }}
              className={cn(
                "rounded-xl p-3 text-center transition-all hover:shadow-sm cursor-pointer border",
                status === s
                  ? "ring-2 ring-[#4caf50] border-transparent " + color
                  : "bg-white border-gray-100 hover:border-gray-200"
              )}
            >
              <p className={cn("text-2xl font-bold", status === s ? "" : "text-[#1a2b1a]")}>{value}</p>
              <p className={cn("text-xs font-medium mt-0.5", status === s ? "" : "text-gray-500")}>{label}</p>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3">
            <form
              onSubmit={(e) => { e.preventDefault(); pushFilters({ search }); }}
              className="flex-1 flex gap-2"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, phone, email..."
                  className="pl-9 bg-gray-50 border-gray-200"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button type="submit" variant="outline" size="sm" className="h-10">
                Search
              </Button>
            </form>

            <div className="flex gap-2 flex-wrap sm:flex-nowrap">
              <Select value={urgency} onValueChange={(v) => { setUrgency(v); pushFilters({ urgency: v }); }}>
                <SelectTrigger className="w-32 bg-gray-50 border-gray-200">
                  <SelectValue placeholder="Urgency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Urgency</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={borough} onValueChange={(v) => { setBorough(v); pushFilters({ borough: v }); }}>
                <SelectTrigger className="w-36 bg-gray-50 border-gray-200">
                  <SelectValue placeholder="Borough" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Boroughs</SelectItem>
                  {NYC_BOROUGHS.map((b) => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={voucherSize} onValueChange={(v) => { setVoucherSize(v); pushFilters({ voucherSize: v }); }}>
                <SelectTrigger className="w-32 bg-gray-50 border-gray-200">
                  <SelectValue placeholder="Voucher" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sizes</SelectItem>
                  {[0, 1, 2, 3, 4, 5, 6].map((n) => (
                    <SelectItem key={n} value={String(n)}>{n === 0 ? "Studio" : `${n} BR`}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-gray-100 overflow-hidden bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
                <TableHead className="h-10 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</TableHead>
                <TableHead className="h-10 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Voucher</TableHead>
                <TableHead className="h-10 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</TableHead>
                <TableHead className="h-10 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Urgency</TableHead>
                <TableHead className="h-10 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Max Rent</TableHead>
                <TableHead className="h-10 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Boroughs</TableHead>
                <TableHead className="h-10 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Caseworker</TableHead>
                <TableHead className="h-10 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Move-In Deadline</TableHead>
                <TableHead className="h-10 px-4 text-xs sr-only">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-32 text-center text-gray-400">
                    No tenants found
                  </TableCell>
                </TableRow>
              ) : (
                tenants.map((tenant) => (
                  <TableRow
                    key={tenant.id}
                    className="cursor-pointer hover:bg-[#f7f4ef]/60 transition-colors border-gray-50"
                    onClick={() => router.push(`/tenants/${tenant.id}`)}
                  >
                    <TableCell className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-[#1a2b1a]">{tenant.contact.fullName}</p>
                        {tenant.contact.phone && (
                          <p className="text-xs text-gray-400">{tenant.contact.phone}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      {tenant.voucherType || tenant.voucherSize ? (
                        <div>
                          <p className="text-xs font-medium text-gray-700">{tenant.voucherType ?? "—"}</p>
                          {tenant.voucherSize != null && (
                            <p className="text-xs text-gray-400">
                              {tenant.voucherSize === 0 ? "Studio" : `${tenant.voucherSize} BR`}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-300 text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                          TENANT_STATUS_STYLES[tenant.tenantStatus] ?? "bg-gray-100 text-gray-600"
                        )}
                      >
                        {formatTenantStatus(tenant.tenantStatus)}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
                          URGENCY_COLORS[tenant.urgencyLevel as keyof typeof URGENCY_COLORS] ?? "bg-gray-100 text-gray-600"
                        )}
                      >
                        {tenant.urgencyLevel}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <span className="text-sm text-gray-700">
                        {tenant.maxRent
                          ? formatCurrency(Number(tenant.maxRent))
                          : <span className="text-gray-300">—</span>}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      {tenant.preferredBoroughs.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {tenant.preferredBoroughs.slice(0, 2).map((b) => (
                            <span key={b} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                              {b.split(" ")[0]}
                            </span>
                          ))}
                          {tenant.preferredBoroughs.length > 2 && (
                            <span className="text-xs text-gray-400">+{tenant.preferredBoroughs.length - 2}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-300 text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <span className="text-sm text-gray-700">
                        {tenant.assignedCaseworker?.contact?.fullName ?? (
                          <span className="text-gray-300">Unassigned</span>
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      {tenant.moveInDeadline ? (
                        <span
                          className={cn(
                            "text-sm font-medium",
                            new Date(tenant.moveInDeadline) < new Date()
                              ? "text-red-600"
                              : "text-gray-700"
                          )}
                        >
                          {formatDate(tenant.moveInDeadline)}
                        </span>
                      ) : (
                        <span className="text-gray-300 text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/tenants/${tenant.id}`);
                            }}
                          >
                            <Eye className="h-3.5 w-3.5 mr-2" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/tenants/${tenant.id}/edit`);
                            }}
                          >
                            <Edit className="h-3.5 w-3.5 mr-2" />
                            Edit
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-1">
          <p className="text-sm text-gray-500">
            Showing {tenants.length === 0 ? 0 : (page - 1) * 50 + 1}–
            {Math.min(page * 50, total)} of {total} tenants
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pushFilters({ page: String(page - 1) })}
              disabled={page <= 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
              let pageNum: number;
              if (pages <= 7) pageNum = i + 1;
              else if (page <= 4) pageNum = i + 1;
              else if (page >= pages - 3) pageNum = pages - 6 + i;
              else pageNum = page - 3 + i;
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => pushFilters({ page: String(pageNum) })}
                  className={cn(
                    "h-8 w-8 p-0 text-xs",
                    pageNum === page && "bg-[#1a2b1a] hover:bg-[#2a3b2a] text-white border-[#1a2b1a]"
                  )}
                >
                  {pageNum}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              onClick={() => pushFilters({ page: String(page + 1) })}
              disabled={page >= pages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
