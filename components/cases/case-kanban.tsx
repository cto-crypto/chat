"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, AlertCircle, ChevronDown } from "lucide-react";
import { cn, formatCaseStatus, formatDate, CASE_STATUS_COLORS } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const KANBAN_COLUMNS = [
  "NEW",
  "SEARCHING",
  "VIEWING_SCHEDULED",
  "APPLICATION_STARTED",
  "DOCUMENTS_NEEDED",
  "INSPECTION_PENDING",
  "APPROVED",
  "LEASE_SIGNING",
  "HOUSED",
  "CLOSED",
] as const;

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-600",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  HIGH: "bg-orange-100 text-orange-700",
  CRITICAL: "bg-red-100 text-red-700",
};

const PRIORITY_BORDER: Record<string, string> = {
  LOW: "border-gray-200",
  MEDIUM: "border-yellow-200",
  HIGH: "border-orange-200",
  CRITICAL: "border-red-300",
};

interface KanbanCase {
  id: string;
  caseNumber: string;
  status: string;
  priority: string;
  nextFollowUpDate?: Date | string | null;
  tenant?: {
    contact: {
      fullName: string;
    };
  } | null;
  assignedStaff?: {
    fullName: string;
  } | null;
}

interface CaseKanbanProps {
  cases: KanbanCase[];
}

export function CaseKanban({ cases: initialCases }: CaseKanbanProps) {
  const router = useRouter();
  const [cases, setCases] = useState(initialCases);

  async function moveCase(caseId: string, newStatus: string) {
    // Optimistic update
    setCases((prev) =>
      prev.map((c) => (c.id === caseId ? { ...c, status: newStatus } : c))
    );
    try {
      await fetch(`/api/cases/${caseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch {
      // Revert on error
      setCases(initialCases);
    }
  }

  const casesByStatus = KANBAN_COLUMNS.reduce<Record<string, KanbanCase[]>>((acc, col) => {
    acc[col] = cases.filter((c) => c.status === col);
    return acc;
  }, {});

  return (
    <div className="flex gap-3 overflow-x-auto pb-4">
      {KANBAN_COLUMNS.map((col) => {
        const colCases = casesByStatus[col] ?? [];
        const colLabel = formatCaseStatus(col);
        const colColor = CASE_STATUS_COLORS[col] ?? "bg-gray-100 text-gray-700";

        return (
          <div
            key={col}
            className="flex-shrink-0 w-[220px] flex flex-col"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-2 px-1">
              <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold", colColor)}>
                {colLabel}
              </span>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-500">
                {colCases.length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-2 min-h-[120px]">
              {colCases.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-200 p-3 flex items-center justify-center">
                  <span className="text-xs text-gray-300">No cases</span>
                </div>
              ) : (
                colCases.map((c) => (
                  <KanbanCard
                    key={c.id}
                    caseItem={c}
                    onMove={moveCase}
                    onClick={() => router.push(`/cases/${c.id}`)}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function KanbanCard({
  caseItem,
  onMove,
  onClick,
}: {
  caseItem: KanbanCase;
  onMove: (id: string, status: string) => void;
  onClick: () => void;
}) {
  const isOverdue =
    caseItem.nextFollowUpDate && new Date(caseItem.nextFollowUpDate) < new Date();

  return (
    <div
      className={cn(
        "bg-white rounded-lg border shadow-sm p-3 cursor-pointer hover:shadow-md transition-all group",
        PRIORITY_BORDER[caseItem.priority] ?? "border-gray-200",
        caseItem.priority === "CRITICAL" && "ring-1 ring-red-200"
      )}
      onClick={onClick}
    >
      {/* Case number */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono font-semibold text-[#1a2b1a] group-hover:text-[#4caf50] transition-colors">
          {caseItem.caseNumber}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-0.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              Move
              <ChevronDown className="h-3 w-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[180px]">
            {KANBAN_COLUMNS.filter((s) => s !== caseItem.status).map((s) => (
              <DropdownMenuItem
                key={s}
                onClick={(e) => {
                  e.stopPropagation();
                  onMove(caseItem.id, s);
                }}
              >
                {formatCaseStatus(s)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tenant name */}
      <p className="text-sm font-medium text-gray-800 line-clamp-1 mb-1.5">
        {caseItem.tenant?.contact.fullName ?? "No Tenant"}
      </p>

      {/* Priority badge */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={cn(
          "inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
          PRIORITY_COLORS[caseItem.priority] ?? "bg-gray-100 text-gray-600"
        )}>
          {caseItem.priority}
        </span>

        {caseItem.nextFollowUpDate && (
          <span className={cn(
            "inline-flex items-center gap-1 text-[10px]",
            isOverdue ? "text-red-500 font-medium" : "text-gray-400"
          )}>
            {isOverdue && <AlertCircle className="h-2.5 w-2.5" />}
            <Calendar className="h-2.5 w-2.5" />
            {formatDate(caseItem.nextFollowUpDate, "MMM d")}
          </span>
        )}
      </div>

      {/* Assigned staff */}
      {caseItem.assignedStaff && (
        <p className="text-[10px] text-gray-400 mt-1.5 truncate">
          {caseItem.assignedStaff.fullName}
        </p>
      )}
    </div>
  );
}
