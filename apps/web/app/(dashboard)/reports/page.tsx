"use client";

import React, { useState } from "react";
import { FileSpreadsheet, Download, FileText, CheckCircle2, RefreshCw, BarChart2 } from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import { apiFetch } from "../../../lib/api";

const REPORT_TYPES = [
  { id: "health", name: "Cluster Health Report", desc: "Aggregate health scores and offline nodes" },
  { id: "cpu", name: "CPU Load Utilization", desc: "Average and peak processor calculations" },
  { id: "memory", name: "RAM & Swap Consumption", desc: "Average virtual memory allocation stats" },
  { id: "disk", name: "Storage Disk Utilization", desc: "Directory usage and storage allocation maps" },
  { id: "alert", name: "Incident Response Summary", desc: "Triggered alert counts and resolutions" },
];

export default function ReportsPage() {
  const { isDemo } = useDashboard();
  const [type, setType] = useState("health");
  const [timeframe, setTimeframe] = useState("7d");
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any[] | null>(null);

  const generateReportPreview = async () => {
    setLoading(true);
    if (isDemo) {
      // Return mock report preview
      setTimeout(() => {
        setPreviewData([
          { server: "us-east-prod-01", metric: "CPU Utilization", avg: "34.2%", max: "68.5%", alerts: 0, health: "96%" },
          { server: "eu-west-db-cluster-02", metric: "CPU Utilization", avg: "82.5%", max: "94.1%", alerts: 1, health: "78%" },
          { server: "us-west-api-gateway-03", metric: "CPU Utilization", avg: "94.8%", max: "99.2%", alerts: 3, health: "42%" },
        ]);
        setLoading(false);
      }, 500);
    } else {
      const res = await apiFetch(`/reports?type=${type}&timeframe=${timeframe}&format=json`);
      if (res.success && res.data) {
        setPreviewData(res.data);
      }
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (isDemo) {
      alert("CSV Export is emulated. Launch local API server to download real CSV data streams.");
      return;
    }
    const token = localStorage.getItem("cp_auth_token") || "";
    const url = `http://localhost:5001/api/reports?type=${type}&timeframe=${timeframe}&format=csv`;

    // Download CSV
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `cloudpulse-report-${type}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-50">Analytical Report Builder</h2>
        <p className="text-xs text-txt-secondary">
          Compile host monitoring logs, metrics graphs, and export CSV compliance logs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report configuration panel */}
        <div className="bg-card border border-border-subtle rounded-xl p-5 shadow-lg space-y-4 h-fit">
          <div className="flex items-center gap-3 border-b border-border-subtle pb-3">
            <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800/60">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-txt-primary font-bold">Report Configuration</h3>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-txt-secondary mb-1">Select Metrics Area</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-bg-main border border-border-subtle rounded-lg px-3 py-2 text-txt-primary focus:outline-none focus:border-cyan-500"
              >
                {REPORT_TYPES.map((rt) => (
                  <option key={rt.id} value={rt.id}>
                    {rt.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-txt-secondary mb-1">Select Timeframe Range</label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="w-full bg-bg-main border border-border-subtle rounded-lg px-3 py-2 text-txt-primary focus:outline-none focus:border-cyan-500"
              >
                <option value="today">Today (Last 24 Hours)</option>
                <option value="7d">7 Days (Weekly rollups)</option>
                <option value="30d">30 Days (Monthly compliance)</option>
              </select>
            </div>

            <button
              onClick={generateReportPreview}
              className="w-full py-2 rounded-lg font-bold bg-cyan-500 hover:bg-cyan-400 text-black flex items-center justify-center gap-1.5 transition-colors"
            >
              Generate Report Layout
            </button>
          </div>
        </div>

        {/* Report Preview Panel */}
        <div className="lg:col-span-2 bg-card border border-border-subtle rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-border-subtle/80 pb-3 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-txt-primary">Report Compilation Output</span>
              {previewData && (
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400 hover:text-cyan-300 text-xs font-bold"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export CSV
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-xs text-txt-muted gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" />
                Compiling database parameters...
              </div>
            ) : !previewData ? (
              <div className="flex flex-col items-center justify-center py-16 text-xs text-txt-muted text-center max-w-sm mx-auto gap-2">
                <BarChart2 className="w-8 h-8 text-txt-muted" />
                Configure metrics area and timeframe to generate full cluster monitoring summaries.
              </div>
            ) : (
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-bg-secondary text-txt-secondary border-b border-border-subtle font-semibold">
                      <th className="px-4 py-2">Host Node</th>
                      <th className="px-4 py-2">Metrics Area</th>
                      <th className="px-4 py-2">Avg Utilization</th>
                      <th className="px-4 py-2">Peak Limit</th>
                      <th className="px-4 py-2">Alerts Count</th>
                      <th className="px-4 py-2 text-right">Health Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {previewData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-bg-secondary/30 transition-colors">
                        <td className="px-4 py-3 font-bold text-txt-primary">{row.server || row.serverName}</td>
                        <td className="px-4 py-3 text-txt-secondary">{row.metric || type.toUpperCase()}</td>
                        <td className="px-4 py-3 font-mono font-mono-val">{row.avg || `${row.avgCpuUsage}%`}</td>
                        <td className="px-4 py-3 font-mono font-mono-val">{row.max || `${row.maxCpuUsage}%`}</td>
                        <td className="px-4 py-3 font-mono font-mono-val">{row.alerts ?? row.alertCount}</td>
                        <td className="px-4 py-3 text-right font-mono font-mono-val font-bold text-cyan-400">{row.health || `${row.healthScore}%`}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
