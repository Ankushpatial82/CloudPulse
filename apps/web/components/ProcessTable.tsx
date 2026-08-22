"use client";

import React, { useState } from "react";
import { ArrowUpDown, Cpu, Shield } from "lucide-react";

interface Process {
  pid: number;
  name: string;
  cpuPercent: number;
  memoryPercent: number;
  status: string;
  username: string;
  server?: string;
}

interface ProcessTableProps {
  processes: Process[];
}

type SortField = "pid" | "name" | "cpuPercent" | "memoryPercent";

export const ProcessTable: React.FC<ProcessTableProps> = ({ processes }) => {
  const [sortField, setSortField] = useState<SortField>("cpuPercent");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const sortedProcesses = [...processes].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (typeof aVal === "string") {
      aVal = aVal.toLowerCase();
      bVal = (bVal as string).toLowerCase();
    }

    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <div className="bg-card border border-border-subtle rounded-xl overflow-hidden shadow-lg">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-bg-secondary text-txt-secondary border-b border-border-subtle font-semibold">
              <th className="px-5 py-3 cursor-pointer select-none hover:text-cyan-400" onClick={() => handleSort("pid")}>
                <div className="flex items-center gap-1.5">
                  PID <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th className="px-5 py-3 cursor-pointer select-none hover:text-cyan-400" onClick={() => handleSort("name")}>
                <div className="flex items-center gap-1.5">
                  Process Name <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              {processes[0]?.server && <th className="px-5 py-3">Server</th>}
              <th
                className="px-5 py-3 cursor-pointer select-none hover:text-cyan-400"
                onClick={() => handleSort("cpuPercent")}
              >
                <div className="flex items-center gap-1.5">
                  CPU Usage <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th
                className="px-5 py-3 cursor-pointer select-none hover:text-cyan-400"
                onClick={() => handleSort("memoryPercent")}
              >
                <div className="flex items-center gap-1.5">
                  Memory Usage <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th className="px-5 py-3">User</th>
              <th className="px-5 py-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {sortedProcesses.map((proc, idx) => (
              <tr key={`${proc.pid}-${idx}`} className="hover:bg-bg-secondary/40 transition-colors">
                <td className="px-5 py-3 font-mono font-mono-val text-cyan-400">{proc.pid}</td>
                <td className="px-5 py-3 font-medium text-txt-primary font-mono">{proc.name}</td>
                {proc.server && <td className="px-5 py-3 font-mono text-txt-secondary">{proc.server}</td>}
                <td className="px-5 py-3">
                  <div className="flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="font-mono font-mono-val font-semibold text-txt-primary">{proc.cpuPercent}%</span>
                  </div>
                </td>
                <td className="px-5 py-3 font-mono font-mono-val text-txt-secondary">{proc.memoryPercent}%</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-1">
                    <Shield className="w-3 h-3 text-txt-muted" />
                    <span className="font-mono text-txt-secondary">{proc.username}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-right">
                  <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 font-mono text-[10px]">
                    {proc.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
