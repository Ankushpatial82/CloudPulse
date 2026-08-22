import React from "react";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon?: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  accentColor?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
  trend,
  accentColor = "border-cyan-500/30",
}) => {
  return (
    <div
      className={`bg-card hover:bg-card-hover border border-border-subtle hover:${accentColor} rounded-xl p-5 transition-all duration-200 shadow-lg relative overflow-hidden group`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-txt-secondary">{title}</span>
        {Icon && (
          <div className="p-2 rounded-lg bg-bg-secondary text-cyan-400 border border-border-subtle group-hover:border-cyan-500/40 transition-colors">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-3xl font-bold font-mono-val text-txt-primary tracking-tight">{value}</span>
        {trend && (
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded ${
              trend.isPositive
                ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/50"
                : "bg-rose-950/80 text-rose-400 border border-rose-800/50"
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>

      {subtext && <p className="mt-2 text-xs text-txt-muted">{subtext}</p>}
    </div>
  );
};
