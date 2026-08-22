"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Activity, ShieldAlert, ShieldCheck } from "lucide-react";
import { apiFetch } from "../../lib/api";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Auto sandbox mode handler — ?demo=true auto-logs in
  useEffect(() => {
    if (searchParams.get("demo") === "true") {
      setEmail("demo@cloudpulse.io");
      setPassword("cloudpulse123");
      // Auto-submit login
      (async () => {
        setLoading(true);
        const res = await apiFetch("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email: "demo@cloudpulse.io", password: "cloudpulse123" }),
        });
        if (res.success && res.data) {
          localStorage.setItem("cp_auth_token", res.data.token);
          localStorage.setItem("cp_user", JSON.stringify(res.data.user));
          localStorage.setItem("cp_demo_mode", "true");
          router.push("/overview");
        } else {
          // Fallback: sandbox bypass if demo account not in DB
          localStorage.setItem("cp_auth_token", "demo_jwt_token_bypassed_2026");
          localStorage.setItem("cp_user", JSON.stringify({ id: "demo", name: "Demo User", email: "demo@cloudpulse.io", role: "USER" }));
          localStorage.setItem("cp_demo_mode", "true");
          router.push("/overview");
        }
      })();
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    setLoading(false);
    if (res.success && res.data) {
      localStorage.setItem("cp_auth_token", res.data.token);
      localStorage.setItem("cp_user", JSON.stringify(res.data.user));
      // Real login → live mode (not demo)
      localStorage.setItem("cp_demo_mode", "false");
      router.push("/overview");
    } else {
      setError(res.message || "Invalid email or password");
    }
  };

  // Instant sandbox bypass
  const handleQuickLogin = (role: string) => {
    setLoading(true);
    // Emulate sandbox settings
    const fakeToken = "demo_jwt_token_bypassed_2026";
    const fakeUser = {
      id: "demo-user-id",
      name: `Demo ${role}`,
      email: `${role.toLowerCase()}@cloudpulse.io`,
      role,
    };
    localStorage.setItem("cp_auth_token", fakeToken);
    localStorage.setItem("cp_user", JSON.stringify(fakeUser));
    localStorage.setItem("cp_demo_mode", "true");

    setTimeout(() => {
      setLoading(false);
      router.push("/overview");
    }, 400);
  };

  return (
    <div className="w-full max-w-md bg-card border border-border-subtle rounded-2xl shadow-2xl overflow-hidden p-6 space-y-6">
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-3">
          <Activity className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-50">Sign in to CloudPulse</h2>
        <p className="text-xs text-txt-muted mt-1">Real-time observability and server monitoring</p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-900/60 text-rose-400 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-txt-secondary mb-1">Email Address</label>
          <input
            type="email"
            required
            placeholder="admin@cloudpulse.io"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-bg-main border border-border-subtle rounded-lg px-3 py-2 text-txt-primary focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <label className="font-semibold text-txt-secondary">Password</label>
            <span className="text-[10px] text-cyan-400 hover:underline cursor-pointer">Forgot password?</span>
          </div>
          <input
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-bg-main border border-border-subtle rounded-lg px-3 py-2 text-txt-primary focus:outline-none focus:border-cyan-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg font-bold bg-cyan-500 hover:bg-cyan-400 text-black flex items-center justify-center gap-2 transition-colors mt-2"
        >
          {loading ? "Authenticating..." : "Sign In"}
        </button>
      </form>

      {/* Sandbox Quick Access Buttons */}
      <div className="border-t border-border-subtle/80 pt-4">
        <span className="block text-[10px] uppercase font-bold tracking-wider text-txt-muted text-center mb-3">
          SANDBOX PORTFOLIO QUICK BYPASS
        </span>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleQuickLogin("ADMIN")}
            className="py-1.5 rounded bg-cyan-950/40 text-cyan-400 border border-cyan-800/60 hover:bg-cyan-900/60 transition-colors text-[10px] font-bold flex flex-col items-center justify-center gap-1"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            ADMIN
          </button>
          <button
            onClick={() => handleQuickLogin("USER")}
            className="py-1.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-800/60 hover:bg-emerald-900/60 transition-colors text-[10px] font-bold flex flex-col items-center justify-center gap-1"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            USER
          </button>
          <button
            onClick={() => handleQuickLogin("VIEWER")}
            className="py-1.5 rounded bg-slate-900 text-slate-300 border border-slate-700 hover:bg-slate-800 transition-colors text-[10px] font-bold flex flex-col items-center justify-center gap-1"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            VIEWER
          </button>
        </div>
      </div>

      <div className="text-center text-[11px] text-txt-muted">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-cyan-400 hover:underline font-semibold">
          Create an account &rarr;
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-bg-main flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-xs text-txt-muted">Loading form boundary...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
