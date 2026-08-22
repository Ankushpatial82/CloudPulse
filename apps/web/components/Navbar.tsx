"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import {
  Activity,
  Bell,
  Search,
  Shield,
  User,
  LogOut,
  Sliders,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  KeyRound,
} from "lucide-react";

interface NavbarProps {
  user?: { name: string; email: string; role: string } | null;
  isDemo?: boolean;
  onToggleDemo?: () => void;
  activeAlertCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  user = { name: "Admin User", email: "admin@cloudpulse.io", role: "USER" },
  isDemo = false,
  onToggleDemo,
  activeAlertCount = 0,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Positions for portal-rendered dropdowns
  const [notifPos, setNotifPos] = useState({ top: 0, right: 0 });
  const [userPos, setUserPos] = useState({ top: 0, right: 0 });

  const notifBtnRef = useRef<HTMLButtonElement>(null);
  const userBtnRef = useRef<HTMLButtonElement>(null);
  const roleBtnRef = useRef<HTMLButtonElement>(null);
  const notifDropRef = useRef<HTMLDivElement>(null);
  const userDropRef = useRef<HTMLDivElement>(null);

  // Recalculate dropdown positions when they open
  const openNotifications = () => {
    if (notifBtnRef.current) {
      const r = notifBtnRef.current.getBoundingClientRect();
      setNotifPos({ top: r.bottom + 8, right: window.innerWidth - r.right });
    }
    setShowNotifications((v) => !v);
    setShowUserMenu(false);
  };

