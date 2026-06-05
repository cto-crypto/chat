import Link from "next/link";
import { FileText, AlertCircle, Clock, CheckCircle, TrendingUp, Plus } from "lucide-react";
import { getHousingCases } from "@/lib/db/queries";
import { cn, formatCaseStatus, formatDate, CASE_STATUS_COLORS } from "@/lib/utils";
import { CasesPageClient } from "@/components/cases/cases-page-client";

export const metadata = { title: "Housing Cases — KeevOS" };

export default async function CasesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  const search = typeof params.search === "string" ? params.search : undefined;
  const status = typeof params.status === "string" ? params.status : undefined;
  const priority = typeof params.priority === "string" ? params.priority : undefined;
  const assignedStaffId = typeof params.staff === "string" ? params.staff : undefined;

  const { cases, total } = await getHousingCases({
    search,
    status,
    priority,
    assignedStaffId,
    limit: 200,
  });

  // Stats
  type CaseItem = { status: string; priority: string; updatedAt: Date };
  const open = cases.filter((c: CaseItem) => !["HOUSED", "CLOSED", "LOST"].includes(c.status)).length;
  const newCases = cases.filter((c: CaseItem) => c.status === "NEW").length;
  const inProgress = cases.filter((c: CaseItem) =>
    ["SEARCHING", "VIEWING_SCHEDULED", "APPLICATION_STARTED", "DOCUMENTS_NEEDED", "INSPECTION_PENDING", "APPROVED", "LEASE_SIGNING"].includes(c.status)
  ).length;
  const housedThisMonth = cases.filter((c: CaseItem) => {
    if (c.status !== "HOUSED") return false;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return new Date(c.updatedAt) >= monthStart;
  }).length;
  const critical = cases.filter((c: CaseItem) => c.priority === "CRITICAL" && !["HOUSED", "CLOSED", "LOST"].includes(c.status)).length;

  const stats = [
    { label: "Total Open", value: open, icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "New", value: newCases, icon: FileText, color: "text-gray-600", bg: "bg-gray-50" },
    { label: "In Progress", value: inProgress, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
    { label: "Housed This Month", value: housedThisMonth, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
    { label: "Critical", value: critical, icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a2b1a]">Housing Cases</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} cases in system</p>
        </div>
        <Link href="/cases/new">
          <button className="inline-flex items-center gap-2 bg-[#1a2b1a] hover:bg-[#2d4a2d] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus className="h-4 w-4" />
            Create Case
          </button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
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

      {/* Client-side table / kanban */}
      <CasesPageClient
        cases={cases as Parameters<typeof CasesPageClient>[0]["cases"]}
        currentSearch={search}
        currentStatus={status}
        currentPriority={priority}
      />
    </div>
  );
}
