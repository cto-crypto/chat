import { CheckCircle2, Clock, AlertCircle, CalendarDays } from "lucide-react";
import { getTasks } from "@/lib/db/queries";
import { cn, formatDate, TASK_STATUS_COLORS } from "@/lib/utils";
import { AddTaskDialog } from "@/components/tasks/add-task-dialog";
import { TasksPageClient } from "@/components/tasks/tasks-page-client";

export const metadata = { title: "Tasks — KeevOS" };

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const activeTab = typeof params.tab === "string" ? params.tab : "all";

  // Fetch all tasks for stats, then filtered set for display
  const [allTasks, overdueTasks, todayTasks, completedThisMonth] = await Promise.all([
    getTasks({ limit: 500 }),
    getTasks({ overdue: true, limit: 200 }),
    getTasks({ today: true, limit: 200 }),
    getTasks({ status: "COMPLETED", limit: 500 }),
  ]);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  type TaskItem = { completedAt?: Date | null; dueDate?: Date | null; status: string };
  const completedThisMonthCount = completedThisMonth.tasks.filter(
    (t: TaskItem) => t.completedAt && new Date(t.completedAt) >= monthStart
  ).length;

  // Due this week
  const weekEnd = new Date(now);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const dueThisWeek = allTasks.tasks.filter((t: TaskItem) => {
    if (!t.dueDate || t.status === "COMPLETED" || t.status === "CANCELLED") return false;
    const d = new Date(t.dueDate);
    return d >= now && d <= weekEnd;
  }).length;

  const stats = [
    { label: "Today's Tasks", value: todayTasks.total, icon: CalendarDays, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Overdue", value: overdueTasks.total, icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
    { label: "Due This Week", value: dueThisWeek, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
    { label: "Completed This Month", value: completedThisMonthCount, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
  ];

  // Pick the correct task set based on tab
  let displayTasks = allTasks.tasks;
  if (activeTab === "today") displayTasks = todayTasks.tasks;
  else if (activeTab === "overdue") displayTasks = overdueTasks.tasks;
  else if (activeTab === "completed") displayTasks = completedThisMonth.tasks;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a2b1a]">Tasks & Follow-ups</h1>
          <p className="text-sm text-gray-500 mt-0.5">{allTasks.total} total tasks</p>
        </div>
        <AddTaskDialog />
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

      {/* Tasks table with tabs */}
      <TasksPageClient
        allTasks={allTasks.tasks as Parameters<typeof TasksPageClient>[0]["allTasks"]}
        overdueTasks={overdueTasks.tasks as Parameters<typeof TasksPageClient>[0]["overdueTasks"]}
        todayTasks={todayTasks.tasks as Parameters<typeof TasksPageClient>[0]["todayTasks"]}
        completedTasks={completedThisMonth.tasks as Parameters<typeof TasksPageClient>[0]["completedTasks"]}
        activeTab={activeTab}
      />
    </div>
  );
}
