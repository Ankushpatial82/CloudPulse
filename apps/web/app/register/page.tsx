"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Activity, ShieldAlert } from "lucide-react";
import { apiFetch } from "../../lib/api";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("USER");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, role }),
    });

    setLoading(false);
    if (res.success && res.data) {
      localStorage.setItem("cp_auth_token", res.data.token);
      localStorage.setItem("cp_user", JSON.stringify(res.data.user));
      localStorage.setItem("cp_demo_mode", "false");
      router.push("/overview");
    } else {
      setError(res.message || "Registration failed. Try again.");
    }
  };

  return (
    <div className="min-h-screen bg-bg-main flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border border-border-subtle rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5">
        <div className="flex flex-col items-center text-center">
          <div className="w-11 h-11 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-2">
            <Activity className="w-5.5 h-5.5" />
          </div>
          <h2 className="text-xl font-bold text-slate-50">Create CloudPulse Account</h2>
          <p className="text-xs text-txt-muted mt-1">Configure your real-time observability grid</p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-900/60 text-rose-400 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-txt-secondary mb-1">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-bg-main border border-border-subtle rounded-lg px-3 py-2 text-txt-primary focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-txt-secondary mb-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="e.g. name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-bg-main border border-border-subtle rounded-lg px-3 py-2 text-txt-primary focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-txt-secondary mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-bg-main border border-border-subtle rounded-lg px-3 py-2 text-txt-primary focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-txt-secondary mb-1">Account Role Permission</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-bg-main border border-border-subtle rounded-lg px-3 py-2 text-txt-primary focus:outline-none focus:border-cyan-500"
            >
              <option value="USER">USER (Add agents, config alerts)</option>
              <option value="ADMIN">ADMIN (Manage everything)</option>
              <option value="VIEWER">VIEWER (Read-only dashboard access)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg font-bold bg-cyan-500 hover:bg-cyan-400 text-black flex items-center justify-center gap-2 transition-colors mt-2"
          >
            {loading ? "Creating account..." : "Register & Start Stream"}
          </button>
        </form>

        <div className="text-center text-[11px] text-txt-muted border-t border-border-subtle/85 pt-3.5">
          Already have an account?{" "}
          <Link href="/login" className="text-cyan-400 hover:underline font-semibold">
            Sign In &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
