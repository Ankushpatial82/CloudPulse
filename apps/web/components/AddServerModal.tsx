"use client";

import React, { useState } from "react";
import { X, Copy, Check, Terminal, Server } from "lucide-react";
import { apiFetch } from "../lib/api";

interface AddServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AddServerModal: React.FC<AddServerModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState("");
  const [hostname, setHostname] = useState("");
  const [ipAddress, setIpAddress] = useState("");
  const [os, setOs] = useState("Ubuntu 24.04 LTS");

  const [createdAgentToken, setCreatedAgentToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await apiFetch("/servers", {
      method: "POST",
      body: JSON.stringify({
        name,
        hostname,
        ipAddress,
        os,
        cpuCores: 4,
        totalMemoryMb: 8192,
        totalDiskGb: 100,
      }),
    });

    setLoading(false);
    if (res.success && res.data) {
      setCreatedAgentToken(res.data.agentToken || "cp_agent_token_demo_123");
      if (onSuccess) onSuccess();
    } else {
      setError(res.message || "Failed to register server");
    }
  };

  const apiBase = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5002";
  const commandSnippet = `# Copy agent script from your CloudPulse installation
cd agent/
pip install -r requirements.txt
export API_URL="${apiBase}"
export AGENT_TOKEN="${createdAgentToken || "cp_agent_YOUR_TOKEN"}"
python agent.py`;

  const copyCommand = () => {
    navigator.clipboard.writeText(commandSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border-subtle rounded-2xl w-full max-w-lg shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-txt-muted hover:text-txt-primary p-1 rounded-lg hover:bg-bg-main"
        >
          <X className="w-5 h-5" />
        </button>

        {!createdAgentToken ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-3 border-b border-border-subtle pb-3">
              <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-txt-primary">Add New Infrastructure Server</h3>
                <p className="text-xs text-txt-muted">Register a server to generate its unique monitoring agent key.</p>
              </div>
            </div>

            {error && <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">{error}</div>}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-txt-secondary mb-1">Server Friendly Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. us-east-web-node-01"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-bg-main border border-border-subtle rounded-lg px-3 py-2 text-txt-primary focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-txt-secondary mb-1">Hostname / FQDN</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. node-01.us-east.cloudpulse.net"
                  value={hostname}
                  onChange={(e) => setHostname(e.target.value)}
                  className="w-full bg-bg-main border border-border-subtle rounded-lg px-3 py-2 text-txt-primary focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-txt-secondary mb-1">IP Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 192.168.1.50"
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                  className="w-full bg-bg-main border border-border-subtle rounded-lg px-3 py-2 text-txt-primary focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-txt-secondary mb-1">Operating System</label>
                <select
                  value={os}
                  onChange={(e) => setOs(e.target.value)}
                  className="w-full bg-bg-main border border-border-subtle rounded-lg px-3 py-2 text-txt-primary focus:outline-none focus:border-cyan-500"
                >
                  <option value="Ubuntu 24.04 LTS">Ubuntu 24.04 LTS</option>
                  <option value="Debian 12 Bookworm">Debian 12 Bookworm</option>
                  <option value="RHEL 9 / CentOS">RHEL 9 / CentOS</option>
                  <option value="Alpine Linux 3.19">Alpine Linux 3.19</option>
                  <option value="macOS Sonoma">macOS Sonoma</option>
                </select>
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
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-black transition-colors"
              >
                {loading ? "Registering..." : "Register Server & Get Agent Key"}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-border-subtle pb-3">
              <div className="p-2 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-txt-primary">Server Registered Successfully!</h3>
                <p className="text-xs text-txt-muted">Execute the setup commands below on your host machine to start telemetry stream.</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-txt-secondary">
                <span>Agent Token Key:</span>
                <span className="font-mono text-cyan-400">{createdAgentToken}</span>
              </div>

              <div className="relative">
                <pre className="bg-bg-main border border-border-subtle rounded-xl p-4 text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed">
                  {commandSnippet}
                </pre>
                <button
                  onClick={copyCommand}
                  className="absolute top-3 right-3 p-1.5 rounded-lg bg-card border border-border-subtle text-txt-secondary hover:text-cyan-400 transition-colors"
                  title="Copy installation commands"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-border-subtle">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-black"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
