"use client";

import React, { useState, useEffect } from "react";
import { Terminal, ShieldCheck, RefreshCw, Key, ShieldAlert } from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import { apiFetch } from "../../../lib/api";

export default function AgentsPage() {
  const { isDemo } = useDashboard();
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAgents = async () => {
    setLoading(true);
    if (isDemo) {
      setAgents([
        { id: "ag-1", server: { name: "us-east-prod-01", hostname: "prod-node-01" }, status: "ACTIVE", lastHeartbeat: "2s ago", version: "1.0.0", configIntervalSec: 5 },
        { id: "ag-2", server: { name: "eu-west-db-cluster-02", hostname: "pg-master" }, status: "ACTIVE", lastHeartbeat: "1s ago", version: "1.0.0", configIntervalSec: 5 },
        { id: "ag-3", server: { name: "us-west-api-gateway-03", hostname: "kong-gw" }, status: "ACTIVE", lastHeartbeat: "1s ago", version: "1.0.0", configIntervalSec: 5 },
      ]);
      setLoading(false);
    } else {
      const res = await apiFetch("/agents");
      if (res.success && res.data) {
        setAgents(res.data);
      }
      setLoading(false);
    }
  };

  const handleRevokeAgent = async (id: string) => {
    if (isDemo) {
      alert("Revocation not supported in simulated sandbox.");
      return;
    }
    if (!confirm("Revoking this agent token will disrupt its metrics feed until updated on host. Continue?")) {
      return;
    }
    const res = await apiFetch(`/agents/${id}/revoke`, { method: "POST" });
    if (res.success) {
      fetchAgents();
    }
  };

  useEffect(() => {
    fetchAgents();
  }, [isDemo]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-50">Monitoring Agent Pipelines</h2>
        <p className="text-xs text-txt-secondary">
          Track agent software heartbeat metrics, version updates, and configure security tokens.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agents table list */}
        <div className="lg:col-span-2 bg-card border border-border-subtle rounded-xl overflow-hidden shadow-lg">
          <div className="p-4 border-b border-border-subtle flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-txt-primary">Registered Agents</span>
            <button onClick={fetchAgents} className="text-txt-secondary hover:text-cyan-400">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-bg-secondary text-txt-secondary border-b border-border-subtle font-semibold">
                  <th className="px-5 py-3">Server Mapping</th>
                  <th className="px-5 py-3">Version</th>
                  <th className="px-5 py-3">Frequency</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Last Heartbeat</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-txt-muted">
                      Syncing agents...
                    </td>
                  </tr>
                ) : agents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-txt-muted">
                      No active monitoring agents configured.
                    </td>
                  </tr>
                ) : (
                  agents.map((ag) => (
                    <tr key={ag.id} className="hover:bg-bg-secondary/40 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-txt-primary">{ag.server?.name}</div>
                        <div className="text-[10px] text-txt-muted font-mono">{ag.server?.hostname}</div>
                      </td>
                      <td className="px-5 py-4 font-mono text-txt-secondary">v{ag.version}</td>
                      <td className="px-5 py-4 text-txt-secondary">{ag.configIntervalSec}s interval</td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-950/60 border-emerald-800/60 text-emerald-400">
                          <ShieldCheck className="w-3 h-3" />
                          {ag.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-mono text-txt-secondary">{ag.lastHeartbeat || "never"}</td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handleRevokeAgent(ag.id)}
                          className="px-2.5 py-1.5 rounded bg-rose-950/60 hover:bg-rose-900 border border-rose-900 text-rose-400 font-semibold"
                        >
                          Revoke Token
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Global Agent Deploy configuration */}
        <div className="bg-card border border-border-subtle rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-txt-primary">Security Architecture</h3>
              <p className="text-xs text-txt-muted">Telemetry payload tokens and validation protocols.</p>
            </div>
          </div>

          <div className="p-3.5 bg-bg-secondary border border-border-subtle rounded-lg text-xs leading-relaxed text-txt-secondary">
            <span className="font-bold text-txt-primary block mb-1">Agent Validation Protocol</span>
            Every payload submitted to the CloudPulse ingest pipeline carries an <code className="text-cyan-400 font-mono">X-Agent-Token</code> header. API authentication verifies the token mapping prior to committing metric rows to storage.
          </div>

          <div className="p-3.5 bg-rose-950/30 border border-rose-900/60 rounded-lg text-xs leading-relaxed text-rose-300">
            <div className="flex items-center gap-1.5 font-bold mb-1">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Token Security Warning
            </div>
            Never commit raw agent tokens inside repositories or environment configurations visible to public clients. Use server secret vaults.
          </div>
        </div>
      </div>
    </div>
  );
}
