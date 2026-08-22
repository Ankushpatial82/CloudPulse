"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "../../components/Navbar";
import { Sidebar } from "../../components/Sidebar";
import { apiFetch } from "../../lib/api";
import { DashboardContext } from "@/context/DashboardContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeAlertCount, setActiveAlertCount] = useState(0);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("cp_auth_token");
    const savedUser = localStorage.getItem("cp_user");
    const savedDemo = localStorage.getItem("cp_demo_mode");

    if (!token) {
      router.push("/login");
      return;
    }

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (_) {}
    }

    if (savedDemo !== null) {
      setIsDemo(savedDemo === "true");
    }
  }, [router]);

  // Fetch live alert count for the bell badge
  useEffect(() => {
    if (!mounted || isDemo) {
      setActiveAlertCount(isDemo ? 2 : 0);
      return;
    }
    const fetchAlertCount = async () => {
      try {
        const res = await apiFetch("/alerts?status=ACTIVE");
        if (res.success && Array.isArray(res.data)) {
          setActiveAlertCount(res.data.length);
        }
      } catch (_) {}
    };
    fetchAlertCount();
    // Refresh alert count every 30 seconds
    const interval = setInterval(fetchAlertCount, 30000);
    return () => clearInterval(interval);
  }, [mounted, isDemo]);

  const toggleDemo = () => {
    const nextVal = !isDemo;
    setIsDemo(nextVal);
    localStorage.setItem("cp_demo_mode", String(nextVal));
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center text-xs text-txt-muted">
        Loading CloudPulse Engine...
      </div>
    );
  }

  return (
    <DashboardContext.Provider value={{ isDemo, user, toggleDemo }}>
      <div className="min-h-screen bg-bg-main text-txt-primary flex flex-col">
        <Navbar
          user={user}
          isDemo={isDemo}
          onToggleDemo={toggleDemo}
          activeAlertCount={activeAlertCount}
        />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full space-y-6">
            {children}
          </main>
        </div>
      </div>
    </DashboardContext.Provider>
  );
}
