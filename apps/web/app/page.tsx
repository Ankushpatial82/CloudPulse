"use client";

import React from "react";
import Link from "next/link";
import {
  Activity,
  Cpu,
  Layers,
  Zap,
  BellRing,
  LineChart,
  ShieldCheck,
  Terminal,
  Database,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-main text-txt-primary flex flex-col justify-between selection:bg-cyan-500 selection:text-black">
      {/* Header */}
      <header className="h-20 max-w-7xl mx-auto w-full px-6 flex items-center justify-between border-b border-border-subtle/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Activity className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-wide text-txt-primary">CloudPulse</span>
            <div className="text-[10px] text-txt-muted uppercase tracking-wider font-semibold">
              Real-Time Visibility
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-xs font-semibold text-txt-secondary hover:text-txt-primary transition-colors">
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-black transition-colors"
          >
            Start Monitoring
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="max-w-7xl mx-auto px-6 pt-16 pb-20 text-center relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/50 border border-cyan-800/60 text-cyan-400 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Introducing CloudPulse Observability 2.0</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight text-slate-50">
            Real-Time Infrastructure <span className="text-cyan-400">Monitoring</span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-txt-secondary max-w-2xl mx-auto leading-relaxed">
            Monitor every server. Understand every metric. Respond before incidents become outages. Get full host telemetry in seconds.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-bold bg-cyan-500 hover:bg-cyan-400 text-black flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-cyan-500/25"
            >
              Start Monitoring Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login?demo=true"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-bold bg-bg-secondary border border-border-subtle hover:border-cyan-500/40 text-txt-primary flex items-center justify-center gap-2 transition-all"
            >
              View Sandbox Demo
            </Link>
          </div>

          {/* Interactive Mock Observability Dashboard */}
          <div className="mt-16 max-w-5xl mx-auto bg-card border border-border-subtle rounded-2xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-border-subtle/80 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs font-mono text-txt-muted ml-3">/dashboard/overview</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-txt-muted">
                <span className="px-2 py-0.5 rounded bg-bg-main border border-border-subtle">LIVE STREAMING</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
            </div>

            {/* Mock Dashboard Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-bg-main border border-border-subtle rounded-xl p-4 text-left">
                <div className="text-[10px] uppercase font-bold text-txt-secondary">TOTAL SERVERS</div>
                <div className="text-2xl font-bold text-cyan-400 mt-1 font-mono">12 Active</div>
                <div className="text-[10px] text-emerald-400 mt-2">100% operational status</div>
              </div>
              <div className="bg-bg-main border border-border-subtle rounded-xl p-4 text-left">
                <div className="text-[10px] uppercase font-bold text-txt-secondary">AVERAGE CPU</div>
                <div className="text-2xl font-bold text-txt-primary mt-1 font-mono">34.2%</div>
                <div className="text-[10px] text-txt-muted mt-2">Across all nodes</div>
              </div>
              <div className="bg-bg-main border border-border-subtle rounded-xl p-4 text-left">
                <div className="text-[10px] uppercase font-bold text-txt-secondary">CRITICAL ALERTS</div>
                <div className="text-2xl font-bold text-rose-400 mt-1 font-mono">0 Active</div>
                <div className="text-[10px] text-txt-muted mt-2">Evaluated every 5s</div>
              </div>
            </div>

            {/* Mock Charts */}
            <div className="mt-6 bg-bg-main border border-border-subtle rounded-xl p-4 text-left h-48 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-txt-secondary">
                <span>CPU Cluster Utilization</span>
                <span className="text-[10px] text-cyan-400 font-mono">LIVE (Recharts)</span>
              </div>
              {/* Graphic Mock Chart representation */}
              <div className="flex items-end gap-1.5 h-28 pt-2">
                {[34, 45, 60, 42, 38, 55, 78, 62, 45, 38, 50, 68, 72, 58, 42, 35, 48, 52, 60, 64, 48, 38, 42].map((val, idx) => (
                  <div key={idx} className="flex-1 bg-gradient-to-t from-cyan-950 to-cyan-500 rounded-t" style={{ height: `${val}%` }} />
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Features Grid */}
      <section className="bg-bg-secondary border-y border-border-subtle/60 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-50">SaaS Capabilities</h2>
            <p className="mt-3 text-sm text-txt-secondary">
              CloudPulse delivers enterprise host-level telemetry with sub-second resolution and zero bloat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card border border-border-subtle rounded-xl p-6 hover:border-cyan-500/30 transition-all">
              <div className="w-10 h-10 rounded-lg bg-cyan-950 text-cyan-400 flex items-center justify-center mb-4 border border-cyan-800/40">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-100">Sub-second Streaming</h3>
              <p className="mt-2 text-xs leading-relaxed text-txt-secondary">
                Python agent periodically collects and streams host CPU, Memory, Disk, Swap and Load telemetry every 5s over persistent HTTP/WebSocket.
              </p>
            </div>
            <div className="bg-card border border-border-subtle rounded-xl p-6 hover:border-cyan-500/30 transition-all">
              <div className="w-10 h-10 rounded-lg bg-rose-950 text-rose-400 flex items-center justify-center mb-4 border border-rose-800/40">
                <BellRing className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-100">Intelligent Alerting</h3>
              <p className="mt-2 text-xs leading-relaxed text-txt-secondary">
                Define customized threshold parameters for infrastructure alerts. Get instant notifications inside your workspace when values exceed targets.
              </p>
            </div>
            <div className="bg-card border border-border-subtle rounded-xl p-6 hover:border-cyan-500/30 transition-all">
              <div className="w-10 h-10 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-800/40">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-100">Role-Based Access</h3>
              <p className="mt-2 text-xs leading-relaxed text-txt-secondary">
                Secure multi-tenant roles (ADMIN, USER, VIEWER) limit configuration powers, guaranteeing infrastructure layout safety.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack section */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-100 mb-10">Production Ready Technology Stack</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto text-xs font-mono font-semibold">
          <div className="p-4 bg-card border border-border-subtle rounded-xl flex flex-col items-center gap-2">
            <Layers className="w-6 h-6 text-cyan-400" />
            <span>Next.js 14 App Router</span>
          </div>
          <div className="p-4 bg-card border border-border-subtle rounded-xl flex flex-col items-center gap-2">
            <Database className="w-6 h-6 text-emerald-400" />
            <span>PostgreSQL & Prisma</span>
          </div>
          <div className="p-4 bg-card border border-border-subtle rounded-xl flex flex-col items-center gap-2">
            <Cpu className="w-6 h-6 text-amber-400" />
            <span>Express.js & Redis</span>
          </div>
          <div className="p-4 bg-card border border-border-subtle rounded-xl flex flex-col items-center gap-2">
            <Terminal className="w-6 h-6 text-cyan-400" />
            <span>Python & psutil</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-bg-secondary border-t border-border-subtle py-8 text-center text-xs text-txt-muted">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>&copy; 2026 CloudPulse Platform. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <span className="hover:text-txt-primary cursor-pointer">Security</span>
            <span className="hover:text-txt-primary cursor-pointer">API Reference</span>
            <span className="hover:text-txt-primary cursor-pointer">Agent Docs</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
