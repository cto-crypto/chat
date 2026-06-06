"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Users,
  CheckSquare,
  MoreHorizontal,
  MapPin,
  Home,
} from "lucide-react";

const BOTTOM_NAV = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Cases", href: "/cases", icon: FileText },
  { label: "Contacts", href: "/contacts", icon: Users },
  { label: "Tasks", href: "/tasks", icon: CheckSquare },
  { label: "Properties", href: "/properties", icon: MapPin },
];

export function MobileNav({ onMoreClick }: { onMoreClick?: () => void }) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-50 border-t bg-white"
      style={{
        borderColor: "rgba(120,150,120,0.15)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="flex items-stretch h-16">
        {BOTTOM_NAV.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center flex-1 gap-1 relative transition-colors"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              {active && (
                <span
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                  style={{ backgroundColor: "#4caf50" }}
                />
              )}
              <Icon
                className="h-5 w-5 transition-colors"
                style={{ color: active ? "#4caf50" : "#94a3b8" }}
              />
              <span
                className="text-[10px] font-medium leading-none transition-colors"
                style={{ color: active ? "#1a2b1a" : "#94a3b8" }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
        {/* More button triggers sidebar */}
        <button
          onClick={onMoreClick}
          className="flex flex-col items-center justify-center flex-1 gap-1"
          style={{ WebkitTapHighlightColor: "transparent" }}
        >
          <MoreHorizontal className="h-5 w-5" style={{ color: "#94a3b8" }} />
          <span className="text-[10px] font-medium leading-none" style={{ color: "#94a3b8" }}>
            More
          </span>
        </button>
      </div>
    </nav>
  );
}
