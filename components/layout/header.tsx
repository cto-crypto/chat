"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils";
import {
  Bell,
  Search,
  LogOut,
  User,
  Settings,
  ChevronDown,
  Menu,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  title: string;
  onMenuClick?: () => void;
  userEmail?: string;
  userFullName?: string;
}

export function Header({
  title,
  onMenuClick,
  userEmail,
  userFullName,
}: HeaderProps) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await fetch("/api/demo-login", { method: "DELETE" });
      router.push("/login");
      router.refresh();
    } catch {
      setSigningOut(false);
    }
  }

  function handleSearchClick() {
    // Dispatch custom event to open command palette
    window.dispatchEvent(new CustomEvent("keevos:open-command-palette"));
  }

  const displayName = userFullName || userEmail?.split("@")[0] || "User";
  const initials = userFullName
    ? getInitials(userFullName)
    : (userEmail?.[0] ?? "U").toUpperCase();

  return (
    <header
      className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b bg-white px-4 lg:px-6"
      style={{ borderColor: "rgba(120,150,120,0.15)" }}
    >
      {/* Mobile menu trigger */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h1
          className="text-lg font-semibold truncate"
          style={{ color: "#1a2b1a" }}
        >
          {title}
        </h1>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Search / Command palette trigger */}
        <button
          onClick={handleSearchClick}
          className={cn(
            "hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground",
            "rounded-lg border border-border/60 bg-muted/40 hover:bg-muted transition-colors"
          )}
          aria-label="Open command palette"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Search…</span>
          <kbd className="hidden md:inline-flex items-center gap-0.5 rounded border border-border/60 bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>

        {/* Mobile search icon only */}
        <button
          onClick={handleSearchClick}
          className="sm:hidden p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </button>

        {/* Notification bell */}
        <button
          className="relative p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {/* Unread dot */}
          <span
            className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: "#4caf50" }}
          />
        </button>

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "flex items-center gap-2 rounded-lg px-2 py-1.5",
                "hover:bg-muted transition-colors focus:outline-none"
              )}
              aria-label="User menu"
            >
              {/* Avatar */}
              <div
                className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold text-white shrink-0"
                style={{ backgroundColor: "#1a2b1a" }}
              >
                {initials}
              </div>
              <span className="hidden md:block text-sm font-medium text-foreground max-w-[120px] truncate">
                {displayName}
              </span>
              <ChevronDown className="hidden md:block h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">{displayName}</span>
                {userEmail && (
                  <span className="text-xs font-normal text-muted-foreground truncate">
                    {userEmail}
                  </span>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.push("/settings/profile")}
            >
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              disabled={signingOut}
              className="text-red-600 focus:text-red-600"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {signingOut ? "Signing out…" : "Sign out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
