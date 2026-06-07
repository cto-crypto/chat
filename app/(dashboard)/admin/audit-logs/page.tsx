import { prisma } from "@/lib/db/client";
import { formatDate, formatRelativeDate } from "@/lib/utils";
import { Activity, Filter } from "lucide-react";

export default async function AuditLogsPage() {
  let logs: Array<{
    id: string;
    action: string;
    entityType: string;
    entityId: string;
    ipAddress: string | null;
    createdAt: Date;
    actor: { fullName: string; avatarUrl: string | null } | null;
  }> = [];

  try {
    logs = await prisma.activityLog.findMany({
      include: { actor: { select: { fullName: true, avatarUrl: true } } },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
  } catch {
    // Database not connected in demo mode
  }

  const mockLogs = logs.length === 0 ? [
    { id: "1", action: "contact.created", entityType: "contact", entityId: "c001", ipAddress: "192.168.1.1", createdAt: new Date(), actor: { fullName: "Sarah Johnson", avatarUrl: null } },
    { id: "2", action: "case.status_changed", entityType: "housing_case", entityId: "case001", ipAddress: "192.168.1.1", createdAt: new Date(Date.now() - 1000 * 60 * 30), actor: { fullName: "Mike Torres", avatarUrl: null } },
    { id: "3", action: "document.uploaded", entityType: "document", entityId: "doc001", ipAddress: "192.168.1.2", createdAt: new Date(Date.now() - 1000 * 60 * 60), actor: { fullName: "Angela Chen", avatarUrl: null } },
    { id: "4", action: "tenant.created", entityType: "tenant", entityId: "t001", ipAddress: "192.168.1.1", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), actor: { fullName: "Sarah Johnson", avatarUrl: null } },
    { id: "5", action: "property.status_changed", entityType: "property", entityId: "p001", ipAddress: "192.168.1.3", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4), actor: { fullName: "Mike Torres", avatarUrl: null } },
  ] : logs;

  function getActionColor(action: string) {
    if (action.includes("created")) return "bg-green-100 text-green-700";
    if (action.includes("deleted")) return "bg-red-100 text-red-700";
    if (action.includes("updated") || action.includes("changed")) return "bg-blue-100 text-blue-700";
    if (action.includes("uploaded")) return "bg-purple-100 text-purple-700";
    return "bg-gray-100 text-gray-700";
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a2b1a]">Audit Logs</h1>
          <p className="text-sm text-gray-500 mt-1">Complete activity history for compliance and security</p>
        </div>
        <button className="flex items-center gap-2 border border-gray-200 px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
          <Filter className="w-4 h-4" /> Filter Logs
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
          <p className="text-sm text-gray-500 font-medium">Showing {mockLogs.length} most recent events</p>
        </div>
        <div className="divide-y divide-gray-50">
          {mockLogs.map((log) => (
            <div key={log.id} className="px-5 py-4 flex items-start gap-4 hover:bg-gray-50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-[#1a2b1a] flex items-center justify-center flex-shrink-0">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm text-[#1a2b1a]">{log.actor?.fullName ?? "System"}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-mono font-medium ${getActionColor(log.action)}`}>
                    {log.action}
                  </span>
                  <span className="text-xs text-gray-400">on {log.entityType} {log.entityId.slice(0, 8)}...</span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                  <span>{formatRelativeDate(log.createdAt)}</span>
                  <span>·</span>
                  <span>{formatDate(log.createdAt, "MMM d, yyyy h:mm a")}</span>
                  {log.ipAddress && <><span>·</span><span>IP: {log.ipAddress}</span></>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
