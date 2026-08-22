"use client";

import React, { useState, useEffect } from "react";
import { Plus, AlertTriangle, CheckCircle, RefreshCw, Trash, Play } from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import { CreateAlertModal } from "../../../components/CreateAlertModal";
import { apiFetch } from "../../../lib/api";
import { DEMO_ALERTS } from "../../../lib/demoData";

export default function AlertsPage() {
  const { isDemo } = useDashboard();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [servers, setServers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);

  const fetchAlertsData = async () => {
    setLoading(true);
    if (isDemo) {
      setAlerts(DEMO_ALERTS);
      setRules([
        { id: "rule-1", name: "Global CPU Threshold Alert", metricType: "CPU", operator: "GT", threshold: 90, severity: "CRITICAL", enabled: true },
        { id: "rule-2", name: "High Memory Warn", metricType: "MEMORY", operator: "GT", threshold: 85, severity: "WARNING", enabled: true },
        { id: "rule-3", name: "Staging disk warning", metricType: "DISK", operator: "GT", threshold: 80, severity: "WARNING", enabled: true },
      ]);
      setServers([
        { id: "srv-us-east-prod-01", name: "us-east-prod-01" },
        { id: "srv-eu-west-db-02", name: "eu-west-db-cluster-02" },
      ]);
      setLoading(false);
    } else {
      const alertsRes = await apiFetch("/alerts");
      const rulesRes = await apiFetch("/alerts/rules");
      const serversRes = await apiFetch("/servers");

      if (alertsRes.success && alertsRes.data) setAlerts(alertsRes.data);
      if (rulesRes.success && rulesRes.data) setRules(rulesRes.data);
      if (serversRes.success && serversRes.data) setServers(serversRes.data);
      setLoading(false);
    }
  };

  const handleResolveAlert = async (id: string) => {
    if (isDemo) {
      setAlerts((prev) => prev.map((alt) => (alt.id === id ? { ...alt, status: "RESOLVED" } : alt)));
      return;
    }
    const res = await apiFetch(`/alerts/${id}/resolve`, { method: "PATCH" });
    if (res.success) {
      fetchAlertsData();
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (isDemo) {
      setRules((prev) => prev.filter((r) => r.id !== id));
      return;
    }
    const res = await apiFetch(`/alerts/rules/${id}`, { method: "DELETE" });
    if (res.success) {
      fetchAlertsData();
    }
  };

  useEffect(() => {
    fetchAlertsData();
  }, [isDemo]);

  const activeIncidents = alerts.filter((a) => a.status === "ACTIVE");
  const resolvedHistory = alerts.filter((a) => a.status === "RESOLVED");

  return (
    <div className="space-y-6">
      {/* Head Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-50">Incident Alert Center</h2>
          <p className="text-xs text-txt-secondary">
            Configure host metrics monitoring rules and respond to live incidents.
          </p>
        </div>
        <button
          onClick={() => setIsRuleModalOpen(true)}
          className="px-4 py-2 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-black flex items-center justify-center gap-1.5 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Alert Rule
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Incidents Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-txt-primary">
              Active Incidents ({activeIncidents.length})
            </span>
            <button onClick={fetchAlertsData} className="text-txt-secondary hover:text-cyan-400">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {activeIncidents.length === 0 ? (
              <div className="bg-card border border-border-subtle rounded-xl p-8 text-center text-xs text-txt-muted flex flex-col items-center gap-2">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
                No active metrics warning anomalies or offline incidents detected.
              </div>
            ) : (
              activeIncidents.map((alt) => (
                <div
                  key={alt.id}
                  className={`bg-card border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                    alt.severity === "CRITICAL" ? "border-rose-900/60 shadow-rose-950/20" : "border-amber-900/60 shadow-amber-950/20"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        alt.severity === "CRITICAL" ? "bg-rose-950 text-rose-400" : "bg-amber-950 text-amber-400"
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-txt-primary">
                          {alt.serverName || alt.server?.name}
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 font-mono font-bold rounded ${
                            alt.severity === "CRITICAL" ? "bg-rose-950 text-rose-400" : "bg-amber-950 text-amber-400"
                          }`}
                        >
                          {alt.severity}
                        </span>
                      </div>
                      <p className="text-xs text-txt-secondary mt-1">{alt.message}</p>
                      <div className="text-[10px] text-txt-muted mt-2">Triggered at: {alt.triggeredAt}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleResolveAlert(alt.id)}
                    className="px-3 py-1.5 rounded bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-800 text-cyan-400 text-xs font-semibold self-start sm:self-auto transition-colors"
                  >
                    Resolve Incident
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Resolved History */}
          {resolvedHistory.length > 0 && (
            <div className="mt-8 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-txt-secondary border-b border-border-subtle pb-2">
                Resolved Incident Logs
              </div>
              <div className="space-y-2">
                {resolvedHistory.map((alt) => (
                  <div
                    key={alt.id}
                    className="bg-card/45 border border-border-subtle rounded-xl p-4 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <div>
                        <span className="font-semibold text-txt-secondary">
                          {alt.serverName || alt.server?.name}
                        </span>
                        <p className="text-[11px] text-txt-muted mt-0.5">{alt.message}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-txt-muted font-mono">Resolved</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Threshold Rules Sidebar */}
        <div className="space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-txt-primary border-b border-border-subtle pb-3">
            Metric Alert Rules ({rules.length})
          </div>

          <div className="space-y-3">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="bg-card border border-border-subtle rounded-xl p-4 space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-txt-primary truncate max-w-[150px]">
                    {rule.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                        rule.severity === "CRITICAL" ? "bg-rose-950 text-rose-400" : "bg-amber-950 text-amber-400"
                      }`}
                    >
                      {rule.severity}
                    </span>
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="text-txt-muted hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-txt-secondary">
                  <div className="flex justify-between">
                    <span>Evaluates:</span>
                    <span className="font-mono text-cyan-400">
                      {rule.metricType} {rule.operator} {rule.threshold}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Scope:</span>
                    <span>{rule.server?.name || "Global (All hosts)"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <CreateAlertModal
        isOpen={isRuleModalOpen}
        onClose={() => setIsRuleModalOpen(false)}
        servers={servers}
        onSuccess={fetchAlertsData}
      />
    </div>
  );
}
