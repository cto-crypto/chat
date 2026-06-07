import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Edit, Phone, Mail, User, Building2, Calendar,
  AlertTriangle, FileText, CheckCircle2, Clock, StickyNote,
  MessageSquare, Plus, Tag, Home
} from "lucide-react";
import { getCaseById } from "@/lib/db/queries";
import {
  cn, formatCaseStatus, formatDate, formatCurrency,
  CASE_STATUS_COLORS, TASK_STATUS_COLORS
} from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CaseStatusPipeline } from "@/components/cases/case-status-pipeline";
import { CaseDetailClient } from "@/components/cases/case-detail-client";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = await getCaseById(id);
  return { title: c ? `${c.caseNumber} — KeevOS` : "Case — KeevOS" };
}

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-600 border-gray-200",
  MEDIUM: "bg-yellow-100 text-yellow-700 border-yellow-200",
  HIGH: "bg-orange-100 text-orange-700 border-orange-200",
  CRITICAL: "bg-red-100 text-red-700 border-red-200",
};

const PRIORITY_LABELS: Record<string, string> = {
  LOW: "Low Priority",
  MEDIUM: "Medium Priority",
  HIGH: "High Priority",
  CRITICAL: "Critical",
};

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const caseData = await getCaseById(id);
  if (!caseData) notFound();

  const tenant = caseData.tenant;
  const property = caseData.property;
  const landlord = caseData.landlord ?? property?.landlord;
  const broker = caseData.broker;
  const caseworker = caseData.caseworker;
  const assignedStaff = caseData.assignedStaff;

  const isOverdue =
    caseData.nextFollowUpDate && new Date(caseData.nextFollowUpDate) < new Date();

  const activeTasks = caseData.caseTasks.filter((t: { status: string }) => t.status !== "COMPLETED" && t.status !== "CANCELLED");
  const completedTasks = caseData.caseTasks.filter((t: { status: string }) => t.status === "COMPLETED");

  return (
    <div className="p-6 space-y-6">
      {/* Back nav */}
      <div>
        <Link
          href="/cases"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1a2b1a] mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Cases
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold font-mono text-[#1a2b1a]">{caseData.caseNumber}</h1>
              <span className={cn(
                "inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold",
                CASE_STATUS_COLORS[caseData.status] ?? "bg-gray-100 text-gray-700"
              )}>
                {formatCaseStatus(caseData.status)}
              </span>
              <span className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                PRIORITY_COLORS[caseData.priority] ?? "bg-gray-100 text-gray-600"
              )}>
                {PRIORITY_LABELS[caseData.priority] ?? caseData.priority}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {tenant?.contact.fullName ?? "No tenant assigned"}
              {property ? ` · ${property.address}` : ""}
            </p>
          </div>
          <Button variant="outline" className="gap-2 flex-shrink-0" size="sm">
            <Edit className="h-4 w-4" />
            Edit Case
          </Button>
        </div>
      </div>

      {/* Blocker Alert */}
      {caseData.blockers && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">Case Blocker</p>
            <p className="text-sm text-red-700 mt-0.5">{caseData.blockers}</p>
          </div>
        </div>
      )}

      {/* Pipeline */}
      <CaseStatusPipeline currentStatus={caseData.status} />

      {/* Main three-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: People cards */}
        <div className="space-y-4">
          {/* Tenant Info */}
          {tenant ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Tenant</h3>
              <Link href={`/contacts/${tenant.contactId}`} className="group">
                <p className="font-semibold text-[#1a2b1a] group-hover:text-[#4caf50] transition-colors">
                  {tenant.contact.fullName}
                </p>
              </Link>
              {tenant.contact.phone && (
                <a href={`tel:${tenant.contact.phone}`} className="flex items-center gap-1.5 text-sm text-gray-600 mt-1.5 hover:text-[#4caf50]">
                  <Phone className="h-3.5 w-3.5 text-gray-400" />
                  {tenant.contact.phone}
                </a>
              )}
              {tenant.contact.email && (
                <a href={`mailto:${tenant.contact.email}`} className="flex items-center gap-1.5 text-sm text-gray-600 mt-1 hover:text-[#4caf50]">
                  <Mail className="h-3.5 w-3.5 text-gray-400" />
                  {tenant.contact.email}
                </a>
              )}
              <Separator className="my-3" />
              <div className="space-y-1.5">
                {tenant.voucherType && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Voucher Type</span>
                    <span className="font-medium text-gray-700 bg-green-50 text-green-700 rounded-full px-2 py-0.5">{tenant.voucherType}</span>
                  </div>
                )}
                {tenant.voucherSize && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Voucher Size</span>
                    <span className="font-medium text-gray-700">{tenant.voucherSize} BR</span>
                  </div>
                )}
                {tenant.maxRent && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Max Rent</span>
                    <span className="font-medium text-gray-700">{formatCurrency(Number(tenant.maxRent))}</span>
                  </div>
                )}
                {tenant.householdSize && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Household Size</span>
                    <span className="font-medium text-gray-700">{tenant.householdSize}</span>
                  </div>
                )}
                {tenant.urgencyLevel && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Urgency</span>
                    <span className={cn(
                      "font-semibold rounded-full px-2 py-0.5",
                      tenant.urgencyLevel === "CRITICAL" ? "bg-red-100 text-red-700" :
                      tenant.urgencyLevel === "HIGH" ? "bg-orange-100 text-orange-700" :
                      tenant.urgencyLevel === "MEDIUM" ? "bg-yellow-100 text-yellow-700" :
                      "bg-gray-100 text-gray-600"
                    )}>
                      {tenant.urgencyLevel}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-dashed border-gray-200 p-4 text-center">
              <p className="text-sm text-gray-400">No tenant linked</p>
              <Button variant="outline" size="sm" className="mt-2 gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Link Tenant
              </Button>
            </div>
          )}

          {/* Property Card */}
          {property ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Property</h3>
              <Link href={`/properties/${property.id}`} className="group">
                <p className="font-semibold text-[#1a2b1a] group-hover:text-[#4caf50] text-sm leading-snug">
                  {property.address}
                </p>
              </Link>
              <p className="text-xs text-gray-500 mt-0.5">{property.borough}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
                <span>{property.bedrooms} BR</span>
                {property.bathrooms && <span>{Number(property.bathrooms)} BA</span>}
                <span className="font-semibold">{formatCurrency(Number(property.rent))}/mo</span>
              </div>
              {property.voucherAccepted && (
                <span className="inline-flex items-center gap-1 mt-2 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                  <CheckCircle2 className="h-3 w-3" /> Voucher OK
                </span>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-dashed border-gray-200 p-4 text-center">
              <p className="text-sm text-gray-400">No property linked</p>
              <Button variant="outline" size="sm" className="mt-2 gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Link Property
              </Button>
            </div>
          )}

          {/* Landlord Card */}
          {landlord && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Landlord</h3>
              <Link href={`/contacts/${landlord.contactId}`} className="group">
                <p className="font-semibold text-[#1a2b1a] group-hover:text-[#4caf50] text-sm">
                  {landlord.contact.fullName}
                </p>
              </Link>
              {landlord.companyName && (
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <Building2 className="h-3 w-3" />{landlord.companyName}
                </p>
              )}
              {landlord.contact.phone && (
                <a href={`tel:${landlord.contact.phone}`} className="flex items-center gap-1.5 text-xs text-gray-600 mt-1.5 hover:text-[#4caf50]">
                  <Phone className="h-3 w-3 text-gray-400" />{landlord.contact.phone}
                </a>
              )}
              {landlord.contact.email && (
                <a href={`mailto:${landlord.contact.email}`} className="flex items-center gap-1.5 text-xs text-gray-600 mt-0.5 hover:text-[#4caf50]">
                  <Mail className="h-3 w-3 text-gray-400" />{landlord.contact.email}
                </a>
              )}
            </div>
          )}

          {/* Caseworker + Assigned Staff */}
          {(caseworker || assignedStaff) && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
              {caseworker && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Caseworker</h3>
                  <p className="text-sm font-medium text-gray-900">{caseworker.contact.fullName}</p>
                  {caseworker.agencyName && <p className="text-xs text-gray-500">{caseworker.agencyName}</p>}
                  {caseworker.contact.phone && (
                    <a href={`tel:${caseworker.contact.phone}`} className="flex items-center gap-1.5 text-xs text-gray-600 mt-1 hover:text-[#4caf50]">
                      <Phone className="h-3 w-3 text-gray-400" />{caseworker.contact.phone}
                    </a>
                  )}
                </div>
              )}
              {caseworker && assignedStaff && <Separator />}
              {assignedStaff && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Assigned Staff</h3>
                  <p className="text-sm font-medium text-gray-900">{assignedStaff.fullName}</p>
                  {assignedStaff.email && <p className="text-xs text-gray-500">{assignedStaff.email}</p>}
                </div>
              )}
            </div>
          )}

          {/* Follow-up Date */}
          <div className={cn(
            "rounded-xl border p-4",
            isOverdue ? "bg-red-50 border-red-200" : "bg-white border-gray-100 shadow-sm"
          )}>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Next Follow-up
            </h3>
            {caseData.nextFollowUpDate ? (
              <p className={cn(
                "text-base font-semibold",
                isOverdue ? "text-red-700" : "text-[#1a2b1a]"
              )}>
                {formatDate(caseData.nextFollowUpDate, "MMMM d, yyyy")}
                {isOverdue && <span className="ml-2 text-xs font-medium text-red-500">OVERDUE</span>}
              </p>
            ) : (
              <p className="text-sm text-gray-400">No follow-up scheduled</p>
            )}
            {caseData.moveInTargetDate && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-400">Move-in Target</p>
                <p className="text-sm font-medium text-gray-700">{formatDate(caseData.moveInTargetDate, "MMMM d, yyyy")}</p>
              </div>
            )}
          </div>

          {/* Case Metadata */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-xs text-gray-400 space-y-1.5">
            <div className="flex justify-between">
              <span>Created</span>
              <span>{formatDate(caseData.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span>Last Updated</span>
              <span>{formatDate(caseData.updatedAt)}</span>
            </div>
            {caseData.lastContactedAt && (
              <div className="flex justify-between">
                <span>Last Contact</span>
                <span>{formatDate(caseData.lastContactedAt)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Middle column: Activity timeline + note form */}
        <div className="space-y-4">
          {/* Case Summary */}
          {caseData.caseSummary && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Case Summary</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{caseData.caseSummary}</p>
            </div>
          )}

          {/* Status Update Buttons */}
          <CaseDetailClient
            caseId={caseData.id}
            currentStatus={caseData.status}
            caseNotes={caseData.caseNotes}
          />
        </div>

        {/* Right column: Tasks, Documents */}
        <div className="space-y-4">
          {/* Tasks Panel */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#1a2b1a] flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#4caf50]" />
                Tasks
                {activeTasks.length > 0 && (
                  <span className="bg-orange-100 text-orange-700 text-xs font-semibold rounded-full px-1.5 py-0.5">
                    {activeTasks.length}
                  </span>
                )}
              </h3>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Add Task
              </Button>
            </div>

            {caseData.caseTasks.length === 0 ? (
              <p className="text-sm text-gray-400">No tasks yet.</p>
            ) : (
              <div className="space-y-2">
                {activeTasks.map((task: { id: string; title: string; description?: string | null; status: string; priority: string; dueDate?: Date | null; assignedTo?: { fullName: string } | null }) => {
                  const taskOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "COMPLETED";
                  return (
                    <div key={task.id} className={cn(
                      "flex items-start gap-3 p-3 rounded-lg border",
                      taskOverdue ? "border-red-100 bg-red-50" : "border-gray-100 bg-gray-50"
                    )}>
                      <div className={cn(
                        "flex-shrink-0 mt-0.5 h-4 w-4 rounded border-2",
                        task.status === "IN_PROGRESS" ? "border-blue-400 bg-blue-100" : "border-gray-300"
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {task.dueDate && (
                            <span className={cn("text-xs", taskOverdue ? "text-red-500 font-medium" : "text-gray-400")}>
                              {formatDate(task.dueDate)}
                            </span>
                          )}
                          {task.assignedTo && (
                            <span className="text-xs text-gray-400">{task.assignedTo.fullName}</span>
                          )}
                        </div>
                      </div>
                      <span className={cn(
                        "flex-shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                        task.priority === "CRITICAL" ? "bg-red-100 text-red-700" :
                        task.priority === "HIGH" ? "bg-orange-100 text-orange-700" :
                        "bg-gray-100 text-gray-600"
                      )}>
                        {task.priority}
                      </span>
                    </div>
                  );
                })}
                {completedTasks.length > 0 && (
                  <p className="text-xs text-gray-400 pt-1">
                    +{completedTasks.length} completed task{completedTasks.length !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Documents Panel */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#1a2b1a] flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#4caf50]" />
                Documents
              </h3>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Upload
              </Button>
            </div>
            {caseData.documents.length === 0 ? (
              <p className="text-sm text-gray-400">No documents uploaded.</p>
            ) : (
              <div className="space-y-2">
                {caseData.documents.map((doc: { id: string; fileName: string; fileUrl: string; documentType: string; uploadedAt: Date }) => (
                  <a
                    key={doc.id}
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{doc.fileName}</p>
                      <p className="text-xs text-gray-400">{doc.documentType} · {formatDate(doc.uploadedAt)}</p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
