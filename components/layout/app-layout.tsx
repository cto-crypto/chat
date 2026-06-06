"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { CommandPalette } from "./command-palette";
import { MobileNav } from "./mobile-nav";
import { usePathname } from "next/navigation";

interface AppLayoutProps {
  children: React.ReactNode;
  userEmail?: string;
  userFullName?: string;
}

function getPageTitle(pathname: string): string {
  const segment = pathname.split("/").filter(Boolean)[0] ?? "dashboard";
  const titles: Record<string, string> = {
    dashboard: "Dashboard",
    contacts: "Contacts",
    tenants: "Tenants",
    landlords: "Landlords",
    brokers: "Brokers",
    caseworkers: "Caseworkers",
    properties: "Properties",
    cases: "Housing Cases",
    tasks: "Tasks",
    documents: "Documents",
    calendar: "Calendar",
    reports: "Reports",
    imports: "Import / Export",
    integrations: "Integrations",
    automations: "Automations",
    settings: "Settings",
    admin: "Admin",
  };
  return titles[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1);
}

export function AppLayout({ children, userEmail, userFullName }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "#f7f4ef" }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <Header
          title={pageTitle}
          onMenuClick={() => setSidebarOpen(true)}
          userEmail={userEmail}
          userFullName={userFullName}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6 pb-20 lg:pb-6">{children}</div>
        </main>
      </div>

      <MobileNav onMoreClick={() => setSidebarOpen(true)} />
      <CommandPalette />
    </div>
  );
}
