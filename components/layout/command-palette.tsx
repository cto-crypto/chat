"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "cmdk";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  MapPin,
  Plus,
  FileText,
  BarChart3,
  Settings,
  Search,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ElementType;
  action: () => void;
  keywords?: string[];
}

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const navigate = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router]
  );

  const items: CommandItem[] = [
    {
      id: "dashboard",
      label: "Go to Dashboard",
      description: "Overview & key metrics",
      icon: LayoutDashboard,
      action: () => navigate("/dashboard"),
      keywords: ["home", "overview", "main"],
    },
    {
      id: "search-contacts",
      label: "Search Contacts",
      description: "Find tenants, landlords, brokers",
      icon: Search,
      action: () => navigate("/contacts"),
      keywords: ["contacts", "find", "people"],
    },
    {
      id: "add-contact",
      label: "Add Contact",
      description: "Create a new contact record",
      icon: UserPlus,
      action: () => navigate("/contacts/new"),
      keywords: ["new contact", "create contact", "add person"],
    },
    {
      id: "add-property",
      label: "Add Property",
      description: "List a new property",
      icon: Plus,
      action: () => navigate("/properties/new"),
      keywords: ["new property", "list property", "add unit"],
    },
    {
      id: "create-case",
      label: "Create Housing Case",
      description: "Open a new housing case",
      icon: FileText,
      action: () => navigate("/cases/new"),
      keywords: ["new case", "open case", "housing case"],
    },
    {
      id: "contacts",
      label: "View Contacts",
      description: "Browse all contacts",
      icon: Users,
      action: () => navigate("/contacts"),
      keywords: ["contacts", "people", "directory"],
    },
    {
      id: "properties",
      label: "View Properties",
      description: "Browse all properties",
      icon: MapPin,
      action: () => navigate("/properties"),
      keywords: ["properties", "units", "listings"],
    },
    {
      id: "reports",
      label: "View Reports",
      description: "Analytics & reporting",
      icon: BarChart3,
      action: () => navigate("/reports"),
      keywords: ["reports", "analytics", "metrics", "stats"],
    },
    {
      id: "settings",
      label: "Open Settings",
      description: "Configure KeevOS",
      icon: Settings,
      action: () => navigate("/settings"),
      keywords: ["settings", "preferences", "config"],
    },
  ];

  // Toggle on Cmd/Ctrl+K
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Listen for custom event from header search button
  useEffect(() => {
    function onOpen() {
      setOpen(true);
    }
    window.addEventListener("keevos:open-command-palette", onOpen);
    return () =>
      window.removeEventListener("keevos:open-command-palette", onOpen);
  }, []);

  // Reset search when closed
  useEffect(() => {
    if (!open) {
      setTimeout(() => setSearch(""), 200);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="overflow-hidden p-0 shadow-2xl max-w-lg"
        style={{ borderRadius: "14px" }}
      >
        <Command
          className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground"
          shouldFilter={true}
        >
          {/* Search input */}
          <div className="flex items-center border-b px-3" style={{ borderColor: "rgba(120,150,120,0.2)" }}>
            <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <CommandInput
              value={search}
              onValueChange={setSearch}
              placeholder="Search or jump to…"
              className="flex h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
            <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
              ESC
            </kbd>
          </div>

          <CommandList className="max-h-[380px] overflow-y-auto overflow-x-hidden p-2">
            <CommandEmpty className="py-10 text-center text-sm text-muted-foreground">
              No results found.
            </CommandEmpty>

            <CommandGroup heading="Navigation">
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <CommandItem
                    key={item.id}
                    value={[item.label, ...(item.keywords ?? [])].join(" ")}
                    onSelect={item.action}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm cursor-pointer",
                      "aria-selected:bg-muted transition-colors"
                    )}
                  >
                    <div
                      className="flex items-center justify-center w-7 h-7 rounded-md shrink-0"
                      style={{ backgroundColor: "rgba(26,43,26,0.07)" }}
                    >
                      <Icon className="h-3.5 w-3.5" style={{ color: "#1a2b1a" }} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium text-foreground">
                        {item.label}
                      </span>
                      {item.description && (
                        <span className="text-xs text-muted-foreground truncate">
                          {item.description}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>

          {/* Footer hint */}
          <div
            className="flex items-center justify-between border-t px-3 py-2"
            style={{ borderColor: "rgba(120,150,120,0.2)" }}
          >
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-border bg-muted px-1 py-0.5 text-[10px]">↑</kbd>
                <kbd className="rounded border border-border bg-muted px-1 py-0.5 text-[10px]">↓</kbd>
                navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-border bg-muted px-1 py-0.5 text-[10px]">↵</kbd>
                select
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: "#4caf50" }}
              />
              <span className="text-xs text-muted-foreground">KeevOS</span>
            </div>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
