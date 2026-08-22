import { prisma } from "../config/db";
import { CreateAlertRuleInput, SOCKET_EVENTS } from "@cloudpulse/shared";
import { socketManager } from "../sockets/socketManager";

export class AlertService {
  static async createRule(userId: string, input: CreateAlertRuleInput) {
    const rule = await prisma.alertRule.create({
      data: {
        name: input.name,
        serverId: input.serverId || null,
        metricType: input.metricType,
        operator: input.operator,
        threshold: input.threshold,
        severity: input.severity,
        enabled: true,
        userId,
      },
      include: {
        server: { select: { name: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: "ALERT_RULE_CREATED",
        resource: `AlertRule:${rule.id}`,
        details: `Created alert rule "${rule.name}" (${rule.metricType} ${rule.operator} ${rule.threshold}%)`,
      },
    });

    return rule;
  }

  static async getRules(userId?: string) {
    return prisma.alertRule.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        server: { select: { id: true, name: true, hostname: true } },
        _count: { select: { alerts: true } },
      },
    });
  }

  static async deleteRule(ruleId: string, userId: string) {
    const rule = await prisma.alertRule.findUnique({ where: { id: ruleId } });
    if (!rule) throw new Error("Alert rule not found");

    await prisma.alertRule.delete({ where: { id: ruleId } });

    await prisma.auditLog.create({
      data: {
        userId,
        action: "ALERT_RULE_DELETED",
        resource: `AlertRule:${ruleId}`,
        details: `Deleted alert rule ${rule.name}`,
      },
    });

    return { success: true };
  }

  static async getAlerts(query?: {
    serverId?: string;
    status?: "ACTIVE" | "RESOLVED";
    severity?: string;
  }) {
    const where: any = {};
    if (query?.serverId) where.serverId = query.serverId;
    if (query?.status) where.status = query.status;
    if (query?.severity) where.severity = query.severity;

    return prisma.alert.findMany({
      where,
      orderBy: { triggeredAt: "desc" },
      include: {
        server: { select: { id: true, name: true, hostname: true, ipAddress: true } },
        alertRule: { select: { name: true, threshold: true, metricType: true } },
      },
    });
  }

  static async resolveAlert(alertId: string, userId: string) {
    const alert = await prisma.alert.findUnique({
      where: { id: alertId },
      include: { server: true },
    });

    if (!alert) throw new Error("Alert not found");

    const updated = await prisma.alert.update({
      where: { id: alertId },
      data: {
        status: "RESOLVED",
        resolvedAt: new Date(),
      },
      include: {
        server: true,
      },
    });

    // Broadcast resolved event
    socketManager.broadcastToServer(alert.serverId, SOCKET_EVENTS.ALERT_RESOLVED, updated);

    await prisma.auditLog.create({
      data: {
        userId,
        action: "ALERT_RESOLVED",
        resource: `Alert:${alertId}`,
        details: `Resolved alert for server ${alert.server.name}: ${alert.message}`,
      },
    });

    return updated;
  }

  static async deleteAlert(alertId: string, userId: string) {
    await prisma.alert.delete({ where: { id: alertId } });
    return { success: true };
  }

  // Evaluates metrics against rules for a specific server
  static async evaluateRulesForMetric(serverId: string, metric: any) {
    const rules = await prisma.alertRule.findMany({
      where: {
        enabled: true,
        OR: [{ serverId: serverId }, { serverId: null }],
      },
      include: { server: true },
    });

    const server = await prisma.server.findUnique({ where: { id: serverId } });
    if (!server) return;

    for (const rule of rules) {
      let val = 0;
      if (rule.metricType === "CPU") val = metric.cpuUsage;
      else if (rule.metricType === "MEMORY") val = metric.memoryUsage;
      else if (rule.metricType === "DISK") val = metric.diskUsage;
      else if (rule.metricType === "NETWORK") val = metric.networkUploadKbps + metric.networkDownloadKbps;

      let triggered = false;
      if (rule.operator === "GT" && val > rule.threshold) triggered = true;
      if (rule.operator === "GTE" && val >= rule.threshold) triggered = true;
      if (rule.operator === "LT" && val < rule.threshold) triggered = true;
      if (rule.operator === "LTE" && val <= rule.threshold) triggered = true;
      if (rule.operator === "EQ" && val === rule.threshold) triggered = true;

      const existingActiveAlert = await prisma.alert.findFirst({
        where: {
          alertRuleId: rule.id,
          serverId,
          status: "ACTIVE",
        },
      });

      if (triggered && !existingActiveAlert) {
        // Trigger new alert!
        const message = `${server.name} ${rule.metricType} usage (${val.toFixed(1)}%) exceeded threshold (${rule.threshold}%).`;
        const newAlert = await prisma.alert.create({
          data: {
            alertRuleId: rule.id,
            serverId,
            metricType: rule.metricType,
            currentValue: val,
            thresholdValue: rule.threshold,
            severity: rule.severity,
            status: "ACTIVE",
            message,
          },
          include: {
            server: { select: { id: true, name: true, hostname: true } },
            alertRule: { select: { name: true } },
          },
        });

        // Also create a notification for server owner
        await prisma.notification.create({
          data: {
            userId: server.userId,
            title: `ALERT: ${rule.severity} on ${server.name}`,
            message,
            type: "ALERT",
          },
        });

        // Real-time Socket.IO Broadcast
        socketManager.broadcastToServer(serverId, SOCKET_EVENTS.ALERT_CREATED, newAlert);
        socketManager.emitToUser(server.userId, SOCKET_EVENTS.NOTIFICATION_NEW, newAlert);
      } else if (!triggered && existingActiveAlert) {
        // Auto-resolve alert if metric returned back to normal
        const resolved = await prisma.alert.update({
          where: { id: existingActiveAlert.id },
          data: {
            status: "RESOLVED",
            resolvedAt: new Date(),
          },
          include: { server: true },
        });

        socketManager.broadcastToServer(serverId, SOCKET_EVENTS.ALERT_RESOLVED, resolved);
      }
    }
  }
}
