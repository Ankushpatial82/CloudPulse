import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/db";

export class ReportController {
  static async generateReport(req: Request, res: Response, next: NextFunction) {
    try {
      const type = (req.query.type as string) || "health"; // health, cpu, memory, disk, alert, uptime
      const timeframe = (req.query.timeframe as string) || "7d"; // today, 7d, 30d
      const format = (req.query.format as string) || "json"; // json, csv

      const days = timeframe === "today" ? 1 : timeframe === "30d" ? 30 : 7;
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const servers = await prisma.server.findMany({
        include: {
          metrics: {
            where: { timestamp: { gte: since } },
            orderBy: { timestamp: "desc" },
            take: 200,
          },
          alerts: {
            where: { triggeredAt: { gte: since } },
          },
        },
      });

      const reportData = servers.map((server) => {
        const metricsCount = server.metrics.length;
        const avgCpu = metricsCount > 0 ? server.metrics.reduce((a, b) => a + b.cpuUsage, 0) / metricsCount : 0;
        const avgRam = metricsCount > 0 ? server.metrics.reduce((a, b) => a + b.memoryUsage, 0) / metricsCount : 0;
        const maxCpu = metricsCount > 0 ? Math.max(...server.metrics.map((m) => m.cpuUsage)) : 0;
        const maxRam = metricsCount > 0 ? Math.max(...server.metrics.map((m) => m.memoryUsage)) : 0;
        const avgDisk = metricsCount > 0 ? server.metrics.reduce((a, b) => a + b.diskUsage, 0) / metricsCount : 0;

        return {
          serverId: server.id,
          serverName: server.name,
          hostname: server.hostname,
          ipAddress: server.ipAddress,
          os: server.os,
          status: server.status,
          healthScore: server.healthScore,
          avgCpuUsage: Math.round(avgCpu * 10) / 10,
          maxCpuUsage: Math.round(maxCpu * 10) / 10,
          avgMemoryUsage: Math.round(avgRam * 10) / 10,
          maxMemoryUsage: Math.round(maxRam * 10) / 10,
          avgDiskUsage: Math.round(avgDisk * 10) / 10,
          alertCount: server.alerts.length,
        };
      });

      if (format === "csv") {
        const headers = "Server Name,Hostname,IP,OS,Status,Health Score,Avg CPU (%),Max CPU (%),Avg RAM (%),Max RAM (%),Alerts\n";
        const rows = reportData
          .map(
            (r) =>
              `"${r.serverName}","${r.hostname}","${r.ipAddress}","${r.os}","${r.status}",${r.healthScore},${r.avgCpuUsage},${r.maxCpuUsage},${r.avgMemoryUsage},${r.maxMemoryUsage},${r.alertCount}`
          )
          .join("\n");

        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename="cloudpulse-report-${type}-${timeframe}.csv"`);
        return res.status(200).send(headers + rows);
      }

      return res.status(200).json({
        success: true,
        meta: { type, timeframe, generatedAt: new Date() },
        data: reportData,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
