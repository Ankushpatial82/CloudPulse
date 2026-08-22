"use client";

import React, { createContext, useContext } from "react";

export interface DashboardContextType {
  isDemo: boolean;
  user: { id?: string; name?: string; email?: string; role?: string } | null;
  toggleDemo: () => void;
}

export const DashboardContext = createContext<DashboardContextType | null>(null);

export const useDashboard = () => {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error("useDashboard must be used within a DashboardLayout / DashboardContext.Provider");
  }
  return ctx;
};
