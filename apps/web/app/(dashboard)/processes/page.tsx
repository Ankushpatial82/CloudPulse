"use client";

import React, { useState, useEffect } from "react";
import { Cpu, Search, RefreshCw } from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import { ProcessTable } from "../../../components/ProcessTable";
import { DEMO_PROCESSES } from "../../../lib/demoData";

import { apiFetch } from "../../../lib/api";

export default function ProcessesPage() {
  const { isDemo } = useDashboard();
  const [processes, setProcesses] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchProcesses = async () => {
    setLoading(true);
    if (isDemo) {
      setProcesses(DEMO_PROCESSES);
      setLoading(false);
    } else {
      const res = await apiFetch("/metrics/processes");
      if (res.success && res.data && res.data.length > 0) {
        setProcesses(res.data);
      } else {
        // Fallback to demo if no live data yet
        setProcesses(DEMO_PROCESSES);
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcesses();
  }, [isDemo]);

  const filteredProcesses = processes.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.username.toLowerCase().includes(search.toLowerCase()) ||
      (p.server && p.server.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-50">Cross-Server Process Manager</h2>
          <p className="text-xs text-txt-secondary">
            Aggregate running process maps, resource consumption, and telemetry metrics from nodes.
          </p>
        </div>
      </div>

      {/* Control panel */}
      <div className="flex items-center gap-3">
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted" />
          <input
            type="text"
            placeholder="Filter by process name, server, user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-card border border-border-subtle rounded-lg pl-9 pr-4 py-1.5 text-xs text-txt-primary placeholder:text-txt-muted focus:outline-none focus:border-cyan-500/60"
          />
        </div>

        <button
          onClick={fetchProcesses}
          className="p-1.5 rounded-lg bg-card border border-border-subtle text-txt-secondary hover:text-txt-primary transition-all flex items-center justify-center"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-xs text-txt-muted gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" />
          Syncing processes...
        </div>
      ) : (
        <ProcessTable processes={filteredProcesses} />
      )}
    </div>
  );
}
