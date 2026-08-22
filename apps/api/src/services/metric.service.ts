import { prisma } from "../config/db";
import { MetricPayload, SOCKET_EVENTS } from "@cloudpulse/shared";
import { socketManager } from "../sockets/socketManager";
import { AlertService } from "./alert.service";

export class MetricService {
  static async ingestMetric(serverId: string, payload: MetricPayload) {
    const processesJson = payload.processes ? JSON.stringify(payload.processes) : null;

    // 1. Create metric record
    const metric = await prisma.metric.create({
      data: {
        serverId,
        cpuUsage: payload.cpuUsage,
        memoryUsage: payload.memoryUsage,
        swapUsage: payload.swapUsage || 0,
        diskUsage: payload.diskUsage,
        networkUploadKbps: payload.networkUploadKbps || 0,
        networkDownloadKbps: payload.networkDownloadKbps || 0,
        loadAvg1: payload.loadAvg1 || 0,
        loadAvg5: payload.loadAvg5 || 0,
        loadAvg15: payload.loadAvg15 || 0,
        temperature: payload.temperature || null,
        uptimeSec: payload.uptimeSec || 0,
        processCount: payload.processCount || (payload.processes ? payload.processes.length : 0),
        processesJson,
        timestamp: payload.timestamp ? new Date(payload.timestamp) : new Date(),
      },
    });

    // 2. Compute dynamic Health Score & Server Status
    const activeAlertsCount = await prisma.alert.count({
      where: { serverId, status: "ACTIVE" },
    });

    let status: "ONLINE" | "WARNING" | "CRITICAL" = "ONLINE";
    if (payload.cpuUsage > 90 || payload.memoryUsage > 90 || payload.diskUsage > 90 || activeAlertsCount >= 3) {
      status = "CRITICAL";
    } else if (payload.cpuUsage > 75 || payload.memoryUsage > 80 || payload.diskUsage > 80 || activeAlertsCount > 0) {
      status = "WARNING";
    }

    let penalty = activeAlertsCount * 15;
    let healthScore = 100 - (payload.cpuUsage * 0.25 + payload.memoryUsage * 0.25 + payload.diskUsage * 0.2 + penalty);
    healthScore = Math.max(0, Math.min(100, Math.round(healthScore)));

    // 3. Update server lastSeen, healthScore, status
    const updatedServer = await prisma.server.update({
      where: { id: serverId },
      data: {
        status,
        healthScore,
        lastSeen: new Date(),
      },
    });

    // 4. Update Agent heartbeat
    await prisma.monitoringAgent.updateMany({
      where: { serverId },
      data: {
        status: "ACTIVE",
        lastHeartbeat: new Date(),
      },
    });

    // 5. Evaluate alert rules asynchronously
    AlertService.evaluateRulesForMetric(serverId, payload).catch((err) => {
      console.error("[AlertEvaluationError]", err);
    });

    // 6. Broadcast Real-time event over Socket.IO
    const metricBroadcast = {
      serverId,
      cpuUsage: metric.cpuUsage,
      memoryUsage: metric.memoryUsage,
      swapUsage: metric.swapUsage,
      diskUsage: metric.diskUsage,
      networkUploadKbps: metric.networkUploadKbps,
      networkDownloadKbps: metric.networkDownloadKbps,
      loadAvg1: metric.loadAvg1,
      loadAvg5: metric.loadAvg5,
      loadAvg15: metric.loadAvg15,
      temperature: metric.temperature,
      uptimeSec: metric.uptimeSec,
      processCount: metric.processCount,
      timestamp: metric.timestamp,
      serverStatus: status,
      healthScore,
    };

    socketManager.broadcastToServer(serverId, SOCKET_EVENTS.SERVER_METRICS, metricBroadcast);

    return metric;
  }

  static async getHistoricalMetrics(
    serverId: string,
    range: "5m" | "15m" | "1h" | "6h" | "24h" | "7d" | "30d" = "1h"
  ) {
    const now = new Date();
    let startTime = new Date();

    switch (range) {
      case "5m":
        startTime = new Date(now.getTime() - 5 * 60 * 1000);
        break;
      case "15m":
        startTime = new Date(now.getTime() - 15 * 60 * 1000);
        break;
      case "1h":
        startTime = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case "6h":
        startTime = new Date(now.getTime() - 6 * 60 * 60 * 1000);
        break;
      case "24h":
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "7d":
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startTime = new Date(now.getTime() - 60 * 60 * 1000);
    }

    const metrics = await prisma.metric.findMany({
      where: {
        serverId,
        timestamp: {
          gte: startTime,
        },
      },
      orderBy: { timestamp: "asc" },
      take: 500,
    });

    return metrics;
  }

  static async getLatestProcesses() {
    // Get the latest metric per server that has processesJson populated
    const servers = await prisma.server.findMany({
      select: {
        id: true,
        name: true,
        hostname: true,
        status: true,
        metrics: {
          where: { processesJson: { not: null } },
          orderBy: { timestamp: "desc" },
          take: 1,
          select: { processesJson: true, timestamp: true },
        },
      },
    });

    const result: any[] = [];
    for (const srv of servers) {
      if (srv.metrics[0]?.processesJson) {
        try {
          const procs = JSON.parse(srv.metrics[0].processesJson);
          for (const p of procs) {
            result.push({
              ...p,
              server: srv.name,
              serverHostname: srv.hostname,
              serverId: srv.id,
              collectedAt: srv.metrics[0].timestamp,
            });
          }
        } catch (_) {}
      }
    }

    // Sort globally by CPU desc
    return result.sort((a, b) => b.cpuPercent - a.cpuPercent).slice(0, 50);
  }
}
