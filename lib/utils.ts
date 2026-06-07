import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isValid, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | null | undefined, fmt = "MMM d, yyyy") {
  if (!date) return "—";
  const d = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(d)) return "—";
  return format(d, fmt);
}

export function formatRelativeDate(date: string | Date | null | undefined) {
  if (!date) return "—";
  const d = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(d)) return "—";
  return formatDistanceToNow(d, { addSuffix: true });
}

export function formatCurrency(amount: number | string | null | undefined) {
  if (amount === null || amount === undefined) return "—";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(num);
}

export function generateCaseNumber() {
  const prefix = "KOS";
  const year = new Date().getFullYear().toString().slice(-2);
  const rand = Math.floor(Math.random() * 100000).toString().padStart(5, "0");
  return `${prefix}-${year}-${rand}`;
}

export function truncate(str: string, length = 100) {
  if (str.length <= length) return str;
  return str.slice(0, length) + "…";
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .trim();
}

export const NYC_BOROUGHS = [
  "Bronx",
  "Brooklyn",
  "Manhattan",
  "Queens",
  "Staten Island",
];

export const VOUCHER_TYPES = [
  "Section 8",
  "HCV",
  "HASA",
  "CityFHEPS",
  "FHEPS",
  "LINC",
  "SEPS",
  "SOTA",
  "Other",
];

export const URGENCY_COLORS = {
  LOW: "bg-gray-100 text-gray-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  HIGH: "bg-orange-100 text-orange-700",
  CRITICAL: "bg-red-100 text-red-700",
};

export const CASE_STATUS_COLORS: Record<string, string> = {
  NEW: "bg-gray-100 text-gray-700",
  SEARCHING: "bg-blue-100 text-blue-700",
  VIEWING_SCHEDULED: "bg-cyan-100 text-cyan-700",
  APPLICATION_STARTED: "bg-purple-100 text-purple-700",
  DOCUMENTS_NEEDED: "bg-yellow-100 text-yellow-700",
  INSPECTION_PENDING: "bg-orange-100 text-orange-700",
  APPROVED: "bg-green-100 text-green-700",
  LEASE_SIGNING: "bg-teal-100 text-teal-700",
  HOUSED: "bg-emerald-100 text-emerald-700",
  CLOSED: "bg-slate-100 text-slate-700",
  LOST: "bg-red-100 text-red-700",
};

export const PROPERTY_STATUS_COLORS: Record<string, string> = {
  AVAILABLE: "bg-green-100 text-green-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  INSPECTION_SCHEDULED: "bg-blue-100 text-blue-700",
  APPROVED: "bg-teal-100 text-teal-700",
  OCCUPIED: "bg-slate-100 text-slate-700",
  UNAVAILABLE: "bg-red-100 text-red-700",
};

export const TASK_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
  OVERDUE: "bg-red-100 text-red-700",
  CANCELLED: "bg-slate-100 text-slate-700",
};

export function formatCaseStatus(status: string) {
  const map: Record<string, string> = {
    NEW: "New",
    SEARCHING: "Searching",
    VIEWING_SCHEDULED: "Viewing Scheduled",
    APPLICATION_STARTED: "Application Started",
    DOCUMENTS_NEEDED: "Documents Needed",
    INSPECTION_PENDING: "Inspection Pending",
    APPROVED: "Approved",
    LEASE_SIGNING: "Lease Signing",
    HOUSED: "Housed",
    CLOSED: "Closed",
    LOST: "Lost",
  };
  return map[status] ?? status;
}

export function formatTenantStatus(status: string) {
  const map: Record<string, string> = {
    NEW: "New",
    SEARCHING: "Searching",
    VIEWING: "Viewing",
    APPLICATION_SUBMITTED: "Application Submitted",
    INSPECTION_PENDING: "Inspection Pending",
    APPROVED: "Approved",
    HOUSED: "Housed",
    INACTIVE: "Inactive",
  };
  return map[status] ?? status;
}

export function formatPropertyStatus(status: string) {
  const map: Record<string, string> = {
    AVAILABLE: "Available",
    PENDING: "Pending",
    INSPECTION_SCHEDULED: "Inspection Scheduled",
    APPROVED: "Approved",
    OCCUPIED: "Occupied",
    UNAVAILABLE: "Unavailable",
  };
  return map[status] ?? status;
}
