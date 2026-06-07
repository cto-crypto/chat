"use client";

import { useState, useCallback, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search, UserPlus, SlidersHorizontal, Users } from "lucide-react";
import { NYC_BOROUGHS } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ContactsTable } from "@/components/contacts/contacts-table";
import { AddContactDialog } from "@/components/contacts/add-contact-dialog";

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

interface ContactsPageClientProps {
  contacts: Contact[];
  total: number;
  page: number;
  pages: number;
  initialSearch: string;
  initialType: string;
  initialStatus: string;
  initialBorough: string;
  openAddDialog: boolean;
}

export function ContactsPageClient({
  contacts,
  total,
  page,
  pages,
  initialSearch,
  initialType,
  initialStatus,
  initialBorough,
  openAddDialog,
}: ContactsPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  const [search, setSearch] = useState(initialSearch);
  const [contactType, setContactType] = useState(initialType || "all");
  const [status, setStatus] = useState(initialStatus || "all");
  const [borough, setBorough] = useState(initialBorough || "all");
  const [addDialogOpen, setAddDialogOpen] = useState(openAddDialog);

  const pushFilters = useCallback(
    (overrides: Record<string, string>) => {
      const params = new URLSearchParams();
      const s = overrides.search ?? search;
      const t = overrides.contactType ?? contactType;
      const st = overrides.status ?? status;
      const b = overrides.borough ?? borough;
      const p = overrides.page ?? "1";

      if (s) params.set("search", s);
      if (t && t !== "all") params.set("contactType", t);
      if (st && st !== "all") params.set("status", st);
      if (b && b !== "all") params.set("borough", b);
      if (p !== "1") params.set("page", p);

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [router, pathname, search, contactType, status, borough]
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    pushFilters({ search });
  };

  return (
    <div className="min-h-screen bg-[#f7f4ef]">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#1a2b1a] flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#1a2b1a]">Contacts</h1>
              <p className="text-sm text-gray-500">{total.toLocaleString()} total contacts</p>
            </div>
          </div>
          <Button
            onClick={() => setAddDialogOpen(true)}
            className="bg-[#1a2b1a] hover:bg-[#2a3b2a] text-white"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3">
            <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search name, email, phone, organization..."
                  className="pl-9 bg-gray-50 border-gray-200"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button type="submit" variant="outline" size="sm" className="h-10">
                Search
              </Button>
            </form>

            <div className="flex gap-2 flex-wrap sm:flex-nowrap">
              <Select
                value={contactType}
                onValueChange={(v) => {
                  setContactType(v);
                  pushFilters({ contactType: v });
                }}
              >
                <SelectTrigger className="w-36 bg-gray-50 border-gray-200">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="TENANT">Tenant</SelectItem>
                  <SelectItem value="LANDLORD">Landlord</SelectItem>
                  <SelectItem value="BROKER">Broker</SelectItem>
                  <SelectItem value="CASEWORKER">Caseworker</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={status}
                onValueChange={(v) => {
                  setStatus(v);
                  pushFilters({ status: v });
                }}
              >
                <SelectTrigger className="w-36 bg-gray-50 border-gray-200">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="NEW">New</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="FOLLOW_UP_NEEDED">Follow Up</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={borough}
                onValueChange={(v) => {
                  setBorough(v);
                  pushFilters({ borough: v });
                }}
              >
                <SelectTrigger className="w-36 bg-gray-50 border-gray-200">
                  <SelectValue placeholder="Borough" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Boroughs</SelectItem>
                  {NYC_BOROUGHS.map((b) => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Table */}
        <ContactsTable
          contacts={contacts}
          total={total}
          page={page}
          pages={pages}
          onPageChange={(p) => pushFilters({ page: String(p) })}
        />
      </div>

      <AddContactDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
      />
    </div>
  );
}
