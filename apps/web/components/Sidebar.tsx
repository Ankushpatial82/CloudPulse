"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Server,
  AlertTriangle,
  Cpu,
  Terminal,
  FileSpreadsheet,
  History,
  Settings,
  ChevronRight,
} from "lucide-react";

const NAV_ITEMS = [
  { name: "Overview", href: "/overview", icon: LayoutDashboard },
  { name: "Servers", href: "/servers", icon: Server },
  { name: "Alerts", href: "/alerts", icon: AlertTriangle, badge: "Live" },
  { name: "Agents", href: "/agents", icon: Terminal },
  { name: "Processes", href: "/processes", icon: Cpu },
  { name: "Reports", href: "/reports", icon: FileSpreadsheet },
  { name: "Activity Log", href: "/activity", icon: History },
  { name: "Settings", href: "/settings", icon: Settings },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-bg-secondary border-r border-border-subtle shrink-0 hidden md:flex flex-col justify-between p-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[10px] uppercase font-bold tracking-widest text-txt-muted">
          Observability
        </div>
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/overview" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all group ${
                  isActive
                    ? "bg-card text-cyan-400 border border-cyan-500/40 shadow-sm"
                    : "text-txt-secondary hover:text-txt-primary hover:bg-bg-main"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? "text-cyan-400" : "text-txt-muted group-hover:text-cyan-400"
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  {item.badge && (
                    <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-rose-950 text-rose-400 border border-rose-800/60 font-mono">
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* System Status Mini Widget */}
      <div className="p-3.5 rounded-xl bg-card border border-border-subtle text-xs space-y-2">
        <div className="flex items-center justify-between text-[11px] font-semibold text-txt-secondary">
          <span>Infrastructure Engine</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-online" />
            Operational
          </span>
        </div>
        <div className="w-full bg-bg-main h-1.5 rounded-full overflow-hidden">
          <div className="bg-cyan-500 h-full w-[94%]" />
        </div>
        <div className="flex justify-between text-[10px] text-txt-muted">
          <span>Retention: 30 Days</span>
          <span>Latency: 4ms</span>
        </div>
      </div>
    </aside>
  );
};
