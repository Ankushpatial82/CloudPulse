import { prisma } from "../config/db";
import { CreateServerInput, ServerStatus } from "@cloudpulse/shared";
import crypto from "crypto";

export class ServerService {
  static async createServer(userId: string, input: CreateServerInput) {
    const agentToken = `cp_agent_${crypto.randomBytes(16).toString("hex")}`;

    const server = await prisma.server.create({
      data: {
        name: input.name,
        hostname: input.hostname,
        ipAddress: input.ipAddress,
        os: input.os,
        osVersion: input.osVersion,
        cpuModel: input.cpuModel,
        cpuCores: input.cpuCores,
        totalMemoryMb: input.totalMemoryMb,
        totalDiskGb: input.totalDiskGb,
        status: "OFFLINE",
        userId,
        agents: {
          create: {
            agentToken,
            status: "INACTIVE",
            configIntervalSec: 5,
          },
        },
      },
      include: {
        agents: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: "SERVER_CREATED",
        resource: `Server:${server.id}`,
        details: `Created server ${server.name} (${server.hostname})`,
      },
    });

    return {
      ...server,
      agentToken,
    };
  }

  static async getServers(query?: {
    search?: string;
    status?: ServerStatus;
    sortBy?: string;
    order?: "asc" | "desc";
    page?: number;
    limit?: number;
  }) {
    const page = query?.page || 1;
    const limit = query?.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query?.search) {
      where.OR = [
        { name: { contains: query.search, mode: "insensitive" } },
        { hostname: { contains: query.search, mode: "insensitive" } },
        { ipAddress: { contains: query.search, mode: "insensitive" } },
        { os: { contains: query.search, mode: "insensitive" } },
      ];
    }
    if (query?.status) {
      where.status = query.status;
    }

    const orderBy: any = query?.sortBy ? { [query.sortBy]: query.order || "desc" } : { updatedAt: "desc" };

    const [servers, total] = await Promise.all([
      prisma.server.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          agents: {
            select: {
              id: true,
              agentToken: true,
              status: true,
              lastHeartbeat: true,
              configIntervalSec: true,
            },
          },
          alerts: {
            where: { status: "ACTIVE" },
            select: { id: true, severity: true },
          },
          metrics: {
            take: 1,
            orderBy: { timestamp: "desc" as const },
          },
        },
      }) as Promise<any[]>,
      prisma.server.count({ where }),
    ]);

    // Format output with live metrics & alert count
    const formatted = servers.map((s) => {
      const latestMetric = s.metrics[0];
      return {
        id: s.id,
        name: s.name,
        hostname: s.hostname,
        ipAddress: s.ipAddress,
        os: s.os,
        osVersion: s.osVersion,
        cpuModel: s.cpuModel,
        cpuCores: s.cpuCores,
        totalMemoryMb: s.totalMemoryMb,
        totalDiskGb: s.totalDiskGb,
        status: s.status,
        healthScore: s.healthScore,
        lastSeen: s.lastSeen,
        userId: s.userId,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
        agentToken: s.agents[0]?.agentToken,
        activeAlertCount: s.alerts.length,
        latestMetric: latestMetric
          ? {
              cpuUsage: latestMetric.cpuUsage,
              memoryUsage: latestMetric.memoryUsage,
              diskUsage: latestMetric.diskUsage,
              networkUploadKbps: latestMetric.networkUploadKbps,
              networkDownloadKbps: latestMetric.networkDownloadKbps,
              uptimeSec: latestMetric.uptimeSec,
              timestamp: latestMetric.timestamp,
            }
          : null,
      };
    });

    return {
      servers: formatted,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getServerById(serverId: string) {
    const server = await prisma.server.findUnique({
      where: { id: serverId },
      include: {
        agents: true,
        alerts: {
          orderBy: { triggeredAt: "desc" },
          take: 10,
        },
        alertRules: true,
        metrics: {
          take: 30,
          orderBy: { timestamp: "desc" },
        },
      },
    });

    if (!server) {
      throw new Error("Server not found");
    }

    return server;
  }

  static async deleteServer(serverId: string, userId: string) {
    const server = await prisma.server.findUnique({ where: { id: serverId } });
    if (!server) {
      throw new Error("Server not found");
    }

    await prisma.server.delete({ where: { id: serverId } });

    await prisma.auditLog.create({
      data: {
        userId,
        action: "SERVER_DELETED",
        resource: `Server:${serverId}`,
        details: `Deleted server ${server.name} (${server.hostname})`,
      },
    });

    return { success: true, message: `Server ${server.name} deleted successfully` };
  }

  static async getOverviewStats() {
    const [totalServers, onlineServers, warningServers, criticalServers, offlineServers, activeAlerts, latestMetrics] =
      await Promise.all([
        prisma.server.count(),
        prisma.server.count({ where: { status: "ONLINE" } }),
        prisma.server.count({ where: { status: "WARNING" } }),
        prisma.server.count({ where: { status: "CRITICAL" } }),
        prisma.server.count({ where: { status: "OFFLINE" } }),
        prisma.alert.count({ where: { status: "ACTIVE" } }),
        prisma.metric.findMany({
          distinct: ["serverId"],
          orderBy: { timestamp: "desc" },
          take: 50,
        }),
      ]);

    const avgCpu =
      latestMetrics.length > 0
        ? latestMetrics.reduce((acc, m) => acc + m.cpuUsage, 0) / latestMetrics.length
        : 0;

    const avgMemory =
      latestMetrics.length > 0
        ? latestMetrics.reduce((acc, m) => acc + m.memoryUsage, 0) / latestMetrics.length
        : 0;

    // Global overall health score
    let healthScore = 100;
    if (totalServers > 0) {
      const unhealthyCount = criticalServers * 2 + warningServers + offlineServers * 0.5;
      healthScore = Math.max(0, Math.min(100, Math.round(100 - (unhealthyCount / totalServers) * 40)));
    }

    return {
      totalServers,
      onlineServers,
      warningServers,
      criticalServers,
      offlineServers,
      criticalAlerts: activeAlerts,
      avgCpu: Math.round(avgCpu * 10) / 10,
      avgMemory: Math.round(avgMemory * 10) / 10,
      systemHealthScore: healthScore,
    };
  }
}
