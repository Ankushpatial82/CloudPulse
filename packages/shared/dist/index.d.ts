import { z } from "zod";
export type UserRole = "ADMIN" | "USER" | "VIEWER";
export type ServerStatus = "ONLINE" | "WARNING" | "CRITICAL" | "OFFLINE";
export type AlertSeverity = "INFO" | "WARNING" | "CRITICAL";
export type AlertStatus = "ACTIVE" | "RESOLVED";
export declare const registerSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    role: z.ZodDefault<z.ZodOptional<z.ZodEnum<["ADMIN", "USER", "VIEWER"]>>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    password: string;
    role: "ADMIN" | "USER" | "VIEWER";
}, {
    name: string;
    email: string;
    password: string;
    role?: "ADMIN" | "USER" | "VIEWER" | undefined;
}>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export declare const createServerSchema: z.ZodObject<{
    name: z.ZodString;
    hostname: z.ZodString;
    ipAddress: z.ZodString;
    os: z.ZodString;
    osVersion: z.ZodOptional<z.ZodString>;
    cpuModel: z.ZodOptional<z.ZodString>;
    cpuCores: z.ZodDefault<z.ZodNumber>;
    totalMemoryMb: z.ZodDefault<z.ZodNumber>;
    totalDiskGb: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name: string;
    hostname: string;
    ipAddress: string;
    os: string;
    cpuCores: number;
    totalMemoryMb: number;
    totalDiskGb: number;
    osVersion?: string | undefined;
    cpuModel?: string | undefined;
}, {
    name: string;
    hostname: string;
    ipAddress: string;
    os: string;
    osVersion?: string | undefined;
    cpuModel?: string | undefined;
    cpuCores?: number | undefined;
    totalMemoryMb?: number | undefined;
    totalDiskGb?: number | undefined;
}>;
export type CreateServerInput = z.infer<typeof createServerSchema>;
export interface ProcessInfo {
    pid: number;
    name: string;
    cpuPercent: number;
    memoryPercent: number;
    status: string;
    username: string;
}
export declare const metricPayloadSchema: z.ZodObject<{
    agentToken: z.ZodString;
    cpuUsage: z.ZodNumber;
    memoryUsage: z.ZodNumber;
    swapUsage: z.ZodDefault<z.ZodNumber>;
    diskUsage: z.ZodNumber;
    networkUploadKbps: z.ZodDefault<z.ZodNumber>;
    networkDownloadKbps: z.ZodDefault<z.ZodNumber>;
    loadAvg1: z.ZodDefault<z.ZodNumber>;
    loadAvg5: z.ZodDefault<z.ZodNumber>;
    loadAvg15: z.ZodDefault<z.ZodNumber>;
    temperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    uptimeSec: z.ZodDefault<z.ZodNumber>;
    processCount: z.ZodDefault<z.ZodNumber>;
    processes: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
        pid: z.ZodNumber;
        name: z.ZodString;
        cpuPercent: z.ZodNumber;
        memoryPercent: z.ZodNumber;
        status: z.ZodString;
        username: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        status: string;
        pid: number;
        cpuPercent: number;
        memoryPercent: number;
        username: string;
    }, {
        name: string;
        status: string;
        pid: number;
        cpuPercent: number;
        memoryPercent: number;
        username: string;
    }>, "many">>>;
    timestamp: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    agentToken: string;
    cpuUsage: number;
    memoryUsage: number;
    swapUsage: number;
    diskUsage: number;
    networkUploadKbps: number;
    networkDownloadKbps: number;
    loadAvg1: number;
    loadAvg5: number;
    loadAvg15: number;
    uptimeSec: number;
    processCount: number;
    processes: {
        name: string;
        status: string;
        pid: number;
        cpuPercent: number;
        memoryPercent: number;
        username: string;
    }[];
    temperature?: number | null | undefined;
    timestamp?: string | undefined;
}, {
    agentToken: string;
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    swapUsage?: number | undefined;
    networkUploadKbps?: number | undefined;
    networkDownloadKbps?: number | undefined;
    loadAvg1?: number | undefined;
    loadAvg5?: number | undefined;
    loadAvg15?: number | undefined;
    temperature?: number | null | undefined;
    uptimeSec?: number | undefined;
    processCount?: number | undefined;
    processes?: {
        name: string;
        status: string;
        pid: number;
        cpuPercent: number;
        memoryPercent: number;
        username: string;
    }[] | undefined;
    timestamp?: string | undefined;
}>;
export type MetricPayload = z.infer<typeof metricPayloadSchema>;
export declare const createAlertRuleSchema: z.ZodObject<{
    name: z.ZodString;
    serverId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    metricType: z.ZodEnum<["CPU", "MEMORY", "DISK", "OFFLINE", "NETWORK"]>;
    operator: z.ZodEnum<["GT", "GTE", "LT", "LTE", "EQ"]>;
    threshold: z.ZodNumber;
    severity: z.ZodEnum<["INFO", "WARNING", "CRITICAL"]>;
}, "strip", z.ZodTypeAny, {
    name: string;
    metricType: "OFFLINE" | "CPU" | "MEMORY" | "DISK" | "NETWORK";
    operator: "GT" | "GTE" | "LT" | "LTE" | "EQ";
    threshold: number;
    severity: "WARNING" | "CRITICAL" | "INFO";
    serverId?: string | null | undefined;
}, {
    name: string;
    metricType: "OFFLINE" | "CPU" | "MEMORY" | "DISK" | "NETWORK";
    operator: "GT" | "GTE" | "LT" | "LTE" | "EQ";
    threshold: number;
    severity: "WARNING" | "CRITICAL" | "INFO";
    serverId?: string | null | undefined;
}>;
export type CreateAlertRuleInput = z.infer<typeof createAlertRuleSchema>;
export declare const SOCKET_EVENTS: {
    readonly SERVER_METRICS: "server:metrics";
    readonly SERVER_ONLINE: "server:online";
    readonly SERVER_OFFLINE: "server:offline";
    readonly SERVER_STATUS: "server:status";
    readonly ALERT_CREATED: "alert:created";
    readonly ALERT_RESOLVED: "alert:resolved";
    readonly NOTIFICATION_NEW: "notification:new";
    readonly SUBSCRIBE_SERVER: "subscribe:server";
    readonly UNSUBSCRIBE_SERVER: "unsubscribe:server";
};
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
