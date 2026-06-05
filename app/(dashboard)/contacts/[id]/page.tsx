import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  Building2,
  User,
  ArrowLeft,
  Edit,
  MoreHorizontal,
  PhoneCall,
  AtSign,
  Calendar,
  MessageSquare,
  FileText,
  CheckSquare,
  FolderOpen,
  Clock,
  Tag,
  Globe,
} from "lucide-react";
import { getContactById } from "@/lib/db/queries";
import {
  cn,
  formatDate,
  formatRelativeDate,
  CASE_STATUS_COLORS,
  TASK_STATUS_COLORS,
  formatCaseStatus,
} from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export const dynamic = "force-dynamic";

const NOTE_TYPE_ICONS: Record<string, React.ElementType> = {
  CALL: PhoneCall,
  EMAIL: AtSign,
  MEETING: Calendar,
  GENERAL: MessageSquare,
  STATUS_UPDATE: FileText,
  SYSTEM: Globe,
};

const CONTACT_TYPE_STYLES: Record<string, string> = {
  TENANT: "bg-blue-100 text-blue-700 border-blue-200",
  LANDLORD: "bg-purple-100 text-purple-700 border-purple-200",
  BROKER: "bg-amber-100 text-amber-700 border-amber-200",
  CASEWORKER: "bg-teal-100 text-teal-700 border-teal-200",
  OTHER: "bg-gray-100 text-gray-600 border-gray-200",
};

const STATUS_STYLES: Record<string, string> = {
  NEW: "bg-gray-100 text-gray-600",
  ACTIVE: "bg-green-100 text-green-700",
  INACTIVE: "bg-slate-100 text-slate-600",
  FOLLOW_UP_NEEDED: "bg-yellow-100 text-yellow-700",
  ARCHIVED: "bg-red-50 text-red-600",
};

function formatContactType(t: string) {
  const map: Record<string, string> = {
    TENANT: "Tenant", LANDLORD: "Landlord", BROKER: "Broker",
    CASEWORKER: "Caseworker", OTHER: "Other",
  };
  return map[t] ?? t;
}

function formatStatus(s: string) {
  const map: Record<string, string> = {
    NEW: "New", ACTIVE: "Active", INACTIVE: "Inactive",
    FOLLOW_UP_NEEDED: "Follow Up Needed", ARCHIVED: "Archived",
  };
  return map[s] ?? s;
}

interface ContactPageProps {
  params: Promise<{ id: string }>;
}

type ContactDetail = {
  id: string;
  fullName: string;
  contactType: string;
  status: string;
  phone?: string | null;
  alternatePhone?: string | null;
  email?: string | null;
  address?: string | null;
  borough?: string | null;
  neighborhood?: string | null;
  organization?: string | null;
  preferredContactMethod?: string | null;
  source?: string | null;
  tags: string[];
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  tenant?: {
    id: string;
    voucherType?: string | null;
    voucherSize?: number | null;
    tenantStatus: string;
    urgencyLevel: string;
    moveInDeadline?: Date | null;
    companyName?: string | null;
  } | null;
  landlord?: {
    id: string;
    companyName?: string | null;
    portfolioSize?: number | null;
    acceptsVouchers: boolean;
    section8Friendly: boolean;
  } | null;
  contactNotes?: Array<{
    id: string;
    note: string;
    noteType: string;
    createdAt: Date;
    createdBy?: { fullName: string; avatarUrl?: string | null } | null;
  }> | null;
  contactTasks?: Array<{
    id: string;
    title: string;
    status: string;
    dueDate?: Date | null;
    assignedTo?: { fullName: string } | null;
  }> | null;
  contactDocs?: Array<{
    id: string;
    fileName: string;
    fileUrl: string;
    uploadedAt: Date;
  }> | null;
  housingCases?: Array<{
    id: string;
    caseNumber: string;
    status: string;
    updatedAt: Date;
  }> | null;
};

