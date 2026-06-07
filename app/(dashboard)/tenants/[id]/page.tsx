import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  Phone,
  Mail,
  MapPin,
  Home,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Calendar,
  DollarSign,
  Users,
  Building2,
  MessageSquare,
  PhoneCall,
  AtSign,
  CheckSquare,
  FolderOpen,
  Clock,
  Globe,
  PawPrint,
  Accessibility,
} from "lucide-react";
import { getTenantById, getMatchingProperties } from "@/lib/db/queries";
import {
  cn,
  formatDate,
  formatRelativeDate,
  formatCurrency,
  URGENCY_COLORS,
  CASE_STATUS_COLORS,
  TASK_STATUS_COLORS,
  formatCaseStatus,
} from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const dynamic = "force-dynamic";

const NOTE_TYPE_ICONS: Record<string, React.ElementType> = {
  CALL: PhoneCall,
  EMAIL: AtSign,
  MEETING: Calendar,
  GENERAL: MessageSquare,
  STATUS_UPDATE: FileText,
  SYSTEM: Globe,
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
    NEW: "New", SEARCHING: "Searching", VIEWING: "Viewing",
    APPLICATION_SUBMITTED: "Application Submitted",
    INSPECTION_PENDING: "Inspection Pending",
    APPROVED: "Approved", HOUSED: "Housed", INACTIVE: "Inactive",
  };
  return map[s] ?? s.replace(/_/g, " ");
}

// Standard documents checklist
const REQUIRED_DOCUMENTS = [
  "Government-issued ID",
  "Proof of Income",
  "Voucher Letter",
  "Social Security Card",
  "Birth Certificates (all household members)",
  "Bank Statements (3 months)",
  "References",
];

type TenantDetail = {
  id: string;
  tenantStatus: string;
  urgencyLevel: string;
  voucherType?: string | null;
  voucherSize?: number | null;
  voucherNumber?: string | null;
  householdSize?: number | null;
  maxRent?: unknown;
  preferredBoroughs: string[];
  preferredNeighborhoods: string[];
  accessibilityNeeds?: string | null;
  pets: boolean;
  moveInDeadline?: Date | null;
  documentsComplete: boolean;
  missingDocuments: string[];
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  contact: {
    id: string;
    fullName: string;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
  };
  assignedCaseworker?: {
    id: string;
    agencyName?: string | null;
    contact?: { id: string; fullName: string } | null;
  } | null;
  housingCases?: Array<{
    id: string;
    caseNumber: string;
    status: string;
    updatedAt: Date;
    property?: { id: string; address: string; borough: string } | null;
    assignedStaff?: { fullName: string } | null;
  }> | null;
  tenantNotes?: Array<{
    id: string;
    note: string;
    noteType: string;
    createdAt: Date;
    createdBy?: { fullName: string; avatarUrl?: string | null } | null;
  }> | null;
  tenantTasks?: Array<{
    id: string;
    title: string;
    status: string;
    dueDate?: Date | null;
    assignedTo?: { fullName: string } | null;
  }> | null;
  documents?: Array<{
    id: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
    documentType: string;
    uploadedAt: Date;
  }> | null;
};

type MatchingProperty = {
  id: string;
  address: string;
  borough: string;
  neighborhood?: string | null;
  bedrooms: number;
  rent: unknown;
  landlord?: {
    contact: { fullName: string };
  } | null;
};

interface TenantPageProps {
  params: Promise<{ id: string }>;
}

