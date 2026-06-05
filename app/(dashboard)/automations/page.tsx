"use client";

import { useState } from "react";
import { Zap, Plus, Play, Pause, Trash2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  is_active: boolean;
  runs: number;
  last_run: string | null;
}

const DEFAULT_RULES: AutomationRule[] = [
  {
    id: "1",
    name: "Documents Needed → Create Follow-up Task",
    trigger: "Case status changes to DOCUMENTS_NEEDED",
    action: "Create a follow-up task for assigned staff: 'Collect missing documents'",
    is_active: true,
    runs: 12,
    last_run: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    name: "Tenant Housed → Close Tasks",
    trigger: "Tenant status changes to HOUSED",
    action: "Close all open tasks for the related case and mark case as HOUSED",
    is_active: true,
    runs: 8,
    last_run: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    name: "Property Occupied → Remove from Matches",
    trigger: "Property status changes to OCCUPIED",
    action: "Remove property from all active tenant matching suggestions",
    is_active: true,
    runs: 5,
    last_run: null,
  },
  {
    id: "4",
    name: "Follow-up Date → Today Alert",
    trigger: "Case next_follow_up_date equals today",
    action: "Show case in Today's Follow-ups dashboard widget and send notification",
    is_active: false,
    runs: 0,
    last_run: null,
  },
  {
    id: "5",
    name: "Overdue Task → OVERDUE Status",
    trigger: "Task due_date passes without completion",
    action: "Automatically update task status to OVERDUE",
    is_active: true,
    runs: 34,
    last_run: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
];

export default function AutomationsPage() {
  const [rules, setRules] = useState<AutomationRule[]>(DEFAULT_RULES);
  const [showAdd, setShowAdd] = useState(false);
  const [newRule, setNewRule] = useState({ name: "", trigger: "", action: "" });

  function toggleRule(id: string) {
    setRules(prev => prev.map(r => r.id === id ? { ...r, is_active: !r.is_active } : r));
  }

  function deleteRule(id: string) {
    setRules(prev => prev.filter(r => r.id !== id));
  }

  function addRule() {
    if (!newRule.name || !newRule.trigger || !newRule.action) return;
    setRules(prev => [...prev, {
      id: Date.now().toString(),
      ...newRule,
      is_active: true,
      runs: 0,
      last_run: null,
    }]);
    setNewRule({ name: "", trigger: "", action: "" });
    setShowAdd(false);
  }

  const activeCount = rules.filter(r => r.is_active).length;
  const totalRuns = rules.reduce((sum, r) => sum + r.runs, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a2b1a]">Automations</h1>
          <p className="text-sm text-gray-500 mt-1">Automate repetitive tasks and workflows in KeevOS</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-[#1a2b1a] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#2d4a2d]"
        >
          <Plus className="w-4 h-4" /> New Automation
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Active Rules", value: activeCount, color: "text-green-600" },
          { label: "Total Rules", value: rules.length, color: "text-[#1a2b1a]" },
          { label: "Total Runs", value: totalRuns, color: "text-blue-600" },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Add Rule Form */}
      {showAdd && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h3 className="font-semibold text-[#1a2b1a]">New Automation Rule</h3>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Rule Name</label>
            <input
              value={newRule.name}
              onChange={(e) => setNewRule(p => ({ ...p, name: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="e.g. Case Approved → Send Congratulations"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Trigger (When...)</label>
            <input
              value={newRule.trigger}
              onChange={(e) => setNewRule(p => ({ ...p, trigger: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="e.g. Case status changes to APPROVED"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Action (Then...)</label>
            <input
              value={newRule.action}
              onChange={(e) => setNewRule(p => ({ ...p, action: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="e.g. Create task 'Schedule lease signing'"
            />
          </div>
          <div className="flex gap-3">
            <button onClick={addRule} className="bg-[#1a2b1a] text-white px-4 py-2 rounded-lg text-sm">Save Rule</button>
            <button onClick={() => setShowAdd(false)} className="border border-gray-200 px-4 py-2 rounded-lg text-sm text-gray-600">Cancel</button>
          </div>
        </div>
      )}

      {/* Rules List */}
      <div className="space-y-3">
        {rules.map((rule) => (
          <div key={rule.id} className={cn(
            "bg-white rounded-xl border p-5 transition-all",
            rule.is_active ? "border-gray-100" : "border-gray-100 opacity-60"
          )}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
                  rule.is_active ? "bg-green-100" : "bg-gray-100"
                )}>
                  <Zap className={cn("w-4 h-4", rule.is_active ? "text-green-600" : "text-gray-400")} />
                </div>
                <div>
                  <p className="font-semibold text-[#1a2b1a] text-sm">{rule.name}</p>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">WHEN</span>
                      <span className="text-gray-600">{rule.trigger}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <ChevronRight className="w-3 h-3 text-gray-300" />
                      <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded font-medium">THEN</span>
                      <span className="text-gray-600">{rule.action}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                    <span>{rule.runs} runs</span>
                    {rule.last_run && (
                      <span>Last run: {new Date(rule.last_run).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleRule(rule.id)}
                  className={cn(
                    "flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-colors",
                    rule.is_active ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  )}
                >
                  {rule.is_active ? <><Pause className="w-3 h-3" /> Active</> : <><Play className="w-3 h-3" /> Paused</>}
                </button>
                <button onClick={() => deleteRule(rule.id)} className="text-gray-300 hover:text-red-400 transition-colors p-1.5">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 rounded-xl border border-blue-100 p-4 text-sm text-blue-700">
        <strong>Note:</strong> Automation rules are executed server-side when events occur. For advanced automations, connect via Zapier or Make using the Integrations tab.
      </div>
    </div>
  );
}
