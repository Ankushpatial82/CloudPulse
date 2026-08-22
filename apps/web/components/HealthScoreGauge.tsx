import React from "react";

interface HealthScoreGaugeProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export const HealthScoreGauge: React.FC<HealthScoreGaugeProps> = ({
  score,
  size = 140,
  strokeWidth = 10,
  label = "System Health",
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(100, score));
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  let color = "#34D399"; // Emerald
  let category = "Excellent";

  if (score < 60) {
    color = "#F87171"; // Red
    category = "Critical";
  } else if (score < 85) {
    color = "#FBBF24"; // Amber
    category = "Warning";
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1F2937"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Gauge progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-bold font-mono-val text-slate-50">{Math.round(score)}</span>
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">/ 100</span>
        </div>
      </div>
      <div className="mt-2 text-center">
        <span className="text-sm font-semibold text-slate-200">{label}</span>
        <div className="text-xs font-medium" style={{ color }}>
          {category}
        </div>
      </div>
    </div>
  );
};