  const openUserMenu = (anchorRef?: React.RefObject<HTMLButtonElement | null>) => {
    const btn = (anchorRef && anchorRef.current) || userBtnRef.current || roleBtnRef.current;
    if (btn) {
      const r = btn.getBoundingClientRect();
      setUserPos({ top: r.bottom + 8, right: window.innerWidth - r.right });
    }
    setShowUserMenu((v) => !v);
    setShowNotifications(false);
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        notifBtnRef.current && !notifBtnRef.current.contains(target) &&
        notifDropRef.current && !notifDropRef.current.contains(target)
      ) {
        setShowNotifications(false);
      }
      if (
        userBtnRef.current && !userBtnRef.current.contains(target) &&
        roleBtnRef.current && !roleBtnRef.current.contains(target) &&
        userDropRef.current && !userDropRef.current.contains(target)
      ) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("cp_auth_token");
    localStorage.removeItem("cp_user");
    localStorage.removeItem("cp_demo_mode");
    window.location.href = "/login";
  };

  const userInitial = user?.name ? user.name[0].toUpperCase() : "A";
  const displayName = user?.name || "Admin User";
  const displayEmail = user?.email || "admin@cloudpulse.io";
  const displayRole = user?.role || "USER";

  return (
    <>
      <header className="h-16 bg-bg-secondary border-b border-border-subtle sticky top-0 px-6 flex items-center justify-between" style={{ zIndex: 40 }}>

        {/* ── Brand & Live/Demo Toggle ── */}
        <div className="flex items-center gap-4">
          <Link href="/overview" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:border-cyan-400 transition-colors">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-wide text-txt-primary">CloudPulse</span>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
                  PRO
                </span>
              </div>
              <span className="text-[10px] text-txt-muted hidden sm:block">Infrastructure Observability</span>
            </div>
          </Link>

          {/* Live / Demo toggle pill */}
          <button
            onClick={onToggleDemo}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              isDemo
                ? "bg-amber-950/40 text-amber-300 border-amber-800/60 hover:bg-amber-900/50"
                : "bg-emerald-950/40 text-emerald-300 border-emerald-800/60 hover:bg-emerald-900/50"
            }`}
          >
            <span className={`w-2 h-2 rounded-full animate-pulse ${isDemo ? "bg-amber-400" : "bg-emerald-400"}`} />
            {isDemo ? "DEMO MODE" : "LIVE AGENT STREAM"}
          </button>
        </div>

        {/* ── Search Bar ── */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted" />
            <input
              type="text"
              placeholder="Search servers, IPs, alerts, PIDs... (Press '/' to focus)"
              className="w-full bg-bg-main border border-border-subtle rounded-lg pl-9 pr-10 py-1.5 text-xs text-txt-primary placeholder:text-txt-muted focus:outline-none focus:border-cyan-500/60 transition-all"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-txt-muted font-mono bg-bg-secondary px-1.5 py-0.5 rounded border border-border-subtle">
              /
            </kbd>
          </div>
        </div>

        {/* ── Right Controls ── */}
        <div className="flex items-center gap-2">

          {/* Role Badge — separate clickable button */}
          <button
            ref={roleBtnRef}
            onClick={() => openUserMenu(roleBtnRef)}
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-bg-main border border-border-subtle text-xs text-txt-secondary font-mono hover:border-cyan-500/40 hover:text-txt-primary transition-colors cursor-pointer"
            aria-label="User role"
          >
            <Shield className="w-3 h-3 text-cyan-400" />
            {displayRole}
          </button>

          {/* Notifications Bell */}
          <button
            ref={notifBtnRef}
            onClick={openNotifications}
            className="relative p-2 rounded-lg bg-bg-main border border-border-subtle text-txt-secondary hover:text-txt-primary hover:border-cyan-500/40 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {activeAlertCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                {activeAlertCount > 9 ? "9+" : activeAlertCount}
              </span>
            )}
          </button>

          {/* Admin User Avatar — separate clickable button */}
          <button
            ref={userBtnRef}
            onClick={() => openUserMenu(userBtnRef)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-bg-main border border-border-subtle hover:border-cyan-500/40 transition-colors cursor-pointer"
            aria-label="User menu"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-800 to-cyan-600 border border-cyan-500/50 flex items-center justify-center font-bold text-xs text-white shrink-0">
              {userInitial}
            </div>
            <span className="text-xs font-medium text-txt-primary hidden lg:block max-w-[100px] truncate">
              {displayName}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-txt-muted transition-transform duration-200 ${
                showUserMenu ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </header>

      {/* ── NOTIFICATIONS DROPDOWN — rendered via Portal so it escapes header z-context ── */}
      {showNotifications &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={notifDropRef}
            style={{ position: "fixed", top: notifPos.top, right: notifPos.right, zIndex: 9999 }}
            className="w-80 bg-card border border-border-subtle rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
              <span className="text-xs font-bold text-txt-primary">Incident Alerts</span>
              <button
                className="text-[10px] text-cyan-400 hover:underline"
                onClick={() => setShowNotifications(false)}
              >
                Mark all read
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto divide-y divide-border-subtle">
              {activeAlertCount === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-xs text-txt-muted">
                  <CheckCircle className="w-6 h-6 text-emerald-400" />
                  <span>No active alerts — all systems healthy</span>
                </div>
              ) : (
                <>
                  <div className="p-3 flex items-start gap-2.5 hover:bg-bg-secondary transition-colors cursor-default">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-rose-300">CPU threshold exceeded</div>
                      <div className="text-[11px] text-txt-muted">Current: 94.8% (Threshold 90%)</div>
                      <div className="text-[10px] text-txt-muted mt-0.5">3 minutes ago</div>
                    </div>
                  </div>
                  <div className="p-3 flex items-start gap-2.5 hover:bg-bg-secondary transition-colors cursor-default">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-amber-300">High memory utilization</div>
                      <div className="text-[11px] text-txt-muted">Current: 88.1% (Threshold 85%)</div>
                      <div className="text-[10px] text-txt-muted mt-0.5">42 minutes ago</div>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="border-t border-border-subtle">
              <Link
                href="/alerts"
                className="block text-center text-xs font-medium text-cyan-400 hover:text-cyan-300 py-3 hover:bg-bg-secondary transition-colors"
                onClick={() => setShowNotifications(false)}
              >
                View all alerts &rarr;
              </Link>
            </div>
          </div>,
          document.body
        )}

      {/* ── USER DROPDOWN — rendered via Portal so it escapes header z-context ── */}
      {showUserMenu &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={userDropRef}
            style={{ position: "fixed", top: userPos.top, right: userPos.right, zIndex: 9999 }}
            className="w-60 bg-card border border-border-subtle rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Profile header */}
            <div className="px-4 py-3 border-b border-border-subtle bg-bg-secondary flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-800 to-cyan-600 border border-cyan-500/50 flex items-center justify-center font-bold text-sm text-white shrink-0">
                {userInitial}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-xs text-txt-primary truncate">{displayName}</div>
                <div className="text-[10px] text-txt-muted truncate">{displayEmail}</div>
                <div className="text-[10px] text-cyan-400 font-mono mt-0.5">{displayRole}</div>
              </div>
            </div>

            {/* Nav links */}
            <div className="py-1">
              <Link
                href="/settings?tab=profile"
                className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-txt-secondary hover:text-txt-primary hover:bg-bg-secondary transition-colors"
                onClick={() => setShowUserMenu(false)}
              >
                <User className="w-3.5 h-3.5 text-cyan-400" />
                Profile &amp; Credentials
              </Link>
              <Link
                href="/settings?tab=telemetry"
                className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-txt-secondary hover:text-txt-primary hover:bg-bg-secondary transition-colors"
                onClick={() => setShowUserMenu(false)}
              >
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                Telemetry Settings
              </Link>
              <Link
                href="/settings?tab=apikeys"
                className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-txt-secondary hover:text-txt-primary hover:bg-bg-secondary transition-colors"
                onClick={() => setShowUserMenu(false)}
              >
                <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                API Keys &amp; Webhooks
              </Link>
            </div>

            {/* Demo toggle */}
            <div className="border-t border-border-subtle py-1">
              <button
                onClick={() => {
                  onToggleDemo?.();
                  setShowUserMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-txt-secondary hover:text-txt-primary hover:bg-bg-secondary transition-colors"
              >
                <span className={`w-2 h-2 rounded-full ${isDemo ? "bg-amber-400" : "bg-emerald-400"}`} />
                {isDemo ? "Switch to Live Mode" : "Switch to Demo Mode"}
              </button>
            </div>

            {/* Sign out */}
            <div className="border-t border-border-subtle py-1">
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-rose-400 hover:bg-rose-950/40 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
