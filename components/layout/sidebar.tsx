"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Home,
  Building2,
  Briefcase,
  UserCheck,
  MapPin,
  FileText,
  CheckSquare,
  FolderOpen,
  Calendar,
  BarChart3,
  ArrowUpDown,
  Plug,
  Zap,
  Settings,
  ClipboardList,
  Database,
  X,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const primaryNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Contacts", href: "/contacts", icon: Users },
  { label: "Tenants", href: "/tenants", icon: Home },
  { label: "Landlords", href: "/landlords", icon: Building2 },
  { label: "Brokers", href: "/brokers", icon: Briefcase },
  { label: "Caseworkers", href: "/caseworkers", icon: UserCheck },
  { label: "Properties", href: "/properties", icon: MapPin },
  { label: "Housing Cases", href: "/cases", icon: FileText },
  { label: "Tasks", href: "/tasks", icon: CheckSquare },
  { label: "Documents", href: "/documents", icon: FolderOpen },
  { label: "Calendar", href: "/calendar", icon: Calendar },
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "Import/Export", href: "/imports", icon: ArrowUpDown },
  { label: "Integrations", href: "/integrations", icon: Plug },
  { label: "Automations", href: "/automations", icon: Zap },
  { label: "Settings", href: "/settings", icon: Settings },
];

const adminNav: NavItem[] = [
  { label: "Audit Logs", href: "/admin/audit", icon: ClipboardList },
  { label: "Backups", href: "/admin/backups", icon: Database },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col w-64 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 lg:z-auto",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ backgroundColor: "#1a2b1a" }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 h-16 shrink-0 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div
              className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
              style={{ backgroundColor: "#4caf50" }}
            >
              <span className="text-xs font-bold text-white">KOS</span>
            </div>
            <span className="text-white font-semibold text-base tracking-tight">
              KeevOS
            </span>
          </div>
          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="lg:hidden text-white/60 hover:text-white transition-colors p-1 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {primaryNav.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                  active
                    ? "text-white"
                    : "text-white/60 hover:text-white hover:bg-white/8"
                )}
                style={
                  active
                    ? { backgroundColor: "rgba(76,175,80,0.18)", color: "#fff" }
                    : undefined
                }
              >
                <Icon
                  className={cn("h-4 w-4 shrink-0", active && "text-[#4caf50]")}
                />
                {item.label}
                {active && (
                  <div
                    className="ml-auto w-1 h-1 rounded-full"
                    style={{ backgroundColor: "#4caf50" }}
                  />
                )}
              </Link>
            );
          })}

          {/* Admin section */}
          <div className="pt-4 mt-2 border-t border-white/10">
            <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-white/30">
              Admin
            </p>
            {adminNav.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                    active
                      ? "text-white"
                      : "text-white/60 hover:text-white hover:bg-white/8"
                  )}
                  style={
                    active
                      ? {
                          backgroundColor: "rgba(76,175,80,0.18)",
                          color: "#fff",
                        }
                      : undefined
                  }
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      active && "text-[#4caf50]"
                    )}
                  />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom brand */}
        <div className="shrink-0 px-4 py-3 border-t border-white/10">
          <p className="text-xs text-white/25 text-center">
            KeevOS v1.0 · Housing Ops
          </p>
        </div>
      </aside>
    </>
  );
}