export default async function TenantPage({ params }: TenantPageProps) {
  const { id } = await params;
  const [rawTenant, rawMatches] = await Promise.all([
    getTenantById(id),
    getMatchingProperties(id).catch(() => []),
  ]);

  if (!rawTenant) notFound();

  const tenant = rawTenant as unknown as TenantDetail;
  const matchingProperties = rawMatches as unknown as MatchingProperty[];

  const noteCount = tenant.tenantNotes?.length ?? 0;
  const taskCount = tenant.tenantTasks?.length ?? 0;
  const docCount = tenant.documents?.length ?? 0;
  const caseCount = tenant.housingCases?.length ?? 0;

  const missingDocs = tenant.missingDocuments ?? [];

  return (
    <div className="min-h-screen bg-[#f7f4ef]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* Back link */}
        <Link
          href="/tenants"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1a2b1a] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Tenants
        </Link>

        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-[#1a2b1a] flex items-center justify-center text-white text-xl font-bold shrink-0">
                {tenant.contact.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#1a2b1a]">{tenant.contact.fullName}</h1>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                      URGENCY_COLORS[tenant.urgencyLevel as keyof typeof URGENCY_COLORS] ?? "bg-gray-100 text-gray-600"
                    )}
                  >
                    {tenant.urgencyLevel} Urgency
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                      TENANT_STATUS_STYLES[tenant.tenantStatus] ?? "bg-gray-100 text-gray-600"
                    )}
                  >
                    {formatTenantStatus(tenant.tenantStatus)}
                  </span>
                  {!tenant.documentsComplete && (
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-yellow-100 text-yellow-700">
                      Docs Incomplete
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Added {formatDate(tenant.createdAt)} · Updated {formatRelativeDate(tenant.updatedAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {tenant.contact.phone && (
                <Button asChild variant="outline" size="sm">
                  <a href={`tel:${tenant.contact.phone}`}>
                    <Phone className="h-3.5 w-3.5 mr-1.5" />
                    Call
                  </a>
                </Button>
              )}
              <Button asChild size="sm" className="bg-[#1a2b1a] hover:bg-[#2a3b2a] text-white">
                <Link href={`/tenants/${id}/edit`}>
                  <Edit className="h-3.5 w-3.5 mr-1.5" />
                  Edit
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Missing Docs Alert */}
        {missingDocs.length > 0 && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <span className="font-semibold">Missing Documents: </span>
              {missingDocs.join(", ")}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left Column: Info Cards */}
          <div className="space-y-4">
            {/* Contact Info */}
            <Card className="bg-white border-gray-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Contact Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5 pt-0">
                {tenant.contact.phone && (
                  <div className="flex items-center gap-2.5">
                    <Phone className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                    <a href={`tel:${tenant.contact.phone}`} className="text-sm text-gray-800 hover:text-[#4caf50]">
                      {tenant.contact.phone}
                    </a>
                  </div>
                )}
                {tenant.contact.email && (
                  <div className="flex items-center gap-2.5">
                    <Mail className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                    <a href={`mailto:${tenant.contact.email}`} className="text-sm text-blue-600 hover:underline break-all">
                      {tenant.contact.email}
                    </a>
                  </div>
                )}
                {tenant.contact.address && (
                  <div className="flex items-start gap-2.5">
                    <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-800">{tenant.contact.address}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Voucher Info */}
            <Card className="bg-white border-gray-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Voucher Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-0 text-sm">
                {[
                  { label: "Voucher Type", value: tenant.voucherType },
                  { label: "Voucher Size", value: tenant.voucherSize != null ? (tenant.voucherSize === 0 ? "Studio" : `${tenant.voucherSize} Bedroom`) : null },
                  { label: "Voucher Number", value: tenant.voucherNumber },
                  { label: "Household Size", value: tenant.householdSize != null ? `${tenant.householdSize} ${tenant.householdSize === 1 ? "person" : "people"}` : null },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-start gap-2">
                    <span className="text-gray-500 shrink-0">{label}</span>
                    <span className="font-medium text-right">
                      {value ?? <span className="text-gray-300 font-normal">—</span>}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Financial Info */}
            <Card className="bg-white border-gray-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Financial
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-0 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Max Rent</span>
                  <span className="font-medium text-[#1a2b1a]">
                    {tenant.maxRent ? formatCurrency(Number(tenant.maxRent)) : <span className="text-gray-300 font-normal">—</span>}
                  </span>
                </div>
                {tenant.moveInDeadline && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Move-In Deadline</span>
                    <span
                      className={cn(
                        "font-medium",
                        new Date(tenant.moveInDeadline) < new Date() ? "text-red-600" : "text-gray-800"
                      )}
                    >
                      {formatDate(tenant.moveInDeadline)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card className="bg-white border-gray-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                {tenant.preferredBoroughs.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Boroughs</p>
                    <div className="flex flex-wrap gap-1">
                      {tenant.preferredBoroughs.map((b) => (
                        <span key={b} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {tenant.preferredNeighborhoods && tenant.preferredNeighborhoods.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Neighborhoods</p>
                    <div className="flex flex-wrap gap-1">
                      {tenant.preferredNeighborhoods.map((n) => (
                        <span key={n} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          {n}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <div className={cn("flex items-center gap-1", tenant.pets ? "text-orange-600" : "text-gray-400")}>
                    <PawPrint className="h-3.5 w-3.5" />
                    <span className="text-xs">{tenant.pets ? "Pets" : "No pets"}</span>
                  </div>
                </div>
                {tenant.accessibilityNeeds && (
                  <div className="flex items-start gap-2">
                    <Accessibility className="h-3.5 w-3.5 text-blue-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-gray-700">{tenant.accessibilityNeeds}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Assigned Caseworker */}
            {tenant.assignedCaseworker && (
              <Card className="bg-white border-gray-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Assigned Caseworker
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <Link
                    href={`/contacts/${tenant.assignedCaseworker.contact?.id ?? ""}`}
                    className="flex items-center gap-2 hover:text-[#4caf50] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-sm">
                      {tenant.assignedCaseworker.contact?.fullName?.[0] ?? "?"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {tenant.assignedCaseworker.contact?.fullName ?? "—"}
                      </p>
                      {tenant.assignedCaseworker.agencyName && (
                        <p className="text-xs text-gray-400">{tenant.assignedCaseworker.agencyName}</p>
                      )}
                    </div>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Documents Checklist */}
            <Card className="bg-white border-gray-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                  Documents Checklist
                  <span
                    className={cn(
                      "text-xs font-semibold px-1.5 py-0.5 rounded",
                      tenant.documentsComplete
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    )}
                  >
                    {tenant.documentsComplete ? "Complete" : "Incomplete"}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-1.5">
                {REQUIRED_DOCUMENTS.map((doc) => {
                  const isMissing = missingDocs.some((m) =>
                    m.toLowerCase().includes(doc.split(" ")[0].toLowerCase())
                  );
                  return (
                    <div key={doc} className="flex items-center gap-2">
                      {isMissing ? (
                        <XCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                      )}
                      <span
                        className={cn(
                          "text-xs",
                          isMissing ? "text-red-600 font-medium" : "text-gray-600"
                        )}
                      >
                        {doc}
                      </span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Right: Tabs */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="cases" className="space-y-4">
              <TabsList className="bg-white border border-gray-100 rounded-lg p-1 h-auto flex flex-wrap gap-1">
                <TabsTrigger value="cases" className="text-xs rounded-md data-[state=active]:bg-[#1a2b1a] data-[state=active]:text-white">
                  Cases {caseCount > 0 && `(${caseCount})`}
                </TabsTrigger>
                <TabsTrigger value="matches" className="text-xs rounded-md data-[state=active]:bg-[#1a2b1a] data-[state=active]:text-white">
                  Property Matches {matchingProperties.length > 0 && `(${matchingProperties.length})`}
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
              </TabsList>

              {/* Housing Cases */}
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
                    {caseCount === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-8">No housing cases</p>
                    ) : (
                      tenant.housingCases!.map((c) => (
                        <Link
                          key={c.id}
                          href={`/cases/${c.id}`}
                          className="block rounded-lg border border-gray-100 p-4 hover:border-[#4caf50]/40 hover:bg-green-50/20 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-medium font-mono text-gray-900">{c.caseNumber}</p>
                              {c.property && (
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {c.property.address}, {c.property.borough}
                                </p>
                              )}
                              {c.assignedStaff && (
                                <p className="text-xs text-gray-400 mt-0.5">
                                  Assigned: {c.assignedStaff.fullName}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-1 shrink-0">
                              <span
                                className={cn(
                                  "text-xs px-2 py-0.5 rounded-full",
                                  CASE_STATUS_COLORS[c.status] ?? "bg-gray-100 text-gray-600"
                                )}
                              >
                                {formatCaseStatus(c.status)}
                              </span>
                              <span className="text-xs text-gray-400">
                                {formatRelativeDate(c.updatedAt)}
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Property Matches */}
              <TabsContent value="matches">
                <Card className="bg-white border-gray-100">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                      Matching Properties
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    {matchingProperties.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-8">
                        No matching properties found based on current criteria
                      </p>
                    ) : (
                      matchingProperties.map((prop) => (
                        <Link
                          key={prop.id}
                          href={`/properties/${prop.id}`}
                          className="block rounded-lg border border-gray-100 p-4 hover:border-[#4caf50]/40 hover:bg-green-50/20 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{prop.address}</p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {prop.neighborhood ? `${prop.neighborhood}, ` : ""}
                                {prop.borough}
                              </p>
                              {prop.landlord && (
                                <p className="text-xs text-gray-400 mt-0.5">
                                  {prop.landlord.contact.fullName}
                                </p>
                              )}
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-sm font-bold text-[#1a2b1a]">
                                {formatCurrency(Number(prop.rent))}/mo
                              </p>
                              <p className="text-xs text-gray-500">
                                {prop.bedrooms === 0 ? "Studio" : `${prop.bedrooms} BR`}
                              </p>
                              <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                                Available
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))
                    )}
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
                    {noteCount === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-8">No notes yet</p>
                    ) : (
                      <div className="space-y-0">
                        {tenant.tenantNotes!.map((note, idx) => {
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
                                  <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">{note.note}</p>
                                  {note.createdBy && (
                                    <p className="text-xs text-gray-400 mt-1">by {note.createdBy.fullName}</p>
                                  )}
                                </div>
                              </div>
                              {idx < tenant.tenantNotes!.length - 1 && <Separator className="bg-gray-50" />}
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
                    {taskCount === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-8">No tasks</p>
                    ) : (
                      tenant.tenantTasks!.map((task) => (
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
                    {docCount === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-8">No documents uploaded</p>
                    ) : (
                      tenant.documents!.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <FolderOpen className="h-4 w-4 text-gray-400 shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-gray-800">{doc.fileName}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-gray-400">{doc.documentType.replace(/_/g, " ")}</span>
                                <span className="text-xs text-gray-300">·</span>
                                <span className="text-xs text-gray-400">{formatDate(doc.uploadedAt)}</span>
                              </div>
                            </div>
                          </div>
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline shrink-0"
                          >
                            View
                          </a>
                        </div>
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
