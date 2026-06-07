"use client";

import { useState } from "react";
import { User, Bell, Shield, Building, Palette, Save } from "lucide-react";
import { cn } from "@/lib/utils";

type SettingsTab = "profile" | "organization" | "notifications" | "security" | "appearance";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [saved, setSaved] = useState(false);

  const [profileData, setProfileData] = useState({
    fullName: "Keev Admin",
    email: "admin@keevhousing.com",
    phone: "(212) 555-0100",
    role: "ADMIN",
    avatarUrl: "",
  });

  const [orgData, setOrgData] = useState({
    orgName: "Keev Housing Group",
    orgEmail: "info@keevhousing.com",
    orgPhone: "(212) 555-0100",
    orgAddress: "123 Main Street, New York, NY 10001",
    website: "https://keevhousing.com",
  });

  const [notifData, setNotifData] = useState({
    emailNewCase: true,
    emailCaseStatus: true,
    emailTask: false,
    emailFollowUp: true,
    browserPush: false,
    dailyDigest: true,
  });

  async function handleSave() {
    // In production, calls server action to update settings
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const tabs = [
    { id: "profile" as const, label: "My Profile", icon: User },
    { id: "organization" as const, label: "Organization", icon: Building },
    { id: "notifications" as const, label: "Notifications", icon: Bell },
    { id: "security" as const, label: "Security", icon: Shield },
    { id: "appearance" as const, label: "Appearance", icon: Palette },
  ];

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-[#1a2b1a] mb-6">Settings</h1>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-48 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left",
                  activeTab === id
                    ? "bg-[#1a2b1a] text-white"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="space-y-5">
                <h2 className="font-semibold text-[#1a2b1a]">My Profile</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Full Name</label>
                    <input
                      value={profileData.fullName}
                      onChange={(e) => setProfileData(p => ({ ...p, fullName: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Email Address</label>
                    <input
                      value={profileData.email}
                      onChange={(e) => setProfileData(p => ({ ...p, email: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                      type="email"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Phone</label>
                    <input
                      value={profileData.phone}
                      onChange={(e) => setProfileData(p => ({ ...p, phone: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Role</label>
                    <input value={profileData.role} readOnly className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Change Password</label>
                  <input type="password" placeholder="New password (leave blank to keep current)" className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
            )}

            {/* Organization Tab */}
            {activeTab === "organization" && (
              <div className="space-y-5">
                <h2 className="font-semibold text-[#1a2b1a]">Organization Settings</h2>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Organization Name", key: "orgName" as const },
                    { label: "Contact Email", key: "orgEmail" as const },
                    { label: "Phone Number", key: "orgPhone" as const },
                    { label: "Website", key: "website" as const },
                  ].map(({ label, key }) => (
                    <div key={key}>
                      <label className="text-xs text-gray-500 block mb-1">{label}</label>
                      <input
                        value={orgData[key]}
                        onChange={(e) => setOrgData(p => ({ ...p, [key]: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                  ))}
                  <div className="col-span-2">
                    <label className="text-xs text-gray-500 block mb-1">Address</label>
                    <input
                      value={orgData.orgAddress}
                      onChange={(e) => setOrgData(p => ({ ...p, orgAddress: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="space-y-5">
                <h2 className="font-semibold text-[#1a2b1a]">Notification Preferences</h2>
                <div className="space-y-4">
                  {[
                    { key: "emailNewCase" as const, label: "New case created", description: "Get notified when a new housing case is opened" },
                    { key: "emailCaseStatus" as const, label: "Case status changes", description: "Receive updates when case status changes" },
                    { key: "emailTask" as const, label: "Task assigned to me", description: "Email when a task is assigned to you" },
                    { key: "emailFollowUp" as const, label: "Follow-up reminders", description: "Daily reminders for overdue follow-ups" },
                    { key: "browserPush" as const, label: "Browser notifications", description: "In-browser push notifications" },
                    { key: "dailyDigest" as const, label: "Daily digest email", description: "Morning summary of your cases and tasks" },
                  ].map(({ key, label, description }) => (
                    <div key={key} className="flex items-center justify-between py-3 border-b border-gray-50">
                      <div>
                        <p className="text-sm font-medium text-[#1a2b1a]">{label}</p>
                        <p className="text-xs text-gray-400">{description}</p>
                      </div>
                      <button
                        onClick={() => setNotifData(p => ({ ...p, [key]: !p[key] }))}
                        className={cn(
                          "w-11 h-6 rounded-full transition-colors relative",
                          notifData[key] ? "bg-[#4caf50]" : "bg-gray-200"
                        )}
                      >
                        <span className={cn(
                          "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform",
                          notifData[key] ? "translate-x-5.5 left-0.5" : "left-0.5"
                        )} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="space-y-5">
                <h2 className="font-semibold text-[#1a2b1a]">Security Settings</h2>
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-100 rounded-lg p-4 text-sm text-green-700">
                    ✓ Your account is secured with Supabase Auth
                  </div>
                  <div className="border border-gray-100 rounded-lg p-4">
                    <h3 className="font-medium text-[#1a2b1a] mb-2">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-500 mb-3">Add an extra layer of security to your account</p>
                    <button className="text-sm bg-[#1a2b1a] text-white px-4 py-2 rounded-lg">Set Up 2FA</button>
                  </div>
                  <div className="border border-gray-100 rounded-lg p-4">
                    <h3 className="font-medium text-[#1a2b1a] mb-2">Active Sessions</h3>
                    <p className="text-sm text-gray-500">You are logged in on 1 device</p>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === "appearance" && (
              <div className="space-y-5">
                <h2 className="font-semibold text-[#1a2b1a]">Appearance</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-500 block mb-2">Theme</label>
                    <div className="flex gap-3">
                      {["Light", "Dark", "System"].map((theme) => (
                        <button
                          key={theme}
                          className={cn(
                            "px-4 py-2 rounded-lg border text-sm",
                            theme === "Light" ? "border-[#4caf50] bg-green-50 text-[#1a2b1a]" : "border-gray-200 text-gray-600"
                          )}
                        >
                          {theme}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="bg-[#1a2b1a] rounded-xl p-4 text-white">
                    <p className="text-xs opacity-70">KeevOS Brand Colors</p>
                    <div className="flex gap-3 mt-2">
                      <div className="w-8 h-8 rounded-lg bg-[#4caf50]" title="#4caf50" />
                      <div className="w-8 h-8 rounded-lg bg-white" title="#ffffff" />
                      <div className="w-8 h-8 rounded-lg bg-[#f7f4ef] border border-white/20" title="#f7f4ef" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-6 pt-5 border-t border-gray-100 flex items-center gap-3">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-[#1a2b1a] text-white px-5 py-2 rounded-lg text-sm hover:bg-[#2d4a2d]"
              >
                <Save className="w-4 h-4" />
                {saved ? "Saved!" : "Save Changes"}
              </button>
              {saved && <span className="text-sm text-green-600">Changes saved successfully</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
