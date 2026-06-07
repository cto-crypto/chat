"use client";

import { useState, useRef } from "react";
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle, X, ChevronRight } from "lucide-react";
import Papa from "papaparse";
import { cn } from "@/lib/utils";

type ImportType = "contacts" | "tenants" | "properties" | "landlords";
type ImportStep = "upload" | "preview" | "mapping" | "importing" | "done";

interface ParsedRow {
  [key: string]: string;
}

interface ImportError {
  row: number;
  field: string;
  message: string;
}

export default function ImportExportPage() {
  const [activeTab, setActiveTab] = useState<"import" | "export">("import");
  const [importType, setImportType] = useState<ImportType>("contacts");
  const [step, setStep] = useState<ImportStep>("upload");
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [errors, setErrors] = useState<ImportError[]>([]);
  const [importing, setImporting] = useState(false);
  const [importDone, setImportDone] = useState(false);
  const [importCount, setImportCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const IMPORT_TEMPLATES: Record<ImportType, string[]> = {
    contacts: ["full_name", "contact_type", "phone", "email", "address", "borough", "status", "tags", "notes"],
    tenants: ["full_name", "phone", "email", "voucher_type", "voucher_size", "max_rent", "preferred_boroughs", "urgency_level"],
    properties: ["address", "borough", "neighborhood", "bedrooms", "rent", "voucher_accepted", "status", "landlord_name"],
    landlords: ["full_name", "company_name", "phone", "email", "accepts_vouchers", "portfolio_size"],
  };

  function handleFileUpload(file: File) {
    Papa.parse<ParsedRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setParsedData(results.data);
        setHeaders(results.meta.fields || []);
        setStep("preview");
      },
      error: (error) => {
        setErrors([{ row: 0, field: "file", message: error.message }]);
      },
    });
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  }

  async function runImport() {
    setStep("importing");
    setImporting(true);
    // Simulate import - in production this calls the server action
    await new Promise((r) => setTimeout(r, 1500));
    setImportCount(parsedData.length);
    setImporting(false);
    setStep("done");
  }

  function downloadTemplate(type: ImportType) {
    const headers = IMPORT_TEMPLATES[type];
    const csv = [headers.join(","), headers.map(() => "").join(",")].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `keevos-${type}-template.csv`;
    a.click();
  }

  async function exportData(type: string, format: "csv" | "xlsx") {
    // In production, calls /api/export?type=...&format=...
    const link = document.createElement("a");
    link.href = `/api/export?type=${type}&format=${format}`;
    link.download = `keevos-${type}-export.${format}`;
    link.click();
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1a2b1a]">Import / Export Center</h1>
        <p className="text-sm text-gray-500 mt-1">Bulk import data or export records in CSV or Excel format</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {(["import", "export"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-6 py-3 text-sm font-medium border-b-2 transition-colors capitalize",
              activeTab === tab
                ? "border-[#4caf50] text-[#1a2b1a]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            {tab === "import" ? "Import Data" : "Export Data"}
          </button>
        ))}
      </div>

      {activeTab === "import" ? (
        <div className="space-y-6">
          {/* Import Type Selection */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(["contacts", "tenants", "properties", "landlords"] as ImportType[]).map((type) => (
              <button
                key={type}
                onClick={() => { setImportType(type); setStep("upload"); setParsedData([]); setErrors([]); }}
                className={cn(
                  "p-4 rounded-xl border-2 text-sm font-medium capitalize transition-all",
                  importType === type
                    ? "border-[#4caf50] bg-green-50 text-[#1a2b1a]"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                )}
              >
                <FileSpreadsheet className={cn("w-6 h-6 mx-auto mb-2", importType === type ? "text-[#4caf50]" : "text-gray-400")} />
                {type}
              </button>
            ))}
          </div>

          {/* Download Template */}
          <button
            onClick={() => downloadTemplate(importType)}
            className="flex items-center gap-2 text-sm text-[#4caf50] hover:underline"
          >
            <Download className="w-4 h-4" />
            Download {importType} CSV template
          </button>

          {/* Steps */}
          <div className="flex items-center gap-2 text-sm">
            {(["upload", "preview", "mapping", "importing", "done"] as ImportStep[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <span className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                  step === s ? "bg-[#1a2b1a] text-white" : "bg-gray-100 text-gray-400"
                )}>{i + 1}</span>
                <span className={cn("capitalize", step === s ? "text-[#1a2b1a] font-medium" : "text-gray-400")}>
                  {s === "importing" ? "Import" : s}
                </span>
                {i < 4 && <ChevronRight className="w-3 h-3 text-gray-300" />}
              </div>
            ))}
          </div>

          {/* Step: Upload */}
          {step === "upload" && (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded-xl p-12 text-center cursor-pointer hover:border-[#4caf50] transition-colors bg-white"
            >
              <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="font-medium text-gray-700">Drop your CSV or Excel file here</p>
              <p className="text-sm text-gray-400 mt-1">or click to browse</p>
              <p className="text-xs text-gray-300 mt-3">Supports .csv and .xlsx files up to 10MB</p>
              <input ref={fileInputRef} type="file" accept=".csv,.xlsx" className="hidden" onChange={handleFileChange} />
            </div>
          )}

          {/* Step: Preview */}
          {step === "preview" && parsedData.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                  <CheckCircle className="w-4 h-4" />
                  {parsedData.length} rows detected
                </div>
                <button onClick={() => setStep("upload")} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
                  <X className="w-4 h-4" /> Change file
                </button>
              </div>

              <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                <div className="overflow-x-auto max-h-64">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        {headers.map((h) => (
                          <th key={h} className="text-left px-3 py-2 text-gray-500 font-medium whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {parsedData.slice(0, 5).map((row, i) => (
                        <tr key={i} className="border-t border-gray-50">
                          {headers.map((h) => (
                            <td key={h} className="px-3 py-2 text-gray-700 whitespace-nowrap max-w-32 truncate">{row[h]}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {parsedData.length > 5 && (
                  <p className="text-xs text-gray-400 px-3 py-2 border-t">...and {parsedData.length - 5} more rows</p>
                )}
              </div>

              <div className="flex gap-3">
                <button onClick={runImport} className="bg-[#1a2b1a] text-white px-6 py-2 rounded-lg text-sm hover:bg-[#2d4a2d]">
                  Import {parsedData.length} records
                </button>
                <button onClick={() => setStep("upload")} className="border border-gray-200 px-6 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Step: Importing */}
          {step === "importing" && (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
              <div className="w-12 h-12 border-4 border-[#4caf50] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="font-medium text-[#1a2b1a]">Importing records...</p>
              <p className="text-sm text-gray-500 mt-1">Processing {parsedData.length} rows</p>
            </div>
          )}

          {/* Step: Done */}
          {step === "done" && (
            <div className="bg-green-50 rounded-xl border border-green-100 p-8 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p className="font-bold text-[#1a2b1a] text-lg">Import Complete!</p>
              <p className="text-sm text-gray-600 mt-1">{importCount} records imported successfully</p>
              <button
                onClick={() => { setStep("upload"); setParsedData([]); setHeaders([]); }}
                className="mt-4 bg-[#1a2b1a] text-white px-6 py-2 rounded-lg text-sm hover:bg-[#2d4a2d]"
              >
                Import More Data
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Export Tab */
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Export your data as CSV or Excel files</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "All Contacts", type: "contacts", description: "Export full contacts database" },
              { label: "Tenants", type: "tenants", description: "Tenant profiles with voucher details" },
              { label: "Properties", type: "properties", description: "All property listings" },
              { label: "Housing Cases", type: "cases", description: "Case records with status history" },
              { label: "Landlords", type: "landlords", description: "Landlord profiles" },
              { label: "Activity Log", type: "activity", description: "Full audit trail" },
            ].map((item) => (
              <div key={item.type} className="bg-white rounded-xl border border-gray-100 p-5 flex items-center justify-between">
                <div>
                  <p className="font-medium text-[#1a2b1a]">{item.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => exportData(item.type, "csv")}
                    className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 text-gray-600"
                  >
                    CSV
                  </button>
                  <button
                    onClick={() => exportData(item.type, "xlsx")}
                    className="text-xs bg-[#1a2b1a] text-white px-3 py-1.5 rounded-lg hover:bg-[#2d4a2d]"
                  >
                    Excel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
