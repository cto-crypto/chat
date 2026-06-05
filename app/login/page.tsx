"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Shield, Eye, Users, BarChart3, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Suspense } from "react";

const DEMO_ROLES = [
  {
    role: "OWNER",
    label: "Owner",
    name: "Keev Owner",
    email: "owner@keevhousing.com",
    description: "Full system access — manage users, settings, backups",
    icon: Shield,
    color: "bg-purple-100 text-purple-700 border-purple-200",
    dot: "bg-purple-500",
  },
  {
    role: "ADMIN",
    label: "Administrator",
    name: "Keev Admin",
    email: "admin@keevhousing.com",
    description: "Full operational access — manage all records",
    icon: Shield,
    color: "bg-red-100 text-red-700 border-red-200",
    dot: "bg-red-500",
  },
  {
    role: "MANAGER",
    label: "Manager",
    name: "Sarah Johnson",
    email: "manager@keevhousing.com",
    description: "Manage contacts, cases, properties, tasks, documents",
    icon: Users,
    color: "bg-blue-100 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
  },
  {
    role: "STAFF",
    label: "Staff",
    name: "Mike Torres",
    email: "staff@keevhousing.com",
    description: "Add and update contacts, cases, notes, and tasks",
    icon: Users,
    color: "bg-green-100 text-green-700 border-green-200",
    dot: "bg-green-500",
  },
  {
    role: "VIEWER",
    label: "Viewer",
    name: "View Only",
    email: "viewer@keevhousing.com",
    description: "Read-only access to all records",
    icon: BarChart3,
    color: "bg-gray-100 text-gray-600 border-gray-200",
    dot: "bg-gray-400",
  },
];

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";
  const [selectedRole, setSelectedRole] = useState("ADMIN");
  const [loading, setLoading] = useState(false);

  async function handleDemoLogin(role: string) {
    setLoading(true);
    setSelectedRole(role);
    try {
      const res = await fetch("/api/demo-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        router.push(redirectTo);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{ backgroundColor: "#f7f4ef" }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(76,175,80,0.10) 0%, transparent 70%)",
        }}
      />

      <div className="relative w-full max-w-lg">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="flex items-center justify-center w-14 h-14 rounded-2xl mb-4 shadow-lg"
            style={{ backgroundColor: "#1a2b1a" }}
          >
            <span className="text-xl font-bold tracking-tight" style={{ color: "#4caf50" }}>
              KOS
            </span>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "#1a2b1a" }}>KeevOS</h1>
          <p className="text-sm text-gray-500 mt-1">Housing Operations Platform</p>
        </div>

        {/* Demo Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-8 pb-5 border-b border-gray-100">
            <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Live Demo — Real Data
            </div>
            <h2 className="text-xl font-bold" style={{ color: "#1a2b1a" }}>
              Choose your demo role
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Select a role to explore KeevOS with a fully seeded NYC housing dataset.
            </p>
          </div>

          {/* Role Cards */}
          <div className="p-5 space-y-2.5">
            {DEMO_ROLES.map((r) => (
              <button
                key={r.role}
                onClick={() => handleDemoLogin(r.role)}
                disabled={loading}
                className={cn(
                  "w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all flex items-center gap-4 group",
                  selectedRole === r.role && loading
                    ? "border-[#4caf50] bg-green-50"
                    : "border-gray-100 hover:border-[#4caf50] hover:bg-green-50/50 bg-white"
                )}
              >
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", r.color.split(" ").slice(0,1).join(""))}>
                  <span className={cn("w-2.5 h-2.5 rounded-full", r.dot)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm" style={{ color: "#1a2b1a" }}>
                      {r.label}
                    </span>
                    <span className="text-xs text-gray-400">{r.name}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{r.description}</p>
                </div>
                {selectedRole === r.role && loading ? (
                  <Loader2 className="w-4 h-4 text-[#4caf50] animate-spin flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#4caf50] transition-colors flex-shrink-0" />
                )}
              </button>
            ))}
          </div>

          {/* Footer note */}
          <div className="px-8 pb-6">
            <p className="text-xs text-center text-gray-400">
              Demo includes 15 tenants · 12 properties · 10 cases · NYC boroughs
            </p>
          </div>
        </div>

        <p className="mt-5 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} KeevOS · Keev Housing Group · Internal Platform
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f7f4ef" }}><div className="w-8 h-8 border-4 border-[#4caf50] border-t-transparent rounded-full animate-spin" /></div>}>
      <LoginContent />
    </Suspense>
  );
}
