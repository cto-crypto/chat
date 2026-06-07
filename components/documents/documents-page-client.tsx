"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Search, Download, Trash2, FileText, FileImage, File,
  SlidersHorizontal, ExternalLink
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, formatDate } from "@/lib/utils";

const DOCUMENT_TYPES = [
  { value: "VOUCHER", label: "Voucher" },
  { value: "ID", label: "ID" },
  { value: "LEASE", label: "Lease" },
  { value: "INSPECTION", label: "Inspection" },
  { value: "APPLICATION", label: "Application" },
  { value: "INCOME_PROOF", label: "Income Proof" },
  { value: "UTILITY_BILL", label: "Utility Bill" },
  { value: "OTHER", label: "Other" },
];

const DOC_TYPE_COLORS: Record<string, string> = {
  VOUCHER: "bg-green-50 text-green-700",
  ID: "bg-blue-50 text-blue-700",
  LEASE: "bg-purple-50 text-purple-700",
  INSPECTION: "bg-yellow-50 text-yellow-700",
  APPLICATION: "bg-cyan-50 text-cyan-700",
  INCOME_PROOF: "bg-orange-50 text-orange-700",
  UTILITY_BILL: "bg-gray-50 text-gray-700",
  OTHER: "bg-gray-50 text-gray-500",
};

function getFileIcon(fileType: string) {
  if (fileType?.includes("image")) return FileImage;
  if (fileType?.includes("pdf")) return FileText;
  return File;
}

function formatFileSize(bytes?: number | null) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDocType(type: string) {
  const map: Record<string, string> = {
    VOUCHER: "Voucher", ID: "ID", LEASE: "Lease", INSPECTION: "Inspection",
    APPLICATION: "Application", INCOME_PROOF: "Income Proof", UTILITY_BILL: "Utility Bill", OTHER: "Other",
  };
  return map[type] ?? type;
}

type Document = {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize?: number | null;
  documentType: string;
  uploadedAt: Date;
  relatedCase?: { caseNumber: string } | null;
  relatedProperty?: { address: string; borough: string } | null;
  relatedContact?: { fullName: string } | null;
  relatedTenant?: { contact: { fullName: string } } | null;
};

interface DocumentsPageClientProps {
  documents: Document[];
  currentSearch?: string;
  currentType?: string;
  currentEntity?: string;
}

export function DocumentsPageClient({
  documents,
  currentSearch,
  currentType,
  currentEntity,
}: DocumentsPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(currentSearch ?? "");
  const [docType, setDocType] = useState(currentType ?? "");
  const [entityType, setEntityType] = useState(currentEntity ?? "");

  function applyFilters(overrides: Record<string, string | undefined> = {}) {
    const p = new URLSearchParams();
    const s = overrides.search ?? search;
    const t = overrides.type ?? docType;
    const e = overrides.entity ?? entityType;
    if (s) p.set("search", s);
    if (t && t !== "all") p.set("type", t);
    if (e && e !== "all") p.set("entity", e);
    startTransition(() => {
      router.push(`${pathname}?${p.toString()}`);
    });
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    applyFilters();
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search file name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={docType || "all"} onValueChange={(v) => { setDocType(v === "all" ? "" : v); applyFilters({ type: v === "all" ? "" : v }); }}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Document Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {DOCUMENT_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={entityType || "all"} onValueChange={(v) => { setEntityType(v === "all" ? "" : v); applyFilters({ entity: v === "all" ? "" : v }); }}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Related To" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Entities</SelectItem>
              <SelectItem value="case">Cases</SelectItem>
              <SelectItem value="property">Properties</SelectItem>
              <SelectItem value="tenant">Tenants</SelectItem>
              <SelectItem value="contact">Contacts</SelectItem>
            </SelectContent>
          </Select>

          <Button type="submit" variant="outline" className="gap-2" disabled={isPending}>
            <SlidersHorizontal className="h-4 w-4" />
            Filter
          </Button>
        </form>
      </div>

      {/* Table */}
      {documents.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <FileText className="h-12 w-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500">No documents found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">File Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Related To</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Size</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {documents.map((doc) => {
                  const FileIcon = getFileIcon(doc.fileType);
                  const relatedName = doc.relatedCase?.caseNumber
                    ?? doc.relatedTenant?.contact.fullName
                    ?? doc.relatedProperty?.address
                    ?? doc.relatedContact?.fullName;
                  const relatedHref = doc.relatedCase
                    ? `/cases/${doc.relatedCase.caseNumber}`
                    : undefined;

                  return (
                    <tr key={doc.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <FileIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                          <span className="font-medium text-gray-900 truncate max-w-[200px]">{doc.fileName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          DOC_TYPE_COLORS[doc.documentType] ?? "bg-gray-50 text-gray-500"
                        )}>
                          {formatDocType(doc.documentType)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {relatedName ? (
                          relatedHref ? (
                            <a href={relatedHref} className="inline-flex items-center gap-1 text-[#4caf50] hover:text-[#43a047] font-medium">
                              {relatedName}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <span>{relatedName}</span>
                          )
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {formatDate(doc.uploadedAt)}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {formatFileSize(doc.fileSize)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center h-7 w-7 rounded-lg text-gray-400 hover:text-[#4caf50] hover:bg-green-50 transition-colors"
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                          <button
                            className="inline-flex items-center justify-center h-7 w-7 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-500">
            Showing {documents.length} document{documents.length !== 1 ? "s" : ""}
          </div>
        </div>
      )}
    </div>
  );
}
