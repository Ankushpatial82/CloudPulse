"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Sliders,
  User,
  Key,
  Sparkles,
  Save,
  Eye,
  EyeOff,
  Copy,
  Check,
  RefreshCw,
  Webhook,
  Shield,
  Bell,
  Database,
  Clock,
  Trash2,
  Plus,
  AlertCircle,
} from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";

type SettingsTab = "telemetry" | "profile" | "apikeys";

function SettingsContent() {
  const searchParams = useSearchParams();
  const { isDemo, user, toggleDemo } = useDashboard();
  const [activeTab, setActiveTab] = useState<SettingsTab>("telemetry");

  // Sync tab from URL query param (?tab=profile etc.)
  useEffect(() => {
    const tab = searchParams.get("tab") as SettingsTab | null;
    if (tab && ["telemetry", "profile", "apikeys"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // ─── Telemetry Tab State ─────────────────────────────────────────────────
  const [retentionDays, setRetentionDays] = useState("30");
  const [intervalSec, setIntervalSec] = useState("5");
  const [savingTelemetry, setSavingTelemetry] = useState(false);
  const [telemetrySaved, setTelemetrySaved] = useState(false);

  const handleSaveTelemetry = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingTelemetry(true);
    setTimeout(() => {
      setSavingTelemetry(false);
      setTelemetrySaved(true);
      setTimeout(() => setTelemetrySaved(false), 2500);
    }, 800);
  };

  // ─── Profile Tab State ───────────────────────────────────────────────────
  const [displayName, setDisplayName] = useState(user?.name || "Admin User");
  const [email, setEmail] = useState(user?.email || "admin@cloudpulse.io");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState("");

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");
    if (newPassword && newPassword !== confirmPassword) {
      setProfileError("New passwords do not match.");
      return;
    }
    setProfileSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    setProfileSaving(false);
    setProfileSaved(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setProfileSaved(false), 2500);
  };

  // ─── API Keys Tab State ──────────────────────────────────────────────────
  const [apiKeys, setApiKeys] = useState([
    { id: "key-1", name: "Production Agent Key", key: "cp_agent_70298f6afe44c5a53be2f9fc93aed61e", createdAt: "2026-08-22", lastUsed: "2 minutes ago", scope: "metrics:write" },
    { id: "key-2", name: "Read-Only Dashboard API", key: "cp_ro_8f3a2c19d7e4b5f6a1c0d9e8f7b6a5c4", createdAt: "2026-08-20", lastUsed: "1 hour ago", scope: "metrics:read servers:read" },
  ]);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyScope, setNewKeyScope] = useState("metrics:read");
  const [generatingKey, setGeneratingKey] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("https://hooks.example.com/cloudpulse");
  const [webhookEnabled, setWebhookEnabled] = useState(false);
  const [webhookSaved, setWebhookSaved] = useState(false);

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeys((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const copyKey = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleGenerateKey = async () => {
    if (!newKeyName.trim()) return;
    setGeneratingKey(true);
    await new Promise((r) => setTimeout(r, 800));
    const newKey = `cp_api_${Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
    setApiKeys((prev) => [
      ...prev,
      {
        id: `key-${Date.now()}`,
        name: newKeyName,
        key: newKey,
        createdAt: new Date().toISOString().split("T")[0],
        lastUsed: "Never",
        scope: newKeyScope,
      },
    ]);
    setNewKeyName("");
    setGeneratingKey(false);
  };

  const handleDeleteKey = (id: string) => {
    if (confirm("Permanently delete this API key? All agents using it will stop reporting.")) {
      setApiKeys((prev) => prev.filter((k) => k.id !== id));
    }
  };

  const handleSaveWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    setWebhookSaved(true);
    setTimeout(() => setWebhookSaved(false), 2000);
  };

  const maskKey = (key: string) =>
    key.slice(0, 12) + "••••••••••••••••" + key.slice(-6);

  // ─── Tab Config ──────────────────────────────────────────────────────────
  const tabs: { id: SettingsTab; label: string; icon: React.FC<any> }[] = [
    { id: "telemetry", label: "Telemetry Configurations", icon: Sliders },
    { id: "profile", label: "Profile Credentials", icon: User },
    { id: "apikeys", label: "API Keys & Webhooks", icon: Key },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-slate-50">Global Portal Settings</h2>
        <p className="text-xs text-txt-secondary">
          Configure server retention rules, telemetry sync intervals, security profiles, and API access.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ── Sidebar Navigation ── */}
        <div className="bg-card border border-border-subtle rounded-xl p-4 space-y-1 h-fit">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all ${
                activeTab === id
                  ? "bg-bg-secondary text-cyan-400 border border-cyan-800/40"
                  : "text-txt-secondary hover:text-txt-primary hover:bg-bg-secondary"
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              {label}
            </button>
          ))}
        </div>

        {/* ── Content Panel ── */}
        <div className="md:col-span-2 space-y-6">

          {/* ════ TELEMETRY TAB ════ */}
          {activeTab === "telemetry" && (
            <>
              {/* Telemetry settings */}
              <div className="bg-card border border-border-subtle rounded-xl p-5 shadow-lg space-y-4">
                <div className="flex items-center gap-3 border-b border-border-subtle pb-3">
                  <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-txt-primary">Metrics Frequency & Retention</h3>
                    <p className="text-[10px] text-txt-muted">Control how long data is stored and how often agents sync.</p>
                  </div>
                </div>

                <form onSubmit={handleSaveTelemetry} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-txt-secondary mb-1">
                      Metric Storage Retention Rollups
                    </label>
                    <select
                      value={retentionDays}
                      onChange={(e) => setRetentionDays(e.target.value)}
                      className="w-full bg-bg-main border border-border-subtle rounded-lg px-3 py-2 text-txt-primary focus:outline-none focus:border-cyan-500"
                    >
                      <option value="7">7 Days retention limit</option>
                      <option value="30">30 Days retention limit (Recommended)</option>
                      <option value="90">90 Days compliance backup retention</option>
                    </select>
                    <span className="text-[10px] text-txt-muted mt-1 block">
                      CloudPulse cleans high-frequency records automatically after this retention limit.
                    </span>
                  </div>

                  <div>
                    <label className="block font-semibold text-txt-secondary mb-1">
                      Default Telemetry Evaluation Frequency (Seconds)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={intervalSec}
                      onChange={(e) => setIntervalSec(e.target.value)}
                      className="w-full bg-bg-main border border-border-subtle rounded-lg px-3 py-2 text-txt-primary focus:outline-none focus:border-cyan-500 font-mono"
                    />
                    <span className="text-[10px] text-txt-muted mt-1 block">
                      How frequently connected agents transmit hardware utilization states.
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={savingTelemetry}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-black transition-colors disabled:opacity-60"
                  >
                    {savingTelemetry ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : telemetrySaved ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    {savingTelemetry ? "Saving..." : telemetrySaved ? "Saved!" : "Save Settings"}
                  </button>
                </form>
              </div>

              {/* Sandbox panel */}
              <div className="bg-card border border-border-subtle rounded-xl p-5 shadow-lg space-y-4">
                <div className="flex items-center gap-3 border-b border-border-subtle pb-3">
                  <div className="p-2 rounded-lg bg-amber-950 text-amber-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-txt-primary">Simulated Sandbox Environment</h3>
                    <p className="text-[10px] text-txt-muted">Toggle between live PostgreSQL data and demo simulation.</p>
                  </div>
                </div>

                <div className="text-xs leading-relaxed text-txt-secondary space-y-3">
                  <p>
                    When presenting CloudPulse for portfolios, recruitment sandbox pipelines bypass PostgreSQL/Redis connections via the simulated toggle mode.
                  </p>
                  <div className="flex items-center justify-between p-3 bg-bg-secondary border border-border-subtle rounded-lg">
                    <div>
                      <span className="font-bold text-txt-primary block">Bypass mode status:</span>
                      <span className="text-txt-muted text-[11px]">
                        {isDemo ? "Rendering deterministic metrics maps." : "Awaiting actual telemetry API requests."}
                      </span>
                    </div>
                    <button
                      onClick={toggleDemo}
                      className={`px-3 py-1.5 rounded-lg font-bold text-[11px] border transition-colors ${
                        isDemo
                          ? "bg-amber-950/60 border-amber-800 text-amber-300 hover:bg-amber-900"
                          : "bg-cyan-950/60 border-cyan-800 text-cyan-400 hover:bg-cyan-900"
                      }`}
                    >
                      {isDemo ? "Disable Sandbox" : "Enable Sandbox"}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ════ PROFILE TAB ════ */}
          {activeTab === "profile" && (
            <>
              {/* Account Info */}
              <div className="bg-card border border-border-subtle rounded-xl p-5 shadow-lg space-y-4">
                <div className="flex items-center gap-3 border-b border-border-subtle pb-3">
                  <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-txt-primary">Profile Information</h3>
                    <p className="text-[10px] text-txt-muted">Update your display name and contact details.</p>
                  </div>
                </div>

                {/* Avatar circle */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-cyan-950 border-2 border-cyan-500/40 flex items-center justify-center text-cyan-400 text-xl font-bold">
                    {displayName ? displayName[0].toUpperCase() : "A"}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-txt-primary">{displayName}</div>
                    <div className="text-xs text-txt-muted">{email}</div>
                    <div className="text-[10px] text-cyan-400 font-mono mt-0.5">
                      Role: {user?.role || "USER"}
                    </div>
                  </div>
                </div>

                {profileError && (
                  <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {profileError}
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-txt-secondary mb-1">Display Name</label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full bg-bg-main border border-border-subtle rounded-lg px-3 py-2 text-txt-primary focus:outline-none focus:border-cyan-500"
                        placeholder="Full Name"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-txt-secondary mb-1">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-bg-main border border-border-subtle rounded-lg px-3 py-2 text-txt-primary focus:outline-none focus:border-cyan-500"
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>

                  <div className="border-t border-border-subtle pt-4">
                    <div className="text-xs font-bold text-txt-primary mb-3 flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-cyan-400" />
                      Change Password
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block font-semibold text-txt-secondary mb-1">Current Password</label>
                        <div className="relative">
                          <input
                            type={showCurrent ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full bg-bg-main border border-border-subtle rounded-lg px-3 py-2 pr-9 text-txt-primary focus:outline-none focus:border-cyan-500"
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrent(!showCurrent)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-txt-muted hover:text-txt-primary"
                          >
                            {showCurrent ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold text-txt-secondary mb-1">New Password</label>
                          <div className="relative">
                            <input
                              type={showNew ? "text" : "password"}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="w-full bg-bg-main border border-border-subtle rounded-lg px-3 py-2 pr-9 text-txt-primary focus:outline-none focus:border-cyan-500"
                              placeholder="New password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNew(!showNew)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-txt-muted hover:text-txt-primary"
                            >
                              {showNew ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block font-semibold text-txt-secondary mb-1">Confirm Password</label>
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-bg-main border border-border-subtle rounded-lg px-3 py-2 text-txt-primary focus:outline-none focus:border-cyan-500"
                            placeholder="Confirm new password"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="submit"
                      disabled={profileSaving}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-black transition-colors disabled:opacity-60"
                    >
                      {profileSaving ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : profileSaved ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Save className="w-3.5 h-3.5" />
                      )}
                      {profileSaving ? "Saving..." : profileSaved ? "Saved!" : "Save Profile"}
                    </button>
                    {profileSaved && (
                      <span className="text-xs text-emerald-400 font-semibold">Profile updated successfully.</span>
                    )}
                  </div>
                </form>
              </div>

              {/* Notification Preferences */}
              <div className="bg-card border border-border-subtle rounded-xl p-5 shadow-lg space-y-4">
                <div className="flex items-center gap-3 border-b border-border-subtle pb-3">
                  <div className="p-2 rounded-lg bg-emerald-950 text-emerald-400">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-txt-primary">Notification Preferences</h3>
                    <p className="text-[10px] text-txt-muted">Control where and how you receive alert notifications.</p>
                  </div>
                </div>
                <div className="space-y-3 text-xs">
                  {[
                    { label: "Critical Alert Emails", desc: "Receive email when severity is CRITICAL", defaultOn: true },
                    { label: "Warning Alert Emails", desc: "Receive email for WARNING level metrics", defaultOn: false },
                    { label: "Agent Offline Alerts", desc: "Notify when an agent stops sending heartbeats", defaultOn: true },
                    { label: "Weekly Summary Digest", desc: "Receive weekly infrastructure health summary", defaultOn: false },
                  ].map((pref, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-bg-secondary border border-border-subtle rounded-lg">
                      <div>
                        <div className="font-semibold text-txt-primary">{pref.label}</div>
                        <div className="text-[10px] text-txt-muted mt-0.5">{pref.desc}</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked={pref.defaultOn} className="sr-only peer" />
                        <div className="w-9 h-5 bg-bg-main peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-txt-muted after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-600 peer-checked:after:bg-white border border-border-subtle"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ════ API KEYS TAB ════ */}
          {activeTab === "apikeys" && (
            <>
              {/* Existing Keys */}
              <div className="bg-card border border-border-subtle rounded-xl p-5 shadow-lg space-y-4">
                <div className="flex items-center gap-3 border-b border-border-subtle pb-3">
                  <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400">
                    <Key className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-txt-primary">Active API Keys</h3>
                    <p className="text-[10px] text-txt-muted">Manage agent tokens and read-only dashboard API keys.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {apiKeys.map((ak) => (
                    <div key={ak.id} className="p-4 bg-bg-secondary border border-border-subtle rounded-xl space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-xs text-txt-primary">{ak.name}</div>
                          <div className="text-[10px] text-txt-muted font-mono mt-0.5">{ak.scope}</div>
                        </div>
                        <button
                          onClick={() => handleDeleteKey(ak.id)}
                          className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-900/40 transition-colors"
                          title="Delete API Key"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 bg-bg-main border border-border-subtle rounded-lg px-3 py-1.5 text-[11px] font-mono text-txt-secondary truncate">
                          {visibleKeys.has(ak.id) ? ak.key : maskKey(ak.key)}
                        </code>
                        <button
                          onClick={() => toggleKeyVisibility(ak.id)}
                          className="p-1.5 rounded-lg bg-bg-main border border-border-subtle text-txt-muted hover:text-txt-primary transition-colors"
                          title={visibleKeys.has(ak.id) ? "Hide key" : "Show key"}
                        >
                          {visibleKeys.has(ak.id) ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => copyKey(ak.key, ak.id)}
                          className="p-1.5 rounded-lg bg-bg-main border border-border-subtle text-txt-muted hover:text-cyan-400 transition-colors"
                          title="Copy key"
                        >
                          {copiedKey === ak.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <div className="flex items-center gap-4 text-[10px] text-txt-muted font-mono">
                        <span>Created: {ak.createdAt}</span>
                        <span>Last used: {ak.lastUsed}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Generate New Key */}
              <div className="bg-card border border-border-subtle rounded-xl p-5 shadow-lg space-y-4">
                <div className="flex items-center gap-3 border-b border-border-subtle pb-3">
                  <div className="p-2 rounded-lg bg-emerald-950 text-emerald-400">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-txt-primary">Generate New API Key</h3>
                    <p className="text-[10px] text-txt-muted">Create keys for agents, integrations, or read-only access.</p>
                  </div>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-txt-secondary mb-1">Key Name</label>
                      <input
                        type="text"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                        placeholder="e.g. Staging Agent Key"
                        className="w-full bg-bg-main border border-border-subtle rounded-lg px-3 py-2 text-txt-primary focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-txt-secondary mb-1">Permission Scope</label>
                      <select
                        value={newKeyScope}
                        onChange={(e) => setNewKeyScope(e.target.value)}
                        className="w-full bg-bg-main border border-border-subtle rounded-lg px-3 py-2 text-txt-primary focus:outline-none focus:border-cyan-500"
                      >
                        <option value="metrics:write">metrics:write (Agent)</option>
                        <option value="metrics:read">metrics:read (Read-only)</option>
                        <option value="metrics:read servers:read">metrics:read servers:read</option>
                        <option value="admin:full">admin:full (Full Access)</option>
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={handleGenerateKey}
                    disabled={generatingKey || !newKeyName.trim()}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-black transition-colors disabled:opacity-50"
                  >
                    {generatingKey ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                    {generatingKey ? "Generating..." : "Generate API Key"}
                  </button>
                </div>
              </div>

              {/* Webhook Config */}
              <div className="bg-card border border-border-subtle rounded-xl p-5 shadow-lg space-y-4">
                <div className="flex items-center gap-3 border-b border-border-subtle pb-3">
                  <div className="p-2 rounded-lg bg-amber-950 text-amber-400">
                    <Webhook className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-txt-primary">Webhook Integrations</h3>
                    <p className="text-[10px] text-txt-muted">Send alert notifications to external HTTP endpoints.</p>
                  </div>
                </div>
                <form onSubmit={handleSaveWebhook} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-txt-secondary mb-1">Webhook URL</label>
                    <input
                      type="url"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      placeholder="https://hooks.slack.com/services/..."
                      className="w-full bg-bg-main border border-border-subtle rounded-lg px-3 py-2 text-txt-primary focus:outline-none focus:border-cyan-500 font-mono"
                    />
                    <span className="text-[10px] text-txt-muted mt-1 block">
                      CloudPulse will POST a JSON payload to this URL when alerts are triggered.
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-bg-secondary border border-border-subtle rounded-lg">
                    <div>
                      <div className="font-semibold text-txt-primary">Enable Webhook</div>
                      <div className="text-[10px] text-txt-muted">Fire HTTP POST on every alert trigger</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={webhookEnabled}
                        onChange={(e) => setWebhookEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-bg-main peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-txt-muted after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-600 peer-checked:after:bg-white border border-border-subtle"></div>
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-black transition-colors"
                    >
                      {webhookSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                      {webhookSaved ? "Saved!" : "Save Webhook"}
                    </button>
                    <button
                      type="button"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs bg-bg-secondary border border-border-subtle text-txt-secondary hover:text-txt-primary transition-colors"
                      onClick={() => alert("Test payload sent to webhook URL.")}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      Send Test Payload
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="text-xs text-txt-muted">Loading settings...</div>}>
      <SettingsContent />
    </Suspense>
  );
}
