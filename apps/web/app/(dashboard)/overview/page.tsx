"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Server, Activity, AlertTriangle, Cpu, HardDrive, CheckCircle2, RefreshCw } from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import { MetricCard } from "../../../components/MetricCard";
import { HealthScoreGauge } from "../../../components/HealthScoreGauge";
import { StatusBadge } from "../../../components/StatusBadge";
import { apiFetch } from "../../../lib/api";
import { DEMO_SERVERS, DEMO_ALERTS } from "../../../lib/demoData";

export default function OverviewPage() {
  const { isDemo } = useDashboard();
  const [stats, setStats] = useState<any>(null);
  const [servers, setServers] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOverviewData = async () => {
    setLoading(true);
    if (isDemo) {
      // Simulate demo stats
      setStats({
        totalServers: DEMO_SERVERS.length,
        onlineServers: DEMO_SERVERS.filter((s) => s.status === "ONLINE").length,
        warningServers: DEMO_SERVERS.filter((s) => s.status === "WARNING").length,
        criticalServers: DEMO_SERVERS.filter((s) => s.status === "CRITICAL").length,
        offlineServers: DEMO_SERVERS.filter((s) => s.status === "OFFLINE").length,
        criticalAlerts: DEMO_ALERTS.length,
        avgCpu: 48.2,
        avgMemory: 64.8,
        systemHealthScore: 84.5,
      });
      setServers(DEMO_SERVERS);
      setAlerts(DEMO_ALERTS);
      setLoading(false);
    } else {
      try {
        const statsRes = await apiFetch("/servers/overview");
        const listRes = await apiFetch("/servers");
        const alertsRes = await apiFetch("/alerts?status=ACTIVE");

        if (statsRes.success && statsRes.data) {
          setStats(statsRes.data);
        }
        if (listRes.success && listRes.data) {
          setServers(listRes.data);
        }
        if (alertsRes.success && alertsRes.data) {
          setAlerts(alertsRes.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchOverviewData();
    // In live mode, poll metrics or depend on websocket emissions
    const interval = setInterval(() => {
      if (isDemo) {
        // Deterministic oscillation
        setServers((prev) =>
          prev.map((srv) => {
            if (srv.status === "OFFLINE") return srv;
            const drift = Math.random() > 0.5 ? 1.5 : -1.5;
            return {
              ...srv,
              cpu: Math.max(10, Math.min(98, Math.round((srv.cpu + drift) * 10) / 10)),
              ram: Math.max(20, Math.min(95, Math.round((srv.ram + drift * 0.4) * 10) / 10)),
            };
          })
        );
      } else {
        fetchOverviewData();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isDemo]);

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-xs text-txt-muted gap-2">
        <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" />
        Synchronizing system telemetry...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Head */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-50">Infrastructure Overview</h2>
          <p className="text-xs text-txt-secondary">
            {isDemo
              ? "Running in Simulated Sandbox Mode. Switch to live python telemetry from topbar."
              : "Live monitoring active. Evaluating cluster state at 5s interval."}
          </p>
        </div>
        <button
          onClick={fetchOverviewData}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-secondary border border-border-subtle hover:border-cyan-500/40 text-xs text-txt-secondary hover:text-txt-primary transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Overview Statistics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Host Servers"
          value={stats?.totalServers || 0}
          icon={Server}
          subtext={`${stats?.onlineServers || 0} nodes streaming, ${stats?.offlineServers || 0} offline`}
        />
        <MetricCard
          title="Cluster CPU Average"
          value={`${stats?.avgCpu || 0}%`}
          icon={Cpu}
          subtext="Total load average across host cores"
          trend={{ value: "+2.4% vs last hour", isPositive: false }}
        />
        <MetricCard
          title="Cluster Memory Average"
          value={`${stats?.avgMemory || 0}%`}
          icon={HardDrive}
          subtext="RAM allocation utilization rate"
          trend={{ value: "-1.8% vs last hour", isPositive: true }}
        />
        <MetricCard
          title="Active Alerts"
          value={stats?.criticalAlerts || 0}
          icon={AlertTriangle}
          subtext="Requiring immediate validation response"
          accentColor={stats?.criticalAlerts > 0 ? "border-rose-500/40" : "border-cyan-500/30"}
        />
      </div>

      {/* Health Gauge & Recent Incidents Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-card border border-border-subtle rounded-xl p-5 shadow-lg flex flex-col items-center justify-center">
          <HealthScoreGauge score={stats?.systemHealthScore || 100} />
        </div>

        <div className="lg:col-span-2 bg-card border border-border-subtle rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-border-subtle/80 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-txt-primary">Recent Alert Logs</span>
              <Link href="/alerts" className="text-[10px] text-cyan-400 hover:underline">
                Alert configurations &rarr;
              </Link>
            </div>
            <div className="mt-3.5 space-y-2.5 max-h-48 overflow-y-auto">
              {alerts.length === 0 ? (
                <div className="text-center text-txt-muted text-xs py-6 flex flex-col items-center gap-1">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  No critical incidents detected in cluster.
                </div>
              ) : (
                alerts.slice(0, 4).map((alt) => (
                  <div
                    key={alt.id}
                    className="p-3 bg-bg-secondary border border-border-subtle rounded-lg flex items-start gap-3"
                  >
                    <AlertTriangle
                      className={`w-4 h-4 shrink-0 mt-0.5 ${alt.severity === "CRITICAL" ? "text-rose-400" : "text-amber-400"}`}
                    />
                    <div className="flex-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-txt-primary">{alt.serverName || alt.server?.name}</span>
                        <span className="text-[10px] text-txt-muted">{alt.triggeredAt}</span>
                      </div>
                      <p className="text-txt-secondary text-[11px] mt-1">{alt.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Nodes / Servers List Preview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-txt-secondary">Connected Hosts</span>
          <Link href="/servers" className="text-xs font-semibold text-cyan-400 hover:underline">
            View Server details &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {servers.map((srv) => {
            const cpu = Math.round(srv.cpu || srv.latestMetric?.cpuUsage || 0);
            const ram = Math.round(srv.ram || srv.latestMetric?.memoryUsage || 0);
            const disk = Math.round(srv.disk || srv.latestMetric?.diskUsage || 0);

            return (
              <div
                key={srv.id}
                className="bg-card border border-border-subtle rounded-xl p-5 hover:border-cyan-500/30 transition-all shadow-md flex flex-col justify-between"
              >
                <div className="flex items-center justify-between border-b border-border-subtle pb-3 mb-4">
                  <div>
                    <Link href={`/servers/${srv.id}`} className="font-bold text-txt-primary hover:underline">
                      {srv.name}
                    </Link>
                    <div className="text-[10px] text-txt-muted font-mono">{srv.hostname}</div>
                  </div>
                  <StatusBadge status={srv.status} />
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] text-txt-secondary mb-1">
                      <span>CPU Load</span>
                      <span className="font-mono">{cpu}%</span>
                    </div>
                    <div className="w-full bg-bg-main h-1 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${cpu > 85 ? "bg-rose-400" : cpu > 60 ? "bg-amber-400" : "bg-cyan-400"}`}
                        style={{ width: `${cpu}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-txt-secondary mb-1">
                      <span>Memory Allocation</span>
                      <span className="font-mono">{ram}%</span>
                    </div>
                    <div className="w-full bg-bg-main h-1 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${ram > 85 ? "bg-rose-400" : ram > 60 ? "bg-amber-400" : "bg-cyan-400"}`}
                        style={{ width: `${ram}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-txt-secondary mb-1">
                      <span>Disk Allocation</span>
                      <span className="font-mono">{disk}%</span>
                    </div>
                    <div className="w-full bg-bg-main h-1 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${disk > 85 ? "bg-rose-400" : disk > 60 ? "bg-amber-400" : "bg-cyan-400"}`}
                        style={{ width: `${disk}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3.5 border-t border-border-subtle flex items-center justify-between text-[10px] text-txt-muted">
                  <span>OS: {srv.os}</span>
                  <span>Health: {srv.healthScore}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
