"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SOCKET_EVENTS = exports.createAlertRuleSchema = exports.metricPayloadSchema = exports.createServerSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
// Auth Schemas
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "Name must be at least 2 characters"),
    email: zod_1.z.string().email("Invalid email address"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
    role: zod_1.z.enum(["ADMIN", "USER", "VIEWER"]).optional().default("USER"),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email address"),
    password: zod_1.z.string().min(1, "Password is required"),
});
// Server Schemas
exports.createServerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "Server name is required"),
    hostname: zod_1.z.string().min(1, "Hostname is required"),
    ipAddress: zod_1.z.string().min(1, "IP address is required"),
    os: zod_1.z.string().min(1, "OS is required"),
    osVersion: zod_1.z.string().optional(),
    cpuModel: zod_1.z.string().optional(),
    cpuCores: zod_1.z.number().int().positive().default(1),
    totalMemoryMb: zod_1.z.number().nonnegative().default(0),
    totalDiskGb: zod_1.z.number().nonnegative().default(0),
});
// Telemetry Metric Schema (sent by python agent)
exports.metricPayloadSchema = zod_1.z.object({
    agentToken: zod_1.z.string().min(1),
    cpuUsage: zod_1.z.number().min(0).max(100),
    memoryUsage: zod_1.z.number().min(0).max(100),
    swapUsage: zod_1.z.number().min(0).max(100).default(0),
    diskUsage: zod_1.z.number().min(0).max(100),
    networkUploadKbps: zod_1.z.number().nonnegative().default(0),
    networkDownloadKbps: zod_1.z.number().nonnegative().default(0),
    loadAvg1: zod_1.z.number().nonnegative().default(0),
    loadAvg5: zod_1.z.number().nonnegative().default(0),
    loadAvg15: zod_1.z.number().nonnegative().default(0),
    temperature: zod_1.z.number().nullable().optional(),
    uptimeSec: zod_1.z.number().nonnegative().default(0),
    processCount: zod_1.z.number().int().nonnegative().default(0),
    processes: zod_1.z.array(zod_1.z.object({
        pid: zod_1.z.number(),
        name: zod_1.z.string(),
        cpuPercent: zod_1.z.number(),
        memoryPercent: zod_1.z.number(),
        status: zod_1.z.string(),
        username: zod_1.z.string(),
    })).optional().default([]),
    timestamp: zod_1.z.string().optional(),
});
// Alert Rule Schema
exports.createAlertRuleSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    serverId: zod_1.z.string().optional().nullable(),
    metricType: zod_1.z.enum(["CPU", "MEMORY", "DISK", "OFFLINE", "NETWORK"]),
    operator: zod_1.z.enum(["GT", "GTE", "LT", "LTE", "EQ"]),
    threshold: zod_1.z.number(),
    severity: zod_1.z.enum(["INFO", "WARNING", "CRITICAL"]),
});
// Socket Event Names
exports.SOCKET_EVENTS = {
    SERVER_METRICS: "server:metrics",
    SERVER_ONLINE: "server:online",
    SERVER_OFFLINE: "server:offline",
    SERVER_STATUS: "server:status",
    ALERT_CREATED: "alert:created",
    ALERT_RESOLVED: "alert:resolved",
    NOTIFICATION_NEW: "notification:new",
    SUBSCRIBE_SERVER: "subscribe:server",
    UNSUBSCRIBE_SERVER: "unsubscribe:server",
};
