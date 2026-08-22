"use client";

import React from "react";
import Link from "next/link";
import { Server, Activity, ArrowRight } from "lucide-react";
import { StatusBadge } from "./StatusBadge";

interface ServerTableProps {
  servers: any[];
  onDeleteServer?: (id: string) => void;
}

export const ServerTable: React.FC<ServerTableProps> = ({ servers, onDeleteServer }) => {
  return (
    <div className="bg-card border border-border-subtle rounded-xl overflow-hidden shadow-lg">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-bg-secondary text-txt-secondary border-b border-border-subtle font-semibold">
              <th className="px-5 py-3">Server Name</th>
              <th className="px-5 py-3">IP Address</th>
              <th className="px-5 py-3">OS Platform</th>
              <th className="px-5 py-3 text-center">Status</th>
              <th className="px-5 py-3">CPU Usage</th>
              <th className="px-5 py-3">RAM Usage</th>
              <th className="px-5 py-3">Disk Usage</th>
              <th className="px-5 py-3">Health Score</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {servers.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-5 py-8 text-center text-txt-muted font-medium">
                  No active infrastructure servers connected or configured. Click &quot;Add Server&quot; to begin.
                </td>
              </tr>
            ) : (
              servers.map((server) => {
                const latestMetric = server.latestMetric || {
                  cpuUsage: server.cpu || 0,
                  memoryUsage: server.ram || 0,
                  diskUsage: server.disk || 0,
                };

                const cpu = Math.round(latestMetric.cpuUsage);
                const ram = Math.round(latestMetric.memoryUsage);
                const disk = Math.round(latestMetric.diskUsage);

                return (
                  <tr key={server.id} className="hover:bg-bg-secondary/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded bg-bg-main border border-border-subtle text-cyan-400">
                          <Server className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <Link
                            href={`/servers/${server.id}`}
                            className="font-bold text-txt-primary hover:text-cyan-400 hover:underline flex items-center gap-1"
                          >
                            {server.name}
                          </Link>
                          <div className="text-[10px] text-txt-muted font-mono">{server.hostname}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono font-mono-val text-txt-secondary">{server.ipAddress}</td>
                    <td className="px-5 py-4 text-txt-secondary">{server.os}</td>
                    <td className="px-5 py-4 text-center">
                      <StatusBadge status={server.status} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-bg-main h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              cpu > 85 ? "bg-rose-400" : cpu > 60 ? "bg-amber-400" : "bg-cyan-400"
                            }`}
                            style={{ width: `${cpu}%` }}
                          />
                        </div>
                        <span className="font-mono font-mono-val font-medium text-txt-primary">{cpu}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-bg-main h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              ram > 85 ? "bg-rose-400" : ram > 60 ? "bg-amber-400" : "bg-cyan-400"
                            }`}
                            style={{ width: `${ram}%` }}
                          />
                        </div>
                        <span className="font-mono font-mono-val font-medium text-txt-primary">{ram}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-bg-main h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              disk > 85 ? "bg-rose-400" : disk > 60 ? "bg-amber-400" : "bg-cyan-400"
                            }`}
                            style={{ width: `${disk}%` }}
                          />
                        </div>
                        <span className="font-mono font-mono-val font-medium text-txt-primary">{disk}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono font-mono-val text-center font-bold text-slate-100">
                      <span
                        className={
                          server.healthScore >= 85
                            ? "text-emerald-400"
                            : server.healthScore >= 60
                            ? "text-amber-400"
                            : "text-rose-400"
                        }
                      >
                        {server.healthScore}%
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <Link
                          href={`/servers/${server.id}`}
                          className="p-1 rounded bg-bg-main border border-border-subtle text-txt-secondary hover:text-cyan-400 hover:border-cyan-500/40 transition-all flex items-center gap-1"
                        >
                          Metrics <ArrowRight className="w-3 h-3" />
                        </Link>
                        {onDeleteServer && (
                          <button
                            onClick={() => onDeleteServer(server.id)}
                            className="p-1 rounded bg-rose-950/40 border border-rose-900/60 text-rose-400 hover:bg-rose-900/80 transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
