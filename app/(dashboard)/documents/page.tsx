import { FileText, Upload } from "lucide-react";
import { getDocuments } from "@/lib/db/queries";
import { cn, formatDate } from "@/lib/utils";
import { DocumentsPageClient } from "@/components/documents/documents-page-client";

export const metadata = { title: "Documents — KeevOS" };

const DOCUMENT_TYPES = [
  "VOUCHER",
  "ID",
  "LEASE",
  "INSPECTION",
  "APPLICATION",
  "INCOME_PROOF",
  "UTILITY_BILL",
  "OTHER",
] as const;

function formatDocType(type: string) {
  const map: Record<string, string> = {
    VOUCHER: "Voucher",
    ID: "ID",
    LEASE: "Lease",
    INSPECTION: "Inspection",
    APPLICATION: "Application",
    INCOME_PROOF: "Income Proof",
    UTILITY_BILL: "Utility Bill",
    OTHER: "Other",
  };
  return map[type] ?? type;
}

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : undefined;
  const documentType = typeof params.type === "string" ? params.type : undefined;
  const relatedEntityType = typeof params.entity === "string" ? params.entity : undefined;

  const { documents, total } = await getDocuments({
    search,
    documentType,
    relatedEntityType,
    limit: 200,
  });

  // Type breakdown for all docs (unfiltered)
  const { documents: allDocs } = await getDocuments({ limit: 1000 });
  const typeCounts = DOCUMENT_TYPES.reduce<Record<string, number>>((acc, t) => {
    acc[t] = allDocs.filter((d: { documentType: string }) => d.documentType === t).length;
    return acc;
  }, {});

  const stats = [
    { label: "Total Documents", value: allDocs.length, highlight: true },
    ...DOCUMENT_TYPES.filter((t) => typeCounts[t] > 0)
      .slice(0, 4)
      .map((t) => ({ label: formatDocType(t), value: typeCounts[t], highlight: false })),
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a2b1a]">Documents</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} documents</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-[#1a2b1a] hover:bg-[#2d4a2d] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Upload className="h-4 w-4" />
          Upload Document
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((s) => (
          <div key={s.label} className={cn(
            "rounded-xl border shadow-sm p-4",
            s.highlight ? "bg-[#1a2b1a] border-[#1a2b1a] text-white" : "bg-white border-gray-100"
          )}>
            <div className={cn("text-2xl font-bold", s.highlight ? "text-white" : "text-[#1a2b1a]")}>{s.value}</div>
            <div className={cn("text-xs mt-0.5", s.highlight ? "text-green-300" : "text-gray-500")}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Documents list */}
      <DocumentsPageClient
        documents={documents as Parameters<typeof DocumentsPageClient>[0]["documents"]}
        currentSearch={search}
        currentType={documentType}
        currentEntity={relatedEntityType}
      />
    </div>
  );
}
