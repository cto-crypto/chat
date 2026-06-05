import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Edit, Archive, Plus, Home, MapPin, BedDouble, Bath,
  DollarSign, CheckCircle2, XCircle, Phone, Mail, User, Building2,
  FileText, Clock, StickyNote, Tag
} from "lucide-react";
import { getPropertyById } from "@/lib/db/queries";
import { cn, formatCurrency, formatDate, formatCaseStatus, formatPropertyStatus, PROPERTY_STATUS_COLORS, CASE_STATUS_COLORS } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const property = await getPropertyById(id);
  return { title: property ? `${property.address} — KeevOS` : "Property — KeevOS" };
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property = await getPropertyById(id);
  if (!property) notFound();

  const landlord = property.landlord;
  const broker = property.broker;

  return (
    <div className="p-6 space-y-6">
      {/* Back + Header */}
      <div>
        <Link
          href="/properties"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1a2b1a] mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Properties
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-[#1a2b1a]">{property.address}</h1>
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                  PROPERTY_STATUS_COLORS[property.status] ?? "bg-gray-100 text-gray-700"
                )}
              >
                {formatPropertyStatus(property.status)}
              </span>
              {property.voucherAccepted && (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                  <CheckCircle2 className="h-3 w-3" />
                  Voucher Accepted
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {property.borough}{property.neighborhood ? ` · ${property.neighborhood}` : ""}
              {property.zipCode ? ` · ${property.zipCode}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button variant="outline" className="gap-2" size="sm">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <Link href={`/cases/new?propertyId=${property.id}`}>
              <Button className="bg-[#4caf50] hover:bg-[#43a047] text-white gap-2" size="sm">
                <Plus className="h-4 w-4" />
                Create Case
              </Button>
            </Link>
            <Button variant="outline" className="gap-2 text-gray-500" size="sm">
              <Archive className="h-4 w-4" />
              Archive
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Main Info Card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-[#1a2b1a] mb-4 flex items-center gap-2">
              <Home className="h-4 w-4 text-[#4caf50]" />
              Property Details
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <InfoItem icon={MapPin} label="Borough" value={property.borough} />
              {property.neighborhood && (
                <InfoItem icon={MapPin} label="Neighborhood" value={property.neighborhood} />
              )}
              {property.zipCode && (
                <InfoItem icon={MapPin} label="ZIP Code" value={property.zipCode} />
              )}
              <InfoItem icon={BedDouble} label="Bedrooms" value={`${property.bedrooms} bedroom${property.bedrooms !== 1 ? "s" : ""}`} />
              {property.bathrooms && (
                <InfoItem icon={Bath} label="Bathrooms" value={`${Number(property.bathrooms)} bathroom${Number(property.bathrooms) !== 1 ? "s" : ""}`} />
              )}
              <InfoItem icon={DollarSign} label="Monthly Rent" value={formatCurrency(Number(property.rent))} highlight />
              {property.securityDeposit && (
                <InfoItem icon={DollarSign} label="Security Deposit" value={formatCurrency(Number(property.securityDeposit))} />
              )}
              {property.availabilityDate && (
                <InfoItem icon={Clock} label="Available From" value={formatDate(property.availabilityDate)} />
              )}
              {property.petPolicy && (
                <InfoItem icon={Tag} label="Pet Policy" value={property.petPolicy} />
              )}
            </div>
          </div>

          {/* Features Card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-[#1a2b1a] mb-4">Building Features</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <FeatureItem label="Elevator" enabled={property.elevator} />
              <FeatureItem label="Laundry" enabled={property.laundry} />
              <FeatureItem label="Parking" enabled={property.parking} />
              <div className="col-span-2 sm:col-span-3">
                {property.utilitiesIncluded.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-gray-500 mb-1.5">Utilities Included</p>
                    <div className="flex flex-wrap gap-1.5">
                      {property.utilitiesIncluded.map((u: string) => (
                        <span key={u} className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                          {u}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {property.accessibilityFeatures.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-gray-500 mb-1.5">Accessibility Features</p>
                    <div className="flex flex-wrap gap-1.5">
                      {property.accessibilityFeatures.map((f: string) => (
                        <span key={f} className="inline-flex items-center rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-medium text-purple-700">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Voucher Info */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-[#1a2b1a] mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#4caf50]" />
              Voucher Information
            </h2>
            <div className="flex items-center gap-3 mb-3">
              {property.voucherAccepted ? (
                <span className="inline-flex items-center gap-1.5 text-green-700 font-medium">
                  <CheckCircle2 className="h-5 w-5" /> Vouchers Accepted
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-gray-500">
                  <XCircle className="h-5 w-5" /> Vouchers Not Accepted
                </span>
              )}
            </div>
            {property.voucherTypesAccepted.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">Accepted Voucher Types</p>
                <div className="flex flex-wrap gap-1.5">
                  {property.voucherTypesAccepted.map((v: string) => (
                    <span key={v} className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Photo Gallery Placeholder */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-[#1a2b1a] mb-4">Photos</h2>
            {property.photos.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {property.photos.map((photo: string, i: number) => (
                  <img key={i} src={photo} alt={`Property photo ${i + 1}`} className="rounded-lg object-cover aspect-video w-full" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                    <Home className="h-8 w-8 text-gray-300" />
                  </div>
                ))}
              </div>
            )}
            <Button variant="outline" size="sm" className="mt-3 gap-2">
              <Plus className="h-4 w-4" /> Add Photos
            </Button>
          </div>

          {/* Description */}
          {property.description && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-semibold text-[#1a2b1a] mb-3">Description</h2>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{property.description}</p>
            </div>
          )}

          {/* Linked Housing Cases */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-[#1a2b1a] flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#4caf50]" />
                Linked Housing Cases
              </h2>
              <Link href={`/cases/new?propertyId=${property.id}`}>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" />
                  Create Case
                </Button>
              </Link>
            </div>
            {property.housingCases.length === 0 ? (
              <p className="text-sm text-gray-400">No cases linked to this property.</p>
            ) : (
              <div className="space-y-2">
                {property.housingCases.map((c: { id: string; caseNumber: string; status: string; tenant?: { contact?: { fullName?: string } | null } | null; assignedStaff?: { fullName?: string } | null }) => (
                  <Link
                    key={c.id}
                    href={`/cases/${c.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-colors group"
                  >
                    <div>
                      <p className="text-sm font-medium text-[#1a2b1a] group-hover:text-[#4caf50]">
                        {c.caseNumber}
                      </p>
                      <p className="text-xs text-gray-500">
                        {c.tenant?.contact?.fullName ?? "No tenant"} · {c.assignedStaff?.fullName ?? "Unassigned"}
                      </p>
                    </div>
                    <span className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
                      CASE_STATUS_COLORS[c.status] ?? "bg-gray-100 text-gray-700"
                    )}>
                      {formatCaseStatus(c.status)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Notes Timeline */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-[#1a2b1a] mb-4 flex items-center gap-2">
              <StickyNote className="h-4 w-4 text-[#4caf50]" />
              Notes
            </h2>
            {property.propertyNotes.length === 0 ? (
              <p className="text-sm text-gray-400">No notes yet.</p>
            ) : (
              <div className="space-y-4">
                {property.propertyNotes.map((note: { id: string; note: string; noteType: string; createdAt: Date; createdBy?: { fullName?: string | null } | null }) => (
                  <div key={note.id} className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-600">
                      {note.createdBy?.fullName?.charAt(0) ?? "?"}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">{note.createdBy?.fullName ?? "Unknown"}</span>
                        <span className="text-xs text-gray-400">{formatDate(note.createdAt)}</span>
                        <span className="text-xs text-gray-400 bg-gray-100 rounded px-1.5 py-0.5">{note.noteType}</span>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{note.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Landlord Card */}
          {landlord && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-semibold text-[#1a2b1a] mb-4 flex items-center gap-2">
                <User className="h-4 w-4 text-[#4caf50]" />
                Landlord
              </h2>
              <Link href={`/contacts/${landlord.contactId}`} className="group">
                <p className="font-medium text-[#1a2b1a] group-hover:text-[#4caf50] transition-colors">
                  {landlord.contact.fullName}
                </p>
              </Link>
              {landlord.companyName && (
                <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
                  <Building2 className="h-3.5 w-3.5" />
                  {landlord.companyName}
                </p>
              )}
              {landlord.contact.phone && (
                <p className="text-sm text-gray-600 flex items-center gap-1.5 mt-2">
                  <Phone className="h-3.5 w-3.5 text-gray-400" />
                  {landlord.contact.phone}
                </p>
              )}
              {landlord.contact.email && (
                <p className="text-sm text-gray-600 flex items-center gap-1.5 mt-1">
                  <Mail className="h-3.5 w-3.5 text-gray-400" />
                  {landlord.contact.email}
                </p>
              )}
              {landlord.acceptsVouchers && (
                <span className="inline-flex items-center gap-1 mt-3 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                  <CheckCircle2 className="h-3 w-3" />
                  Voucher Friendly
                </span>
              )}
            </div>
          )}

          {/* Broker Card */}
          {broker && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-semibold text-[#1a2b1a] mb-4 flex items-center gap-2">
                <User className="h-4 w-4 text-blue-500" />
                Broker
              </h2>
              <Link href={`/contacts/${broker.contactId}`} className="group">
                <p className="font-medium text-[#1a2b1a] group-hover:text-[#4caf50] transition-colors">
                  {broker.contact.fullName}
                </p>
              </Link>
              {broker.brokerageName && (
                <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
                  <Building2 className="h-3.5 w-3.5" />
                  {broker.brokerageName}
                </p>
              )}
              {broker.contact.phone && (
                <p className="text-sm text-gray-600 flex items-center gap-1.5 mt-2">
                  <Phone className="h-3.5 w-3.5 text-gray-400" />
                  {broker.contact.phone}
                </p>
              )}
              {broker.contact.email && (
                <p className="text-sm text-gray-600 flex items-center gap-1.5 mt-1">
                  <Mail className="h-3.5 w-3.5 text-gray-400" />
                  {broker.contact.email}
                </p>
              )}
            </div>
          )}

          {/* Documents */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-[#1a2b1a] flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#4caf50]" />
                Documents
              </h2>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Upload
              </Button>
            </div>
            {property.documents.length === 0 ? (
              <p className="text-sm text-gray-400">No documents uploaded.</p>
            ) : (
              <div className="space-y-2">
                {property.documents.map((doc: { id: string; fileName: string; fileUrl: string; documentType: string; uploadedAt: Date }) => (
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

          {/* Internal Notes */}
          {property.internalNotes && (
            <div className="bg-yellow-50 rounded-xl border border-yellow-100 p-5">
              <h2 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                <StickyNote className="h-4 w-4" />
                Internal Notes
              </h2>
              <p className="text-sm text-yellow-800 leading-relaxed whitespace-pre-line">{property.internalNotes}</p>
            </div>
          )}

          {/* Metadata */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-xs text-gray-400 space-y-1">
            <div className="flex justify-between">
              <span>Created</span>
              <span>{formatDate(property.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span>Last Updated</span>
              <span>{formatDate(property.updatedAt)}</span>
            </div>
            <div className="flex justify-between">
              <span>Property ID</span>
              <span className="font-mono">{property.id.slice(0, 8)}…</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-xs text-gray-400 flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {label}
      </p>
      <p className={cn("text-sm font-medium", highlight ? "text-[#4caf50] font-semibold" : "text-gray-900")}>
        {value}
      </p>
    </div>
  );
}

function FeatureItem({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium",
      enabled ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-400"
    )}>
      {enabled ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
      {label}
    </div>
  );
}
