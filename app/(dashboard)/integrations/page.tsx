"use client";

import { useState } from "react";
import { Plug, Webhook, Key, Zap, ExternalLink, Plus, Copy, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface WebhookItem {
  id: string;
  name: string;
  endpoint_url: string;
  event_types: string[];
  is_active: boolean;
  last_triggered_at: string | null;
}

const WEBHOOK_EVENTS = [
  "contact.created", "contact.updated",
  "tenant.created", "tenant.status_changed",
  "property.created", "property.status_changed",
  "case.created", "case.status_changed",
  "task.created", "task.completed",
  "document.uploaded",
];

const INTEGRATIONS = [
  { id: "zapier", name: "Zapier", description: "Connect to 6,000+ apps via Zapier", icon: "⚡", status: "available", docs: "#" },
  { id: "make", name: "Make (Integromat)", description: "Visual automation platform", icon: "🔧", status: "available", docs: "#" },
  { id: "n8n", name: "n8n", description: "Open-source workflow automation", icon: "🔄", status: "available", docs: "#" },
  { id: "google-sheets", name: "Google Sheets", description: "Export data directly to Google Sheets", icon: "📊", status: "coming_soon", docs: "#" },
  { id: "google-calendar", name: "Google Calendar", description: "Sync follow-ups and deadlines", icon: "📅", status: "coming_soon", docs: "#" },
  { id: "gmail", name: "Gmail / Email", description: "Send automated email notifications", icon: "📧", status: "available", docs: "#" },
];

export default function IntegrationsPage() {
  const [activeTab, setActiveTab] = useState<"integrations" | "webhooks" | "api">("integrations");
  const [webhooks, setWebhooks] = useState<WebhookItem[]>([
    { id: "1", name: "Case Status Webhook", endpoint_url: "https://hooks.zapier.com/hooks/...", event_types: ["case.status_changed"], is_active: true, last_triggered_at: new Date().toISOString() },
    { id: "2", name: "New Contact Alert", endpoint_url: "https://make.com/hook/...", event_types: ["contact.created"], is_active: false, last_triggered_at: null },
  ]);
  const [showAddWebhook, setShowAddWebhook] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [newWebhook, setNewWebhook] = useState({ name: "", endpoint_url: "", event_types: [] as string[] });

  const apiKey = process.env.NEXT_PUBLIC_APP_URL ? "keevos_" + "xxxx-xxxx-xxxx-xxxx" : "keevos_sk_demo_key";

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  function toggleWebhook(id: string) {
    setWebhooks(prev => prev.map(w => w.id === id ? { ...w, is_active: !w.is_active } : w));
  }

  function addWebhook() {
    if (!newWebhook.name || !newWebhook.endpoint_url) return;
    setWebhooks(prev => [...prev, {
      id: Date.now().toString(),
      ...newWebhook,
      is_active: true,
      last_triggered_at: null,
    }]);
    setNewWebhook({ name: "", endpoint_url: "", event_types: [] });
    setShowAddWebhook(false);
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1a2b1a]">Integrations & API</h1>
        <p className="text-sm text-gray-500 mt-1">Connect KeevOS with external tools and services</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {([
          { id: "integrations", label: "Integrations", icon: Plug },
          { id: "webhooks", label: "Webhooks", icon: Webhook },
          { id: "api", label: "API Keys", icon: Key },
        ] as const).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              "flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors",
              activeTab === id ? "border-[#4caf50] text-[#1a2b1a]" : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Integrations Tab */}
      {activeTab === "integrations" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {INTEGRATIONS.map((integration) => (
            <div key={integration.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{integration.icon}</span>
                  <div>
                    <p className="font-semibold text-[#1a2b1a]">{integration.name}</p>
                    <p className="text-xs text-gray-400">{integration.description}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className={cn(
                  "text-xs px-2 py-1 rounded-full font-medium",
                  integration.status === "available" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                )}>
                  {integration.status === "available" ? "Available" : "Coming Soon"}
                </span>
                {integration.status === "available" && (
                  <button className="flex items-center gap-1 text-xs text-[#4caf50] hover:underline">
                    Connect <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Webhooks Tab */}
      {activeTab === "webhooks" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Outgoing webhooks fire when events occur in KeevOS</p>
              <p className="text-xs text-gray-400 mt-0.5">Incoming endpoint: <code className="bg-gray-100 px-1 rounded">/api/webhooks/incoming</code></p>
            </div>
            <button
              onClick={() => setShowAddWebhook(true)}
              className="flex items-center gap-2 bg-[#1a2b1a] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#2d4a2d]"
            >
              <Plus className="w-4 h-4" /> Add Webhook
            </button>
          </div>

          {showAddWebhook && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <h3 className="font-semibold text-[#1a2b1a]">New Webhook</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Webhook Name</label>
                  <input
                    value={newWebhook.name}
                    onChange={(e) => setNewWebhook(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="e.g. Case Status Notifier"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Endpoint URL</label>
                  <input
                    value={newWebhook.endpoint_url}
                    onChange={(e) => setNewWebhook(prev => ({ ...prev, endpoint_url: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-2">Events to Watch</label>
                <div className="grid grid-cols-3 gap-2">
                  {WEBHOOK_EVENTS.map((event) => (
                    <label key={event} className="flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newWebhook.event_types.includes(event)}
                        onChange={(e) => {
                          setNewWebhook(prev => ({
                            ...prev,
                            event_types: e.target.checked
                              ? [...prev.event_types, event]
                              : prev.event_types.filter(ev => ev !== event)
                          }));
                        }}
                        className="rounded"
                      />
                      <code className="text-gray-600">{event}</code>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={addWebhook} className="bg-[#1a2b1a] text-white px-4 py-2 rounded-lg text-sm">Save Webhook</button>
                <button onClick={() => setShowAddWebhook(false)} className="border border-gray-200 px-4 py-2 rounded-lg text-sm text-gray-600">Cancel</button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {webhooks.map((webhook) => (
              <div key={webhook.id} className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-2 h-2 rounded-full", webhook.is_active ? "bg-green-400" : "bg-gray-300")} />
                    <div>
                      <p className="font-medium text-[#1a2b1a] text-sm">{webhook.name}</p>
                      <p className="text-xs text-gray-400 font-mono">{webhook.endpoint_url}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleWebhook(webhook.id)}
                      className={cn(
                        "text-xs px-3 py-1 rounded-full font-medium transition-colors",
                        webhook.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      )}
                    >
                      {webhook.is_active ? "Active" : "Inactive"}
                    </button>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  {webhook.event_types.map((ev) => (
                    <span key={ev} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">{ev}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* API Keys Tab */}
      {activeTab === "api" && (
        <div className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-700">Keep your API keys secure. Never share them in public repositories or client-side code.</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
            <h3 className="font-semibold text-[#1a2b1a]">Internal API Key</h3>
            <p className="text-sm text-gray-500">Use this key for server-to-server API calls. Pass as <code className="bg-gray-100 px-1 rounded text-xs">x-api-key</code> header.</p>
            <div className="flex items-center gap-3">
              <input
                type="password"
                value={apiKey}
                readOnly
                className="flex-1 border rounded-lg px-3 py-2 text-sm font-mono bg-gray-50"
              />
              <button
                onClick={() => copyToClipboard(apiKey, "api-key")}
                className="flex items-center gap-2 border border-gray-200 px-4 py-2 rounded-lg text-sm hover:bg-gray-50"
              >
                {copied === "api-key" ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
                {copied === "api-key" ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-semibold text-[#1a2b1a] mb-3">API Endpoints</h3>
            <div className="space-y-2 font-mono text-sm">
              {[
                { method: "GET", path: "/api/contacts", description: "List contacts" },
                { method: "POST", path: "/api/contacts", description: "Create contact" },
                { method: "GET", path: "/api/properties", description: "List properties" },
                { method: "POST", path: "/api/properties", description: "Create property" },
                { method: "GET", path: "/api/cases", description: "List housing cases" },
                { method: "POST", path: "/api/cases", description: "Create housing case" },
                { method: "POST", path: "/api/webhooks/incoming", description: "Receive incoming webhook" },
                { method: "GET", path: "/api/health", description: "Health check" },
              ].map((ep) => (
                <div key={ep.path} className="flex items-center gap-3 py-2 border-b border-gray-50">
                  <span className={cn(
                    "w-12 text-center text-xs font-bold px-1.5 py-0.5 rounded",
                    ep.method === "GET" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                  )}>
                    {ep.method}
                  </span>
                  <span className="text-gray-700">{ep.path}</span>
                  <span className="text-gray-400 text-xs ml-auto">{ep.description}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
