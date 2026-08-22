"use client";

import React, { useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import { apiFetch } from "../lib/api";

interface CreateAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  servers?: { id: string; name: string }[];
  onSuccess?: () => void;
}

export const CreateAlertModal: React.FC<CreateAlertModalProps> = ({
  isOpen,
  onClose,
  servers = [],
  onSuccess,
}) => {
  const [name, setName] = useState("");
  const [serverId, setServerId] = useState("");
  const [metricType, setMetricType] = useState("CPU");
  const [operator, setOperator] = useState("GT");
  const [threshold, setThreshold] = useState("90");
  const [severity, setSeverity] = useState("CRITICAL");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await apiFetch("/alerts/rules", {
      method: "POST",
      body: JSON.stringify({
        name,
        serverId: serverId || null,
        metricType,
        operator,
        threshold: parseFloat(threshold),
        severity,
      }),
    });

    setLoading(false);
    if (res.success) {
      if (onSuccess) onSuccess();
      onClose();
    } else {
      setError(res.message || "Failed to create alert rule");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border-subtle rounded-2xl w-full max-w-md shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-txt-muted hover:text-txt-primary p-1 rounded-lg hover:bg-bg-main"
        >
          <X className="w-5 h-5" />
        </button>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-3 border-b border-border-subtle pb-3">
            <div className="p-2 rounded-lg bg-rose-950 text-rose-400 border border-rose-800/60">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-txt-primary">Create Alert Threshold Rule</h3>
              <p className="text-xs text-txt-muted">Trigger real-time incident alerts when telemetry crosses thresholds.</p>
            </div>
          </div>

          {error && <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">{error}</div>}

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-txt-secondary mb-1">Rule Name</label>
              <input
                type="text"
                required
                placeholder="e.g. High Production CPU Alert"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-bg-main border border-border-subtle rounded-lg px-3 py-2 text-txt-primary focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-txt-secondary mb-1">Apply To Server</label>
              <select
                value={serverId}
                onChange={(e) => setServerId(e.target.value)}
                className="w-full bg-bg-main border border-border-subtle rounded-lg px-3 py-2 text-txt-primary focus:outline-none focus:border-cyan-500"
              >
                <option value="">All Servers (Global Rule)</option>
                {servers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-txt-secondary mb-1">Metric Type</label>
                <select
                  value={metricType}
                  onChange={(e) => setMetricType(e.target.value)}
                  className="w-full bg-bg-main border border-border-subtle rounded-lg px-3 py-2 text-txt-primary focus:outline-none focus:border-cyan-500"
                >
                  <option value="CPU">CPU Usage (%)</option>
                  <option value="MEMORY">Memory Usage (%)</option>
                  <option value="DISK">Disk Usage (%)</option>
                  <option value="NETWORK">Network Throughput</option>
                  <option value="OFFLINE">Server Offline</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-txt-secondary mb-1">Operator</label>
                <select
                  value={operator}
                  onChange={(e) => setOperator(e.target.value)}
                  className="w-full bg-bg-main border border-border-subtle rounded-lg px-3 py-2 text-txt-primary focus:outline-none focus:border-cyan-500"
                >
                  <option value="GT">&gt; (Greater Than)</option>
                  <option value="GTE">&gt;= (Greater or Equal)</option>
                  <option value="LT">&lt; (Less Than)</option>
                  <option value="LTE">&lt;= (Less or Equal)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-txt-secondary mb-1">Threshold Value</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder="90"
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  className="w-full bg-bg-main border border-border-subtle rounded-lg px-3 py-2 text-txt-primary focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-txt-secondary mb-1">Severity Level</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full bg-bg-main border border-border-subtle rounded-lg px-3 py-2 text-txt-primary focus:outline-none focus:border-cyan-500"
                >
                  <option value="INFO">INFO</option>
                  <option value="WARNING">WARNING</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-txt-secondary hover:bg-bg-main"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-rose-500 hover:bg-rose-400 text-white transition-colors"
            >
              {loading ? "Creating Rule..." : "Save Alert Rule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