export default async function ContactPage({ params }: ContactPageProps) {
  const { id } = await params;
  const rawContact = await getContactById(id);

  if (!rawContact) notFound();

  const contact = rawContact as unknown as ContactDetail;

  const noteCount = contact.contactNotes?.length ?? 0;
  const taskCount = contact.contactTasks?.length ?? 0;
  const docCount = contact.contactDocs?.length ?? 0;
  const caseCount = contact.housingCases?.length ?? 0;

  return (
    <div className="min-h-screen bg-[#f7f4ef]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* Back link */}
        <Link
          href="/contacts"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1a2b1a] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Contacts
        </Link>

        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-[#1a2b1a] flex items-center justify-center text-white text-xl font-bold shrink-0">
                {contact.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#1a2b1a]">{contact.fullName}</h1>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border",
                      CONTACT_TYPE_STYLES[contact.contactType] ?? "bg-gray-100 text-gray-600"
                    )}
                  >
                    {formatContactType(contact.contactType)}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                      STATUS_STYLES[contact.status] ?? "bg-gray-100 text-gray-600"
                    )}
                  >
                    {formatStatus(contact.status)}
                  </span>
                  {contact.organization && (
                    <span className="text-sm text-gray-500">{contact.organization}</span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Added {formatDate(contact.createdAt)} · Updated {formatRelativeDate(contact.updatedAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {contact.phone && (
                <Button asChild variant="outline" size="sm">
                  <a href={`tel:${contact.phone}`}>
                    <Phone className="h-3.5 w-3.5 mr-1.5" />
                    Call
                  </a>
                </Button>
              )}
              {contact.email && (
                <Button asChild variant="outline" size="sm">
                  <a href={`mailto:${contact.email}`}>
                    <Mail className="h-3.5 w-3.5 mr-1.5" />
                    Email
                  </a>
                </Button>
              )}
              <Button asChild size="sm" className="bg-[#1a2b1a] hover:bg-[#2a3b2a] text-white">
                <Link href={`/contacts/${id}/edit`}>
                  <Edit className="h-3.5 w-3.5 mr-1.5" />
                  Edit
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left: Contact Info + Type Details */}
          <div className="space-y-4">
            {/* Contact Info */}
            <Card className="bg-white border-gray-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                {contact.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <a href={`tel:${contact.phone}`} className="text-sm font-medium text-gray-800 hover:text-[#4caf50]">
                        {contact.phone}
                      </a>
                      <p className="text-xs text-gray-400">Primary</p>
                    </div>
                  </div>
                )}
                {contact.alternatePhone && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <a href={`tel:${contact.alternatePhone}`} className="text-sm text-gray-700 hover:text-[#4caf50]">
                        {contact.alternatePhone}
                      </a>
                      <p className="text-xs text-gray-400">Alternate</p>
                    </div>
                  </div>
                )}
                {contact.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                    <a href={`mailto:${contact.email}`} className="text-sm text-blue-600 hover:underline break-all">
                      {contact.email}
                    </a>
                  </div>
                )}
                {contact.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm text-gray-800">{contact.address}</p>
                      {(contact.borough || contact.neighborhood) && (
                        <p className="text-xs text-gray-400">
                          {[contact.neighborhood, contact.borough].filter(Boolean).join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                {contact.preferredContactMethod && (
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm text-gray-800 capitalize">{contact.preferredContactMethod}</p>
                      <p className="text-xs text-gray-400">Preferred method</p>
                    </div>
                  </div>
                )}
                {contact.source && (
                  <div className="flex items-start gap-3">
                    <Tag className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm text-gray-800">{contact.source}</p>
                      <p className="text-xs text-gray-400">Source</p>
                    </div>
                  </div>
                )}
                {contact.tags && contact.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {contact.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tenant details if contact is a tenant */}
            {contact.tenant && (
              <Card className="bg-white border-gray-100 border-l-4 border-l-blue-400">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center justify-between">
                    Tenant Details
                    <Link
                      href={`/tenants/${contact.tenant.id}`}
                      className="text-xs text-[#4caf50] hover:underline font-medium normal-case"
                    >
                      View Full Profile
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pt-0 text-sm">
                  {contact.tenant.voucherType && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Voucher Type</span>
                      <span className="font-medium">{contact.tenant.voucherType}</span>
                    </div>
                  )}
                  {contact.tenant.voucherSize && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Voucher Size</span>
                      <span className="font-medium">{contact.tenant.voucherSize} BR</span>
                    </div>
                  )}
                  {contact.tenant.tenantStatus && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status</span>
                      <span className="font-medium capitalize">{contact.tenant.tenantStatus.replace(/_/g, " ")}</span>
                    </div>
                  )}
                  {contact.tenant.urgencyLevel && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Urgency</span>
                      <span className="font-medium">{contact.tenant.urgencyLevel}</span>
                    </div>
                  )}
                  {contact.tenant.moveInDeadline && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Move-In Deadline</span>
                      <span className="font-medium text-orange-600">
                        {formatDate(contact.tenant.moveInDeadline)}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Landlord details */}
            {contact.landlord && (
              <Card className="bg-white border-gray-100 border-l-4 border-l-purple-400">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    Landlord Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pt-0 text-sm">
                  {contact.landlord.companyName && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Company</span>
                      <span className="font-medium">{contact.landlord.companyName}</span>
                    </div>
                  )}
                  {contact.landlord.portfolioSize !== undefined && contact.landlord.portfolioSize !== null && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Portfolio Size</span>
                      <span className="font-medium">{contact.landlord.portfolioSize} units</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Voucher Friendly</span>
                    <span className={cn("font-medium", contact.landlord.acceptsVouchers ? "text-green-600" : "text-gray-400")}>
                      {contact.landlord.acceptsVouchers ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Section 8</span>
                    <span className={cn("font-medium", contact.landlord.section8Friendly ? "text-green-600" : "text-gray-400")}>
                      {contact.landlord.section8Friendly ? "Yes" : "No"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right: Tabs */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="bg-white border border-gray-100 rounded-lg p-1 h-auto flex flex-wrap gap-1">
                <TabsTrigger value="overview" className="text-xs rounded-md data-[state=active]:bg-[#1a2b1a] data-[state=active]:text-white">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="notes" className="text-xs rounded-md data-[state=active]:bg-[#1a2b1a] data-[state=active]:text-white">
                  Notes {noteCount > 0 && `(${noteCount})`}
                </TabsTrigger>
                <TabsTrigger value="tasks" className="text-xs rounded-md data-[state=active]:bg-[#1a2b1a] data-[state=active]:text-white">
                  Tasks {taskCount > 0 && `(${taskCount})`}
                </TabsTrigger>
                <TabsTrigger value="documents" className="text-xs rounded-md data-[state=active]:bg-[#1a2b1a] data-[state=active]:text-white">
                  Documents {docCount > 0 && `(${docCount})`}
                </TabsTrigger>
                <TabsTrigger value="cases" className="text-xs rounded-md data-[state=active]:bg-[#1a2b1a] data-[state=active]:text-white">
                  Cases {caseCount > 0 && `(${caseCount})`}
                </TabsTrigger>
              </TabsList>

              {/* Overview */}
              <TabsContent value="overview">
                <Card className="bg-white border-gray-100">
                  <CardContent className="pt-5 space-y-4">
                    {contact.notes ? (
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Notes</p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{contact.notes}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 italic">No general notes on file.</p>
                    )}

                    {/* Quick stats */}
                    <div className="grid grid-cols-3 gap-3 pt-2">
                      {[
                        { label: "Notes", value: noteCount, icon: MessageSquare },
                        { label: "Tasks", value: taskCount, icon: CheckSquare },
                        { label: "Cases", value: caseCount, icon: FileText },
                      ].map(({ label, value, icon: Icon }) => (
                        <div key={label} className="bg-gray-50 rounded-lg p-3 text-center">
                          <Icon className="h-4 w-4 text-gray-400 mx-auto mb-1" />
                          <p className="text-xl font-bold text-[#1a2b1a]">{value}</p>
                          <p className="text-xs text-gray-500">{label}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notes */}
              <TabsContent value="notes">
                <Card className="bg-white border-gray-100">
                  <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                      Notes Timeline
                    </CardTitle>
                    <Button size="sm" variant="outline" className="h-7 text-xs">
                      Add Note
                    </Button>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {(contact.contactNotes?.length ?? 0) === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-8">No notes yet</p>
                    ) : (
                      <div className="space-y-0">
                        {contact.contactNotes!.map((note, idx) => {
                          const NoteIcon = NOTE_TYPE_ICONS[note.noteType] ?? MessageSquare;
                          return (
                            <div key={note.id}>
                              <div className="flex gap-3 py-4">
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                  <NoteIcon className="h-3.5 w-3.5 text-gray-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                      {note.noteType.replace(/_/g, " ")}
                                    </span>
                                    <span className="text-xs text-gray-400 shrink-0">
                                      {formatRelativeDate(note.createdAt)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">
                                    {note.note}
                                  </p>
                                  {note.createdBy && (
                                    <p className="text-xs text-gray-400 mt-1">
                                      by {note.createdBy.fullName}
                                    </p>
                                  )}
                                </div>
                              </div>
                              {idx < (contact.contactNotes!.length - 1) && (
                                <Separator className="bg-gray-50" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tasks */}
              <TabsContent value="tasks">
                <Card className="bg-white border-gray-100">
                  <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                      Tasks
                    </CardTitle>
                    <Button size="sm" variant="outline" className="h-7 text-xs">
                      Add Task
                    </Button>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    {(contact.contactTasks?.length ?? 0) === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-8">No tasks</p>
                    ) : (
                      contact.contactTasks!.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-start justify-between gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800">{task.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {task.assignedTo && (
                                <span className="text-xs text-gray-400">{task.assignedTo.fullName}</span>
                              )}
                              {task.dueDate && (
                                <span className="text-xs text-gray-400 flex items-center gap-0.5">
                                  <Clock className="h-3 w-3" />
                                  {formatDate(task.dueDate, "MMM d")}
                                </span>
                              )}
                            </div>
                          </div>
                          <span
                            className={cn(
                              "text-xs px-2 py-0.5 rounded-full shrink-0",
                              TASK_STATUS_COLORS[task.status] ?? "bg-gray-100 text-gray-600"
                            )}
                          >
                            {task.status.replace(/_/g, " ")}
                          </span>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Documents */}
              <TabsContent value="documents">
                <Card className="bg-white border-gray-100">
                  <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                      Documents
                    </CardTitle>
                    <Button size="sm" variant="outline" className="h-7 text-xs">
                      Upload
                    </Button>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    {(contact.contactDocs?.length ?? 0) === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-8">No documents uploaded</p>
                    ) : (
                      contact.contactDocs!.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <FolderOpen className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-800">{doc.fileName}</p>
                              <p className="text-xs text-gray-400">{formatDate(doc.uploadedAt)}</p>
                            </div>
                          </div>
                          {doc.fileUrl && (
                            <a
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline"
                            >
                              View
                            </a>
                          )}
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Cases */}
              <TabsContent value="cases">
                <Card className="bg-white border-gray-100">
                  <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                      Housing Cases
                    </CardTitle>
                    <Button size="sm" variant="outline" className="h-7 text-xs">
                      New Case
                    </Button>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    {(contact.housingCases?.length ?? 0) === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-8">No cases</p>
                    ) : (
                      contact.housingCases!.map((c) => (
                        <Link
                          key={c.id}
                          href={`/cases/${c.id}`}
                          className="flex items-start justify-between p-3 rounded-lg border border-gray-100 hover:border-[#4caf50]/40 hover:bg-green-50/30 transition-colors"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-800 font-mono">{c.caseNumber}</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              Updated {formatRelativeDate(c.updatedAt)}
                            </p>
                          </div>
                          <span
                            className={cn(
                              "text-xs px-2 py-0.5 rounded-full shrink-0",
                              CASE_STATUS_COLORS[c.status] ?? "bg-gray-100 text-gray-600"
                            )}
                          >
                            {formatCaseStatus(c.status)}
                          </span>
                        </Link>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
