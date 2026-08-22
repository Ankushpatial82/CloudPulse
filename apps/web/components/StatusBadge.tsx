import React from "react";
import { ServerStatus } from "@cloudpulse/shared";

interface StatusBadgeProps {
  status: ServerStatus | string;
  className?: string;
  showDot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = "", showDot = true }) => {
  const upper = status.toUpperCase();

  let bg = "bg-slate-800 text-slate-300 border-slate-700";
  let dotBg = "bg-slate-400";
  let pulse = false;

  if (upper === "ONLINE") {
    bg = "bg-emerald-950/60 text-emerald-400 border-emerald-800/60";
    dotBg = "bg-emerald-400";
    pulse = true;
  } else if (upper === "WARNING") {
    bg = "bg-amber-950/60 text-amber-400 border-amber-800/60";
    dotBg = "bg-amber-400";
  } else if (upper === "CRITICAL") {
    bg = "bg-rose-950/60 text-rose-400 border-rose-800/60";
    dotBg = "bg-rose-400";
    pulse = true;
  } else if (upper === "OFFLINE") {
    bg = "bg-slate-900 text-slate-400 border-slate-800";
    dotBg = "bg-slate-500";
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${bg} ${className}`}
    >
      {showDot && (
        <span className={`w-2 h-2 rounded-full ${dotBg} ${pulse ? "pulse-online" : ""}`} />
      )}
      {upper}
    </span>
  );
};
