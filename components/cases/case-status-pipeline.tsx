"use client";

import { Check } from "lucide-react";
import { cn, formatCaseStatus } from "@/lib/utils";

const PIPELINE_STAGES = [
  "NEW",
  "SEARCHING",
  "VIEWING_SCHEDULED",
  "APPLICATION_STARTED",
  "DOCUMENTS_NEEDED",
  "INSPECTION_PENDING",
  "APPROVED",
  "LEASE_SIGNING",
  "HOUSED",
] as const;

const TERMINAL_STAGES = ["CLOSED", "LOST"];

interface CaseStatusPipelineProps {
  currentStatus: string;
}

export function CaseStatusPipeline({ currentStatus }: CaseStatusPipelineProps) {
  const isTerminal = TERMINAL_STAGES.includes(currentStatus);
  const currentIndex = PIPELINE_STAGES.indexOf(currentStatus as (typeof PIPELINE_STAGES)[number]);

  if (isTerminal) {
    return (
      <div className="flex items-center gap-2 p-4 rounded-xl border bg-slate-50">
        <div className={cn(
          "inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold",
          currentStatus === "CLOSED" ? "bg-slate-200 text-slate-700" : "bg-red-100 text-red-700"
        )}>
          {formatCaseStatus(currentStatus)}
        </div>
        <span className="text-sm text-gray-500">This case is {currentStatus.toLowerCase()}.</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 overflow-x-auto">
      <div className="flex items-center min-w-max">
        {PIPELINE_STAGES.map((stage, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isFuture = idx > currentIndex;

          return (
            <div key={stage} className="flex items-center">
              {/* Step circle */}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all",
                    isDone && "bg-[#4caf50] text-white",
                    isCurrent && "bg-[#1a2b1a] text-white ring-4 ring-[#4caf50]/20",
                    isFuture && "bg-gray-100 text-gray-400"
                  )}
                >
                  {isDone ? <Check className="h-4 w-4" /> : idx + 1}
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium text-center max-w-[70px] leading-tight",
                    isCurrent && "text-[#1a2b1a] font-semibold",
                    isDone && "text-[#4caf50]",
                    isFuture && "text-gray-400"
                  )}
                >
                  {formatCaseStatus(stage)}
                </span>
              </div>

              {/* Connector line */}
              {idx < PIPELINE_STAGES.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 w-8 mx-1 mb-5 transition-colors",
                    idx < currentIndex ? "bg-[#4caf50]" : "bg-gray-200"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
