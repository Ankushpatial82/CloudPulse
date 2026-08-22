"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, Filter, RefreshCw, AlertCircle } from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import { ServerTable } from "../../../components/ServerTable";
import { AddServerModal } from "../../../components/AddServerModal";
import { apiFetch } from "../../../lib/api";
import { DEMO_SERVERS } from "../../../lib/demoData";

export default function ServersPage() {
  const { isDemo } = useDashboard();
  const [servers, setServers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);

  const fetchServers = async () => {
    setLoading(true);
    if (isDemo) {
      setServers(DEMO_SERVERS);
      setLoading(false);
    } else {
      const res = await apiFetch("/servers");
      if (res.success && res.data) {
        setServers(res.data);
      }
      setLoading(false);
    }
  };

  const handleDeleteServer = async (id: string) => {
    if (isDemo) {
      alert("Cannot delete simulated server in demo mode!");
      return;
    }

    if (!confirm("Are you sure you want to permanently delete this server and its agent credentials?")) {
      return;
    }

    const res = await apiFetch(`/servers/${id}`, { method: "DELETE" });
    if (res.success) {
      fetchServers();
    } else {
      alert(res.message || "Failed to delete server");
    }
  };

  useEffect(() => {
    fetchServers();
  }, [isDemo]);

  // Filter logic
  const filteredServers = servers.filter((srv) => {
    const matchesSearch =
      srv.name.toLowerCase().includes(search.toLowerCase()) ||
      srv.hostname.toLowerCase().includes(search.toLowerCase()) ||
      srv.ipAddress.includes(search);
    const matchesStatus = statusFilter === "" || srv.status.toUpperCase() === statusFilter.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-50">Infrastructure Inventory</h2>
          <p className="text-xs text-txt-secondary">
            Manage your connected node instances, monitor metrics health, and deploy agent pipelines.
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-black flex items-center justify-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Server
        </button>
      </div>

      {/* Alert Banner for Read-Only modes if VIEWER */}
      {isDemo && (
        <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-xl text-xs text-amber-300 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <div className="font-bold">Simulated Sandbox Active</div>
            <div>To create actual host connections, launch the local backend and toggle Demo Mode off.</div>
          </div>
        </div>
      )}

      {/* Filter and Search Panel */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted" />
          <input
            type="text"
            placeholder="Search hostname, IP, name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-card border border-border-subtle rounded-lg pl-9 pr-4 py-1.5 text-xs text-txt-primary placeholder:text-txt-muted focus:outline-none focus:border-cyan-500/60"
          />
        </div>

        <div className="relative w-full sm:max-w-xs flex items-center gap-2">
          <Filter className="w-4 h-4 text-txt-muted" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-card border border-border-subtle rounded-lg px-3 py-1.5 text-xs text-txt-primary focus:outline-none focus:border-cyan-500/60"
          >
            <option value="">All Statuses</option>
            <option value="ONLINE">ONLINE</option>
            <option value="WARNING">WARNING</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="OFFLINE">OFFLINE</option>
          </select>
        </div>

        <button
          onClick={fetchServers}
          className="p-1.5 rounded-lg bg-card border border-border-subtle text-txt-secondary hover:text-txt-primary transition-all self-stretch sm:self-auto flex items-center justify-center"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Table view */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-xs text-txt-muted gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" />
          Retrieving server lists...
        </div>
      ) : (
        <ServerTable servers={filteredServers} onDeleteServer={handleDeleteServer} />
      )}

      {/* Add Server Modal Wrapper */}
      <AddServerModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onSuccess={fetchServers} />
    </div>
  );
}
