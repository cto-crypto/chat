"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Eye,
  Edit,
  RefreshCw,
  Archive,
  Trash2,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { cn, formatRelativeDate, NYC_BOROUGHS } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Contact = {
  id: string;
  fullName: string;
  contactType: string;
  phone?: string | null;
  email?: string | null;
  borough?: string | null;
  status: string;
  organization?: string | null;
  updatedAt: string | Date;
  tenant?: { id: string } | null;
  landlord?: { id: string } | null;
  broker?: { id: string } | null;
  caseworker?: { id: string } | null;
};

interface ContactsTableProps {
  contacts: Contact[];
  total: number;
  page: number;
  pages: number;
  onPageChange: (page: number) => void;
}

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

function formatContactType(type: string) {
  const map: Record<string, string> = {
    TENANT: "Tenant",
    LANDLORD: "Landlord",
    BROKER: "Broker",
    CASEWORKER: "Caseworker",
    OTHER: "Other",
  };
  return map[type] ?? type;
}

function formatStatus(status: string) {
  const map: Record<string, string> = {
    NEW: "New",
    ACTIVE: "Active",
    INACTIVE: "Inactive",
    FOLLOW_UP_NEEDED: "Follow Up",
    ARCHIVED: "Archived",
  };
  return map[status] ?? status;
}

export function ContactsTable({
  contacts,
  total,
  page,
  pages,
  onPageChange,
}: ContactsTableProps) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const columns = useMemo<ColumnDef<Contact>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            onClick={(e) => e.stopPropagation()}
          />
        ),
        enableSorting: false,
        size: 40,
      },
      {
        accessorKey: "fullName",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-800 transition-colors"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="h-3 w-3" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="h-3 w-3" />
            ) : (
              <ArrowUpDown className="h-3 w-3 opacity-40" />
            )}
          </button>
        ),
        cell: ({ row }) => (
          <Link
            href={`/contacts/${row.original.id}`}
            className="font-medium text-[#1a2b1a] hover:text-[#4caf50] transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {row.original.fullName}
          </Link>
        ),
      },
      {
        accessorKey: "contactType",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-800 transition-colors"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Type
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="h-3 w-3" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="h-3 w-3" />
            ) : (
              <ArrowUpDown className="h-3 w-3 opacity-40" />
            )}
          </button>
        ),
        cell: ({ row }) => (
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border",
              CONTACT_TYPE_STYLES[row.original.contactType] ?? "bg-gray-100 text-gray-600"
            )}
          >
            {formatContactType(row.original.contactType)}
          </span>
        ),
      },
      {
        accessorKey: "phone",
        header: () => <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</span>,
        cell: ({ row }) => (
          <span className="text-sm text-gray-700">
            {row.original.phone ?? <span className="text-gray-300">—</span>}
          </span>
        ),
      },
      {
        accessorKey: "email",
        header: () => <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</span>,
        cell: ({ row }) =>
          row.original.email ? (
            <a
              href={`mailto:${row.original.email}`}
              className="text-sm text-blue-600 hover:underline truncate max-w-[180px] block"
              onClick={(e) => e.stopPropagation()}
            >
              {row.original.email}
            </a>
          ) : (
            <span className="text-gray-300">—</span>
          ),
      },
      {
        accessorKey: "borough",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-800 transition-colors"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Borough
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="h-3 w-3" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="h-3 w-3" />
            ) : (
              <ArrowUpDown className="h-3 w-3 opacity-40" />
            )}
          </button>
        ),
        cell: ({ row }) => (
          <span className="text-sm text-gray-700">
            {row.original.borough ?? <span className="text-gray-300">—</span>}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-800 transition-colors"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Status
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="h-3 w-3" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="h-3 w-3" />
            ) : (
              <ArrowUpDown className="h-3 w-3 opacity-40" />
            )}
          </button>
        ),
        cell: ({ row }) => (
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
              STATUS_STYLES[row.original.status] ?? "bg-gray-100 text-gray-600"
            )}
          >
            {formatStatus(row.original.status)}
          </span>
        ),
      },
      {
        accessorKey: "updatedAt",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-800 transition-colors"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Last Updated
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="h-3 w-3" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="h-3 w-3" />
            ) : (
              <ArrowUpDown className="h-3 w-3 opacity-40" />
            )}
          </button>
        ),
        cell: ({ row }) => (
          <span className="text-sm text-gray-500">
            {formatRelativeDate(row.original.updatedAt)}
          </span>
        ),
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => {
          const contact = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/contacts/${contact.id}`);
                  }}
                >
                  <Eye className="h-3.5 w-3.5 mr-2" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/contacts/${contact.id}/edit`);
                  }}
                >
                  <Edit className="h-3.5 w-3.5 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                  <RefreshCw className="h-3.5 w-3.5 mr-2" />
                  Change Status
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={(e) => e.stopPropagation()} className="text-orange-600">
                  <Archive className="h-3.5 w-3.5 mr-2" />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => e.stopPropagation()} className="text-red-600">
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
        size: 48,
        enableSorting: false,
      },
    ],
    [router]
  );

  const table = useReactTable({
    data: contacts,
    columns,
    state: { sorting, rowSelection },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: pages,
  });

  const selectedCount = Object.keys(rowSelection).length;

  const handleExport = () => {
    const selected = table
      .getSelectedRowModel()
      .rows.map((r) => r.original);
    const csv = [
      ["Name", "Type", "Phone", "Email", "Borough", "Status"].join(","),
      ...selected.map((c) =>
        [c.fullName, c.contactType, c.phone ?? "", c.email ?? "", c.borough ?? "", c.status].join(",")
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "contacts-export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3">
      {/* Bulk Actions Bar */}
      {selectedCount > 0 && (
        <div className="flex items-center gap-3 p-3 bg-[#1a2b1a]/5 border border-[#4caf50]/30 rounded-lg">
          <span className="text-sm font-medium text-[#1a2b1a]">
            {selectedCount} selected
          </span>
          <Button size="sm" variant="outline" onClick={handleExport} className="h-7">
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Export Selected
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 ml-auto text-gray-500"
            onClick={() => setRowSelection({})}
          >
            Clear
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border border-gray-100 overflow-hidden bg-white">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-gray-50/80 hover:bg-gray-50/80">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="h-10 px-3">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={cn(
                    "cursor-pointer hover:bg-[#f7f4ef]/60 transition-colors border-gray-50",
                    row.getIsSelected() && "bg-green-50/40"
                  )}
                  onClick={() => router.push(`/contacts/${row.original.id}`)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-3 py-2.5">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-gray-400">
                  No contacts found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-gray-500">
          Showing {contacts.length === 0 ? 0 : (page - 1) * 50 + 1}–
          {Math.min(page * 50, total)} of {total} contacts
        </p>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
            let pageNum: number;
            if (pages <= 7) {
              pageNum = i + 1;
            } else if (page <= 4) {
              pageNum = i + 1;
            } else if (page >= pages - 3) {
              pageNum = pages - 6 + i;
            } else {
              pageNum = page - 3 + i;
            }
            return (
              <Button
                key={pageNum}
                variant={pageNum === page ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(pageNum)}
                className={cn(
                  "h-8 w-8 p-0 text-xs",
                  pageNum === page && "bg-[#1a2b1a] hover:bg-[#2a3b2a] text-white border-[#1a2b1a]"
                )}
              >
                {pageNum}
              </Button>
            );
          })}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= pages}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
