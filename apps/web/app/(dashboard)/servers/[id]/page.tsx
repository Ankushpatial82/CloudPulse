"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Server,
  Activity,
  ArrowLeft,
  Cpu,
  HardDrive,
  Network,
  Clock,
  RefreshCw,
  Terminal,
  AlertTriangle,
} from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import { StatusBadge } from "../../../../components/StatusBadge";
import { MetricCard } from "../../../../components/MetricCard";
import { MetricChart } from "../../../../components/MetricChart";
import { ProcessTable } from "../../../../components/ProcessTable";
import { apiFetch } from "../../../../lib/api";
import { getSocket } from "../../../../lib/socket";
import {
  DEMO_SERVERS,
  DEMO_PROCESSES,
  generateHistoricalMetricsData,
} from "../../../../lib/demoData";
import { SOCKET_EVENTS } from "@cloudpulse/shared";

export default function ServerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { isDemo } = useDashboard();
  const serverId = params.id as string;

  const [server, setServer] = useState<any>(null);
  const [metricsHistory, setMetricsHistory] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState("1h");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"charts" | "processes" | "setup">("charts");

  const fetchServerDetails = async () => {
    setLoading(true);
    if (isDemo) {
      const match = DEMO_SERVERS.find((s) => s.id === serverId) || DEMO_SERVERS[0];
      setServer(match);
      setMetricsHistory(generateHistoricalMetricsData(24));
      setLoading(false);
    } else {
      const detailRes = await apiFetch(`/servers/${serverId}`);
      const historyRes = await apiFetch(`/metrics/server/${serverId}?range=${timeRange}`);

      if (detailRes.success && detailRes.data) {
        setServer(detailRes.data);
      }
      if (historyRes.success && historyRes.data) {
        // Format dates
        const formatted = historyRes.data.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }));
        setMetricsHistory(formatted);
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServerDetails();
  }, [serverId, timeRange, isDemo]);

  // Real-time updates subscription over Socket.IO (Section 5, 33)
  useEffect(() => {
    if (isDemo) {
      const interval = setInterval(() => {
        setServer((prev: any) => {
          if (!prev) return prev;
          const drift = Math.random() > 0.5 ? 2 : -2;
          const newCpu = Math.max(5, Math.min(99, prev.cpu + drift));
          const newRam = Math.max(10, Math.min(99, prev.ram + drift * 0.5));
          return {
            ...prev,
            cpu: Math.round(newCpu * 10) / 10,
            ram: Math.round(newRam * 10) / 10,
          };
        });

        // Add real-time point to chart
        setMetricsHistory((prevChart) => {
          const nextChart = [...prevChart.slice(1)];
          const t = new Date();
          const nextPoint = {
            timestamp: t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
            cpuUsage: Math.round((45 + Math.sin(Date.now() / 10000) * 20) * 10) / 10,
            memoryUsage: Math.round((60 + Math.cos(Date.now() / 15000) * 10) * 10) / 10,
            diskUsage: prevChart[prevChart.length - 1]?.diskUsage || 50,
            networkUploadKbps: Math.round(Math.random() * 80 + 10),
            networkDownloadKbps: Math.round(Math.random() * 200 + 50),
            loadAvg1: parseFloat((0.8 + Math.random() * 0.4).toFixed(2)),
          };
          return [...nextChart, nextPoint];
        });
      }, 5000);

      return () => clearInterval(interval);
    } else {
      // Connect real-time socket listeners
      const socket = getSocket();
      socket.emit(SOCKET_EVENTS.SUBSCRIBE_SERVER, serverId);

      socket.on(SOCKET_EVENTS.SERVER_METRICS, (data: any) => {
        if (data.serverId === serverId) {
          setServer((prev: any) =>
            prev
              ? {
                  ...prev,
                  status: data.serverStatus,
                  healthScore: data.healthScore,
                  cpu: data.cpuUsage,
                  ram: data.memoryUsage,
                  disk: data.diskUsage,
                }
              : prev
          );

          // Append live telemetry point
          setMetricsHistory((prev) => {
            const timeStr = new Date(data.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            });
            const nextPoint = {
              timestamp: timeStr,
              cpuUsage: data.cpuUsage,
              memoryUsage: data.memoryUsage,
              diskUsage: data.diskUsage,
              networkUploadKbps: data.networkUploadKbps,
              networkDownloadKbps: data.networkDownloadKbps,
              loadAvg1: data.loadAvg1,
            };
            return [...prev.slice(1), nextPoint];
          });
        }
      });

      return () => {
        socket.emit(SOCKET_EVENTS.UNSUBSCRIBE_SERVER, serverId);
        socket.off(SOCKET_EVENTS.SERVER_METRICS);
      };
    }
  }, [serverId, isDemo]);

  if (loading && !server) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-xs text-txt-muted gap-2">
        <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" />
        Loading node telemetry stream...
      </div>
    );
  }

  const currentCpu = server?.cpu || server?.latestMetric?.cpuUsage || 0;
  const currentRam = server?.ram || server?.latestMetric?.memoryUsage || 0;
  const currentDisk = server?.disk || server?.latestMetric?.diskUsage || 50;

  // Filter server-specific processes
  const filteredProcesses = DEMO_PROCESSES.filter((p) => p.server === server?.name || !p.server);

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/servers")}
          className="p-1.5 rounded-lg bg-bg-secondary border border-border-subtle hover:border-cyan-500/40 text-txt-secondary hover:text-txt-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <span className="text-[10px] text-txt-muted uppercase font-bold tracking-wider">Host Node Manager</span>
          <h2 className="text-lg font-bold text-slate-50 flex items-center gap-2">
            {server?.name}
            <StatusBadge status={server?.status || "ONLINE"} />
          </h2>
        </div>
      </div>

      {/* Host details header info card */}
      <div className="bg-card border border-border-subtle rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-xs">
          <div>
            <div className="text-txt-muted">Hostname FQDN</div>
            <div className="font-bold font-mono text-txt-primary mt-1">{server?.hostname}</div>
          </div>
          <div>
            <div className="text-txt-muted">IP Address</div>
            <div className="font-bold font-mono text-txt-primary mt-1">{server?.ipAddress}</div>
          </div>
          <div>
            <div className="text-txt-muted">OS Version</div>
            <div className="font-bold text-txt-primary mt-1">{server?.os}</div>
          </div>
          <div>
            <div className="text-txt-muted">Uptime</div>
            <div className="font-bold text-txt-primary mt-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              {server?.uptime || "14d 08h 22m"}
            </div>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-txt-muted block uppercase">Overall Health</span>
          <span className="text-2xl font-black text-cyan-400 font-mono-val">{server?.healthScore || 100}%</span>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="CPU Load" value={`${currentCpu}%`} icon={Cpu} subtext="Central core usage metrics" />
        <MetricCard title="RAM Allocation" value={`${currentRam}%`} icon={HardDrive} subtext="Host memory swap space" />
        <MetricCard title="Disk Storage" value={`${currentDisk}%`} icon={Server} subtext="Root partition allocation" />
        <MetricCard
          title="Network Bandwidth"
          value={`↓ ${(server?.netDown || 4.2).toFixed(1)} MB/s`}
          icon={Network}
          subtext={`↑ ${(server?.netUp || 1.8).toFixed(1)} MB/s throughput`}
        />
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-border-subtle">
        <button
          onClick={() => setActiveTab("charts")}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === "charts"
              ? "border-cyan-500 text-cyan-400"
              : "border-transparent text-txt-secondary hover:text-txt-primary"
          }`}
        >
          Performance Charts
        </button>
        <button
          onClick={() => setActiveTab("processes")}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === "processes"
              ? "border-cyan-500 text-cyan-400"
              : "border-transparent text-txt-secondary hover:text-txt-primary"
          }`}
        >
          Process Observer
        </button>
        <button
          onClick={() => setActiveTab("setup")}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === "setup"
              ? "border-cyan-500 text-cyan-400"
              : "border-transparent text-txt-secondary hover:text-txt-primary"
          }`}
        >
          Agent Integration
        </button>
      </div>

      {/* Active Tab rendering */}
      {activeTab === "charts" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MetricChart
            title="CPU Usage Trend"
            type="line"
            data={metricsHistory}
            dataKeys={[{ key: "cpuUsage", name: "CPU Utilization", color: "#22D3EE" }]}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />
          <MetricChart
            title="Memory Usage Trend"
            type="area"
            data={metricsHistory}
            dataKeys={[{ key: "memoryUsage", name: "RAM Utilization", color: "#34D399" }]}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />
          <MetricChart
            title="Network Throughput Trend"
            type="line"
            data={metricsHistory}
            dataKeys={[
              { key: "networkDownloadKbps", name: "Download (Kbps)", color: "#22D3EE" },
              { key: "networkUploadKbps", name: "Upload (Kbps)", color: "#FBBF24" },
            ]}
            yUnit=" Kb"
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />
          <MetricChart
            title="Load Average (1m)"
            type="line"
            data={metricsHistory}
            dataKeys={[{ key: "loadAvg1", name: "System Load Avg", color: "#F87171" }]}
            yUnit=""
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />
        </div>
      )}

      {activeTab === "processes" && <ProcessTable processes={filteredProcesses} />}

      {activeTab === "setup" && (
        <div className="bg-card border border-border-subtle rounded-xl p-6 space-y-4 max-w-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-cyan-950 text-cyan-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-txt-primary">Host Agent Instructions</h3>
              <p className="text-xs text-txt-muted">Deploy this daemon to start streaming telemetry parameters.</p>
            </div>
          </div>
          <div className="space-y-2">
            <span className="text-xs text-txt-secondary block">Copy setting config environments:</span>
            <pre className="bg-bg-main border border-border-subtle rounded-xl p-4 text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed">
              {`git clone https://github.com/cloudpulse/cloudpulse-agent.git
cd cloudpulse-agent
pip install -r requirements.txt
export API_URL="http://localhost:5001"
export AGENT_TOKEN="${server?.agentToken || "your-agent-token"}"
python agent.py`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
