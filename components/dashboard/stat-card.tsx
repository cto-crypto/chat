"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color: "blue" | "green" | "emerald" | "orange" | "red" | "yellow" | "purple" | "slate";
  trend?: "up" | "down" | "neutral";
  change?: string;
  pulse?: boolean;
  description?: string;
}

const colorMap = {
  blue: {
    bg: "bg-blue-50",
    icon: "bg-blue-100 text-blue-600",
    text: "text-blue-600",
  },
  green: {
    bg: "bg-green-50",
    icon: "bg-green-100 text-green-600",
    text: "text-green-600",
  },
  emerald: {
    bg: "bg-emerald-50",
    icon: "bg-emerald-100 text-emerald-600",
    text: "text-emerald-600",
  },
  orange: {
    bg: "bg-orange-50",
    icon: "bg-orange-100 text-orange-600",
    text: "text-orange-600",
  },
  red: {
    bg: "bg-red-50",
    icon: "bg-red-100 text-red-600",
    text: "text-red-600",
  },
  yellow: {
    bg: "bg-yellow-50",
    icon: "bg-yellow-100 text-yellow-600",
    text: "text-yellow-600",
  },
  purple: {
    bg: "bg-purple-50",
    icon: "bg-purple-100 text-purple-600",
    text: "text-purple-600",
  },
  slate: {
    bg: "bg-slate-50",
    icon: "bg-slate-100 text-slate-600",
    text: "text-slate-600",
  },
};

export function StatCard({
  title,
  value,
  icon: Icon,
  color,
  trend,
  change,
  pulse = false,
  description,
}: StatCardProps) {
  const colors = colorMap[color];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className={cn("rounded-lg p-2.5", colors.icon)}>
          <Icon className="h-5 w-5" />
        </div>
        {pulse && (
          <span className="flex h-3 w-3 mt-1">
            <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
          </span>
        )}
      </div>
      <div>
        <div className="text-3xl font-bold text-gray-900 tabular-nums">
          {value}
        </div>
        <div className="text-sm font-medium text-gray-500 mt-0.5">{title}</div>
        {description && (
          <div className="text-xs text-gray-400 mt-0.5">{description}</div>
        )}
      </div>
      {(trend || change) && (
        <div className="flex items-center gap-1 text-xs">
          {trend === "up" && <TrendingUp className="h-3.5 w-3.5 text-green-500" />}
          {trend === "down" && <TrendingDown className="h-3.5 w-3.5 text-red-500" />}
          {change && (
            <span
              className={cn(
                "font-medium",
                trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-gray-500"
              )}
            >
              {change}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
