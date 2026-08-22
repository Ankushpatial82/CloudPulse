"use client";

import React, { useState, useEffect } from "react";
import { History, ShieldAlert, RefreshCw, User, Database } from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import { apiFetch } from "../../../lib/api";

export default function ActivityPage() {
  const { isDemo } = useDashboard();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    if (isDemo) {
      setLogs([
        { id: "log-1", action: "USER_LOGIN", resource: "User:demo-user", details: "User demo@cloudpulse.io logged in successfully", ipAddress: "127.0.0.1", createdAt: new Date().toISOString() },
        { id: "log-2", action: "SERVER_CREATED", resource: "Server:srv-us-east-prod-01", details: "Created server us-east-prod-01", ipAddress: "192.168.10.45", createdAt: new Date(Date.now() - 3600000).toISOString() },
        { id: "log-3", action: "ALERT_RULE_CREATED", resource: "AlertRule:rule-1", details: "Created alert rule Global CPU Threshold Alert", ipAddress: "127.0.0.1", createdAt: new Date(Date.now() - 7200000).toISOString() },
      ]);
      setLoading(false);
    } else {
      const res = await apiFetch("/activity");
      if (res.success && res.data) {
        setLogs(res.data);
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [isDemo]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-50">Audit & Operations Timeline</h2>
        <p className="text-xs text-txt-secondary">
          Track user login mappings, layout configurations, rule creations, and security logs.
        </p>
      </div>

      <div className="bg-card border border-border-subtle rounded-xl overflow-hidden shadow-lg p-5">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3 mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-txt-primary">Operations Log</span>
          <button onClick={fetchLogs} className="text-txt-secondary hover:text-cyan-400">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-xs text-txt-muted gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" />
            Synchronizing logs pipeline...
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center text-txt-muted text-xs py-16">No recorded operational logs.</div>
        ) : (
          <div className="relative border-l border-border-subtle pl-6 ml-4 space-y-8">
            {logs.map((log) => (
              <div key={log.id} className="relative">
                {/* Timeline circle indicator */}
                <span className="absolute -left-[31px] top-1 bg-cyan-950 border border-cyan-500 rounded-full w-4.5 h-4.5 flex items-center justify-center text-[10px] text-cyan-400 font-bold">
                  ✓
                </span>
                <div className="text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-txt-primary font-mono text-[11px] bg-bg-secondary px-2 py-0.5 rounded border border-border-subtle">
                      {log.action}
                    </span>
                    <span className="text-[10px] text-txt-muted">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-txt-secondary text-[11px] mt-2 font-medium">{log.details}</p>
                  <div className="text-[10px] text-txt-muted mt-1.5 flex items-center gap-3 font-mono">
                    <span>Target Resource: {log.resource}</span>
                    <span>IP: {log.ipAddress || "system"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
