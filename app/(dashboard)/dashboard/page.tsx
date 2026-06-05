import { Suspense } from "react";
import {
  Users,
  Home,
  Building2,
  FileText,
  AlertTriangle,
  Clock,
  HomeIcon,
  FileMinus,
  Plus,
  UserPlus,
  Upload,
  Download,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import {
  getDashboardStats,
  getCasesByStatus,
  getPropertiesByBorough,
  getRecentActivity,
  getUpcomingTasks,
  getUrgentCases,
} from "@/lib/db/queries";
import { StatCard } from "@/components/dashboard/stat-card";
import { CasesStatusChart } from "@/components/dashboard/cases-status-chart";
import { BoroughChart } from "@/components/dashboard/borough-chart";
import {
  cn,
  formatDate,
  formatRelativeDate,
  URGENCY_COLORS,
  CASE_STATUS_COLORS,
  formatCaseStatus,
} from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

type UrgentCase = {
  id: string;
  caseNumber: string;
  status: string;
  priority: string;
  tenant?: { contact?: { fullName: string } | null } | null;
  assignedStaff?: { fullName: string } | null;
};

type UpcomingTask = {
  id: string;
  title: string;
  dueDate?: Date | null;
  assignedTo?: { fullName: string } | null;
  relatedCase?: { caseNumber: string } | null;
};

type ActivityLogEntry = {
  id: string;
  action: string;
  createdAt: Date;
  actor?: { fullName: string; avatarUrl?: string | null } | null;
};

export default async function DashboardPage() {
  const [stats, casesByStatus, propertiesByBorough, recentActivity, upcomingTasks, urgentCases] =
    await Promise.all([
      getDashboardStats(),
      getCasesByStatus(),
      getPropertiesByBorough(),
      getRecentActivity(15),
      getUpcomingTasks(8),
      getUrgentCases(8),
    ]);

  const typedUrgentCases = urgentCases as unknown as UrgentCase[];
  const typedUpcomingTasks = upcomingTasks as unknown as UpcomingTask[];
  const typedActivity = recentActivity as unknown as ActivityLogEntry[];

  const today = format(new Date(), "EEEE, MMMM d, yyyy");

  return (
    <div className="min-h-screen bg-[#f7f4ef]">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-[#1a2b1a]">Good morning, KeevOS Dashboard</h1>
            <p className="text-sm text-gray-500 mt-0.5">{today}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#4caf50] animate-pulse" />
            <span className="text-xs text-gray-500 font-medium">System Online</span>
          </div>
        </div>

        {/* Primary Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard
            title="Total Contacts"
            value={stats.totalContacts}
            icon={Users}
            color="blue"
          />
          <StatCard
            title="Active Tenants"
            value={stats.activeTenants}
            icon={Home}
            color="green"
          />
          <StatCard
            title="Available Properties"
            value={stats.availableProperties}
            icon={Building2}
            color="emerald"
          />
          <StatCard
            title="Open Cases"
            value={stats.openCases}
            icon={FileText}
            color="orange"
          />
          <StatCard
            title="Critical Cases"
            value={stats.criticalCases}
            icon={AlertTriangle}
            color="red"
            pulse={stats.criticalCases > 0}
          />
          <StatCard
            title="Overdue Follow-ups"
            value={stats.overdueFollowUps}
            icon={Clock}
            color="yellow"
          />
        </div>

        {/* Secondary Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard
            title="Housed This Month"
            value={stats.housedThisMonth}
            icon={HomeIcon}
            color="green"
            trend="up"
            description="Tenants successfully housed this calendar month"
          />
          <StatCard
            title="Missing Documents"
            value={stats.missingDocsTenants}
            icon={FileMinus}
            color="orange"
            description="Active tenants with incomplete document packages"
          />
        </div>

        {/* Quick Actions */}
        <Card className="bg-white border-gray-100">
          <CardContent className="py-4">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-2">
                Quick Actions
              </span>
              <Button asChild size="sm" className="bg-[#1a2b1a] hover:bg-[#2a3b2a] text-white">
                <Link href="/contacts?action=add">
                  <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                  Add Contact
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="border-[#4caf50] text-[#2e7d32] hover:bg-green-50">
                <Link href="/tenants?action=add">
                  <Home className="h-3.5 w-3.5 mr-1.5" />
                  Add Tenant
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href="/properties?action=add">
                  <Building2 className="h-3.5 w-3.5 mr-1.5" />
                  Add Property
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href="/cases?action=add">
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Create Case
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href="/documents?action=upload">
                  <Upload className="h-3.5 w-3.5 mr-1.5" />
                  Upload Document
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href="/imports">
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  Import Data
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="bg-white border-gray-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-[#1a2b1a]">
                Cases by Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CasesStatusChart data={casesByStatus} />
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-[#1a2b1a]">
                Properties by Borough
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BoroughChart data={propertiesByBorough} />
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row: Urgent Cases | Upcoming Tasks | Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Urgent Cases */}
          <Card className="bg-white border-gray-100">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base font-semibold text-[#1a2b1a] flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                Urgent Cases
              </CardTitle>
              <Link
                href="/cases?priority=HIGH,CRITICAL"
                className="text-xs text-[#4caf50] hover:underline font-medium"
              >
                View all
              </Link>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {typedUrgentCases.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">No urgent cases</p>
              ) : (
                typedUrgentCases.map((c) => (
                  <Link
                    key={c.id}
                    href={`/cases/${c.id}`}
                    className="block rounded-lg border border-gray-100 p-3 hover:border-[#4caf50]/40 hover:bg-green-50/30 transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate group-hover:text-[#1a2b1a]">
                          {c.tenant?.contact?.fullName ?? "Unknown Tenant"}
                        </p>
                        <p className="text-xs text-gray-500 font-mono">{c.caseNumber}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span
                          className={cn(
                            "text-xs font-semibold px-2 py-0.5 rounded-full",
                            URGENCY_COLORS[c.priority as keyof typeof URGENCY_COLORS] ?? "bg-gray-100 text-gray-700"
                          )}
                        >
                          {c.priority}
                        </span>
                        <span
                          className={cn(
                            "text-xs px-2 py-0.5 rounded-full",
                            CASE_STATUS_COLORS[c.status] ?? "bg-gray-100 text-gray-700"
                          )}
                        >
                          {formatCaseStatus(c.status)}
                        </span>
                      </div>
                    </div>
                    {c.assignedStaff && (
                      <p className="text-xs text-gray-400 mt-1">
                        Staff: {c.assignedStaff.fullName}
                      </p>
                    )}
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          {/* Upcoming Tasks */}
          <Card className="bg-white border-gray-100">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base font-semibold text-[#1a2b1a] flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                Upcoming Tasks
              </CardTitle>
              <Link
                href="/tasks"
                className="text-xs text-[#4caf50] hover:underline font-medium"
              >
                View all
              </Link>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {typedUpcomingTasks.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">No upcoming tasks</p>
              ) : (
                typedUpcomingTasks.map((task) => (
                  <Link
                    key={task.id}
                    href={`/tasks/${task.id}`}
                    className="block rounded-lg border border-gray-100 p-3 hover:border-blue-200 hover:bg-blue-50/20 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-gray-800 truncate flex-1">
                        {task.title}
                      </p>
                      {task.dueDate && (
                        <span className="text-xs text-gray-500 shrink-0 whitespace-nowrap">
                          {formatDate(task.dueDate, "MMM d")}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      {task.assignedTo && (
                        <span className="text-xs text-gray-400">
                          {task.assignedTo.fullName}
                        </span>
                      )}
                      {task.relatedCase && (
                        <>
                          <span className="text-gray-300 text-xs">·</span>
                          <span className="text-xs text-gray-400 font-mono">
                            {task.relatedCase.caseNumber}
                          </span>
                        </>
                      )}
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-white border-gray-100">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base font-semibold text-[#1a2b1a]">
                Recent Activity
              </CardTitle>
              <Link
                href="/admin/audit"
                className="text-xs text-[#4caf50] hover:underline font-medium"
              >
                View all
              </Link>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-0">
                {typedActivity.length === 0 ? (
                  <p className="text-sm text-gray-400 py-4 text-center">No recent activity</p>
                ) : (
                  typedActivity.map((log, idx) => (
                    <div key={log.id}>
                      <div className="flex items-start gap-3 py-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#1a2b1a]/10 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-[#1a2b1a]">
                            {log.actor?.fullName?.[0]?.toUpperCase() ?? "S"}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-700 leading-relaxed">
                            <span className="font-semibold">{log.actor?.fullName ?? "System"}</span>{" "}
                            <span className="text-gray-500">{log.action.replace(/\./g, " ")}</span>
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            {formatRelativeDate(log.createdAt)}
                          </p>
                        </div>
                      </div>
                      {idx < typedActivity.length - 1 && (
                        <Separator className="bg-gray-50" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
