"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn, formatDate, TASK_STATUS_COLORS } from "@/lib/utils";

const TABS = [
  { id: "all", label: "All Tasks" },
  { id: "today", label: "Today" },
  { id: "overdue", label: "Overdue" },
  { id: "upcoming", label: "Upcoming" },
  { id: "completed", label: "Completed" },
] as const;

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-600",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  HIGH: "bg-orange-100 text-orange-700",
  CRITICAL: "bg-red-100 text-red-700",
};

type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  dueDate?: Date | null;
  completedAt?: Date | null;
  updatedAt: Date;
  assignedTo?: { fullName: string; avatarUrl?: string | null } | null;
  relatedCase?: { caseNumber: string } | null;
  relatedContact?: { fullName: string } | null;
  relatedProperty?: { address: string; borough: string } | null;
};

interface TasksPageClientProps {
  allTasks: Task[];
  overdueTasks: Task[];
  todayTasks: Task[];
  completedTasks: Task[];
  activeTab: string;
}

export function TasksPageClient({
  allTasks,
  overdueTasks,
  todayTasks,
  completedTasks,
  activeTab: initialTab,
}: TasksPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [search, setSearch] = useState("");
  const [completingId, setCompletingId] = useState<string | null>(null);

  function switchTab(tab: string) {
    setActiveTab(tab);
    const p = new URLSearchParams();
    if (tab !== "all") p.set("tab", tab);
    startTransition(() => {
      router.push(`${pathname}?${p.toString()}`);
    });
  }

  async function completeTask(taskId: string) {
    setCompletingId(taskId);
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      });
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setCompletingId(null);
    }
  }

  function getTabTasks(): Task[] {
    let tasks: Task[];
    if (activeTab === "today") tasks = todayTasks;
    else if (activeTab === "overdue") tasks = overdueTasks;
    else if (activeTab === "completed") tasks = completedTasks;
    else if (activeTab === "upcoming") {
      const now = new Date();
      const weekEnd = new Date(now);
      weekEnd.setDate(weekEnd.getDate() + 7);
      tasks = allTasks.filter((t) => {
        if (!t.dueDate || t.status === "COMPLETED" || t.status === "CANCELLED") return false;
        const d = new Date(t.dueDate);
        return d > now && d <= weekEnd;
      });
    } else {
      tasks = allTasks;
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      tasks = tasks.filter((t) =>
        t.title.toLowerCase().includes(q) ||
        t.assignedTo?.fullName.toLowerCase().includes(q) ||
        t.relatedCase?.caseNumber.toLowerCase().includes(q) ||
        t.relatedContact?.fullName.toLowerCase().includes(q)
      );
    }
    return tasks;
  }

  const tasks = getTabTasks();

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => switchTab(tab.id)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
              activeTab === tab.id
                ? "bg-[#1a2b1a] text-white"
                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
            )}
          >
            {tab.label}
            {tab.id === "overdue" && overdueTasks.length > 0 && (
              <span className="ml-1.5 bg-red-500 text-white rounded-full text-[10px] px-1.5 py-0.5">
                {overdueTasks.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search tasks…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-white"
        />
      </div>

      {/* Table */}
      {tasks.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <p className="text-gray-500">No tasks found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="w-10 px-4 py-3"></th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Title</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Priority</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Due Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Assigned To</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Related</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tasks.map((task) => {
                  const isOverdue =
                    task.dueDate &&
                    new Date(task.dueDate) < new Date() &&
                    task.status !== "COMPLETED" &&
                    task.status !== "CANCELLED";

                  return (
                    <tr
                      key={task.id}
                      className={cn(
                        "transition-colors hover:bg-gray-50/50",
                        isOverdue && "bg-red-50/30"
                      )}
                    >
                      {/* Quick complete checkbox */}
                      <td className="px-4 py-3">
                        {task.status !== "COMPLETED" && task.status !== "CANCELLED" ? (
                          <button
                            onClick={() => completeTask(task.id)}
                            disabled={completingId === task.id}
                            title="Mark complete"
                            className={cn(
                              "h-5 w-5 rounded border-2 border-gray-300 flex items-center justify-center hover:border-[#4caf50] transition-colors",
                              completingId === task.id && "opacity-50"
                            )}
                          >
                            {completingId === task.id && (
                              <div className="h-2.5 w-2.5 rounded-full bg-[#4caf50] animate-pulse" />
                            )}
                          </button>
                        ) : (
                          <div className="h-5 w-5 rounded border-2 border-[#4caf50] bg-[#4caf50] flex items-center justify-center">
                            <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <p className={cn(
                          "font-medium",
                          task.status === "COMPLETED" ? "line-through text-gray-400" : "text-gray-900"
                        )}>
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{task.description}</p>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <span className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
                          PRIORITY_COLORS[task.priority] ?? "bg-gray-100 text-gray-600"
                        )}>
                          {task.priority}
                        </span>
                      </td>

                      <td className={cn("px-4 py-3 text-xs", isOverdue ? "text-red-500 font-semibold" : "text-gray-500")}>
                        {task.dueDate ? (
                          <span className={cn(isOverdue && "flex items-center gap-1")}>
                            {isOverdue && <span className="text-red-400">!</span>}
                            {formatDate(task.dueDate)}
                          </span>
                        ) : "—"}
                      </td>

                      <td className="px-4 py-3 text-xs text-gray-500">
                        {task.assignedTo?.fullName ?? "Unassigned"}
                      </td>

                      <td className="px-4 py-3">
                        {task.relatedCase ? (
                          <a
                            href={`/cases/${task.relatedCase.caseNumber}`}
                            className="inline-flex items-center gap-1 text-xs text-[#4caf50] hover:text-[#43a047] font-medium"
                          >
                            {task.relatedCase.caseNumber}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : task.relatedProperty ? (
                          <span className="text-xs text-gray-500 line-clamp-1">{task.relatedProperty.address}</span>
                        ) : task.relatedContact ? (
                          <span className="text-xs text-gray-500">{task.relatedContact.fullName}</span>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <span className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          TASK_STATUS_COLORS[task.status] ?? "bg-gray-100 text-gray-700"
                        )}>
                          {task.status.replace("_", " ")}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-500">
            Showing {tasks.length} task{tasks.length !== 1 ? "s" : ""}
          </div>
        </div>
      )}
    </div>
  );
}
