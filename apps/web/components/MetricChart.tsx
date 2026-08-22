"use client";

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

interface MetricChartProps {
  title: string;
  type: "line" | "area" | "dual-line";
  data: any[];
  dataKeys: { key: string; name: string; color: string }[];
  yUnit?: string;
  timeRange?: string;
  onTimeRangeChange?: (range: string) => void;
  height?: number;
}

const TIME_RANGES = ["5m", "15m", "1h", "6h", "24h", "7d", "30d"];

export const MetricChart: React.FC<MetricChartProps> = ({
  title,
  type,
  data,
  dataKeys,
  yUnit = "%",
  timeRange = "1h",
  onTimeRangeChange,
  height = 260,
}) => {
  return (
    <div className="bg-card border border-border-subtle rounded-xl p-5 shadow-lg flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-txt-primary">{title}</span>

        {/* Time range selector */}
        {onTimeRangeChange && (
          <div className="flex items-center gap-1 bg-bg-main p-1 rounded-lg border border-border-subtle">
            {TIME_RANGES.map((r) => (
              <button
                key={r}
                onClick={() => onTimeRangeChange(r)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                  timeRange === r
                    ? "bg-cyan-950 text-cyan-400 border border-cyan-700/60 shadow-sm"
                    : "text-txt-muted hover:text-txt-primary"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ width: "100%", height }}>
        <ResponsiveContainer width="100%" height="100%">
          {type === "area" ? (
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                {dataKeys.map((dk) => (
                  <linearGradient key={dk.key} id={`grad-${dk.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={dk.color} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={dk.color} stopOpacity={0.0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
              <XAxis dataKey="timestamp" stroke="#64748B" fontSize={10} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={10} tickLine={false} unit={yUnit} domain={[0, "auto"]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0D111A",
                  borderColor: "#1F2937",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "#F8FAFC",
                }}
              />
              {dataKeys.map((dk) => (
                <Area
                  key={dk.key}
                  type="monotone"
                  dataKey={dk.key}
                  name={dk.name}
                  stroke={dk.color}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill={`url(#grad-${dk.key})`}
                />
              ))}
            </AreaChart>
          ) : (
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
              <XAxis dataKey="timestamp" stroke="#64748B" fontSize={10} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={10} tickLine={false} unit={yUnit} domain={[0, "auto"]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0D111A",
                  borderColor: "#1F2937",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "#F8FAFC",
                }}
              />
              {dataKeys.length > 1 && <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "5px" }} />}
              {dataKeys.map((dk) => (
                <Line
                  key={dk.key}
                  type="monotone"
                  dataKey={dk.key}
                  name={dk.name}
                  stroke={dk.color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, stroke: "#22D3EE" }}
                />
              ))}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
