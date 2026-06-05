"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search, List, LayoutGrid, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CaseKanban } from "@/components/cases/case-kanban";
import { cn, formatCaseStatus, formatDate, CASE_STATUS_COLORS } from "@/lib/utils";

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-600",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  HIGH: "bg-orange-100 text-orange-700",
  CRITICAL: "bg-red-100 text-red-700",
};

type Case = {
  id: string;
  caseNumber: string;
  status: string;
  priority: string;
  nextFollowUpDate?: Date | null;
  updatedAt: Date;
  tenant?: {
    contact: { fullName: string };
  } | null;
  property?: {
    address: string;
    borough: string;
  } | null;
  assignedStaff?: {
    fullName: string;
    avatarUrl?: string | null;
  } | null;
};

interface CasesPageClientProps {
  cases: Case[];
  currentSearch?: string;
  currentStatus?: string;
  currentPriority?: string;
}

export function CasesPageClient({
  cases,
  currentSearch,
  currentStatus,
  currentPriority,
}: CasesPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(currentSearch ?? "");
  const [status, setStatus] = useState(currentStatus ?? "");
  const [priority, setPriority] = useState(currentPriority ?? "");
  const [view, setView] = useState<"table" | "kanban">("table");

  function applyFilters(overrides: Record<string, string | undefined> = {}) {
    const p = new URLSearchParams();
    const s = overrides.search ?? search;
    const st = overrides.status ?? status;
    const pr = overrides.priority ?? priority;
    if (s) p.set("search", s);
    if (st && st !== "all") p.set("status", st);
    if (pr && pr !== "all") p.set("priority", pr);
    startTransition(() => {
      router.push(`${pathname}?${p.toString()}`);
    });
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    applyFilters();
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search case number, tenant…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={status || "all"} onValueChange={(v) => { setStatus(v === "all" ? "" : v); applyFilters({ status: v === "all" ? "" : v }); }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="NEW">New</SelectItem>
              <SelectItem value="SEARCHING">Searching</SelectItem>
              <SelectItem value="VIEWING_SCHEDULED">Viewing Scheduled</SelectItem>
              <SelectItem value="APPLICATION_STARTED">Application Started</SelectItem>
              <SelectItem value="DOCUMENTS_NEEDED">Documents Needed</SelectItem>
              <SelectItem value="INSPECTION_PENDING">Inspection Pending</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="LEASE_SIGNING">Lease Signing</SelectItem>
              <SelectItem value="HOUSED">Housed</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
              <SelectItem value="LOST">Lost</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priority || "all"} onValueChange={(v) => { setPriority(v === "all" ? "" : v); applyFilters({ priority: v === "all" ? "" : v }); }}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="CRITICAL">Critical</SelectItem>
            </SelectContent>
          </Select>

          <Button type="submit" variant="outline" className="gap-2" disabled={isPending}>
            <SlidersHorizontal className="h-4 w-4" />
            Filter
          </Button>

          {/* View toggle */}
          <div className="flex items-center gap-1 ml-auto border rounded-lg p-1 bg-gray-50">
            <button
              type="button"
              onClick={() => setView("table")}
              className={cn("p-1.5 rounded transition-colors", view === "table" ? "bg-white shadow-sm text-[#1a2b1a]" : "text-gray-400 hover:text-gray-600")}
              title="Table view"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setView("kanban")}
              className={cn("p-1.5 rounded transition-colors", view === "kanban" ? "bg-white shadow-sm text-[#1a2b1a]" : "text-gray-400 hover:text-gray-600")}
              title="Kanban view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Content */}
      {cases.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <p className="text-gray-500">No cases found. Try adjusting your filters.</p>
        </div>
      ) : view === "kanban" ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <CaseKanban cases={cases} />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Case #</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tenant</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Property</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Priority</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Follow-up</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Assigned</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {cases.map((c) => {
                  const isOverdue = c.nextFollowUpDate && new Date(c.nextFollowUpDate) < new Date();
                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-gray-50/50 cursor-pointer transition-colors"
                      onClick={() => router.push(`/cases/${c.id}`)}
                    >
                      <td className="px-4 py-3 font-mono font-semibold text-[#1a2b1a] text-xs">
                        {c.caseNumber}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-900">
                          {c.tenant?.contact.fullName ?? <span className="text-gray-400">No tenant</span>}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs max-w-[160px] truncate">
                        {c.property ? `${c.property.address}` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          CASE_STATUS_COLORS[c.status] ?? "bg-gray-100 text-gray-700"
                        )}>
                          {formatCaseStatus(c.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
                          PRIORITY_COLORS[c.priority] ?? "bg-gray-100 text-gray-600"
                        )}>
                          {c.priority}
                        </span>
                      </td>
                      <td className={cn("px-4 py-3 text-xs", isOverdue ? "text-red-500 font-medium" : "text-gray-500")}>
                        {c.nextFollowUpDate ? formatDate(c.nextFollowUpDate) : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 truncate max-w-[120px]">
                        {c.assignedStaff?.fullName ?? "Unassigned"}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {formatDate(c.updatedAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-500">
            Showing {cases.length} cases
          </div>
        </div>
      )}
    </div>
  );
}
