import { z } from "zod";

// Role & Status Enums
export type UserRole = "ADMIN" | "USER" | "VIEWER";
export type ServerStatus = "ONLINE" | "WARNING" | "CRITICAL" | "OFFLINE";
export type AlertSeverity = "INFO" | "WARNING" | "CRITICAL";
export type AlertStatus = "ACTIVE" | "RESOLVED";

// Auth Schemas
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["ADMIN", "USER", "VIEWER"]).optional().default("USER"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

// Server Schemas
export const createServerSchema = z.object({
  name: z.string().min(2, "Server name is required"),
  hostname: z.string().min(1, "Hostname is required"),
  ipAddress: z.string().min(1, "IP address is required"),
  os: z.string().min(1, "OS is required"),
  osVersion: z.string().optional(),
  cpuModel: z.string().optional(),
  cpuCores: z.number().int().positive().default(1),
  totalMemoryMb: z.number().nonnegative().default(0),
  totalDiskGb: z.number().nonnegative().default(0),
});

export type CreateServerInput = z.infer<typeof createServerSchema>;

// Process Info Type
export interface ProcessInfo {
  pid: number;
  name: string;
  cpuPercent: number;
  memoryPercent: number;
  status: string;
  username: string;
}

// Telemetry Metric Schema (sent by python agent)
export const metricPayloadSchema = z.object({
  agentToken: z.string().min(1),
  cpuUsage: z.number().min(0).max(100),
  memoryUsage: z.number().min(0).max(100),
  swapUsage: z.number().min(0).max(100).default(0),
  diskUsage: z.number().min(0).max(100),
  networkUploadKbps: z.number().nonnegative().default(0),
  networkDownloadKbps: z.number().nonnegative().default(0),
  loadAvg1: z.number().nonnegative().default(0),
  loadAvg5: z.number().nonnegative().default(0),
  loadAvg15: z.number().nonnegative().default(0),
  temperature: z.number().nullable().optional(),
  uptimeSec: z.number().nonnegative().default(0),
  processCount: z.number().int().nonnegative().default(0),
  processes: z.array(
    z.object({
      pid: z.number(),
      name: z.string(),
      cpuPercent: z.number(),
      memoryPercent: z.number(),
      status: z.string(),
      username: z.string(),
    })
  ).optional().default([]),
  timestamp: z.string().optional(),
});

export type MetricPayload = z.infer<typeof metricPayloadSchema>;

// Alert Rule Schema
export const createAlertRuleSchema = z.object({
  name: z.string().min(2),
  serverId: z.string().optional().nullable(),
  metricType: z.enum(["CPU", "MEMORY", "DISK", "OFFLINE", "NETWORK"]),
  operator: z.enum(["GT", "GTE", "LT", "LTE", "EQ"]),
  threshold: z.number(),
  severity: z.enum(["INFO", "WARNING", "CRITICAL"]),
});

export type CreateAlertRuleInput = z.infer<typeof createAlertRuleSchema>;

// Socket Event Names
export const SOCKET_EVENTS = {
  SERVER_METRICS: "server:metrics",
  SERVER_ONLINE: "server:online",
  SERVER_OFFLINE: "server:offline",
  SERVER_STATUS: "server:status",
  ALERT_CREATED: "alert:created",
  ALERT_RESOLVED: "alert:resolved",
  NOTIFICATION_NEW: "notification:new",
  SUBSCRIBE_SERVER: "subscribe:server",
  UNSUBSCRIBE_SERVER: "unsubscribe:server",
} as const;

export interface UserDTO {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface ServerDTO {
  id: string;
  name: string;
  hostname: string;
  ipAddress: string;
  os: string;
  osVersion?: string | null;
  cpuModel?: string | null;
  cpuCores: number;
  totalMemoryMb: number;
  totalDiskGb: number;
  status: ServerStatus;
  healthScore: number;
  lastSeen?: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  agentToken?: string;
  activeAlertCount?: number;
}
