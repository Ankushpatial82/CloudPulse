import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/db";
import crypto from "crypto";
import { AuthRequest } from "../middlewares/auth.middleware";

export class AgentController {
  static async listAgents(req: Request, res: Response, next: NextFunction) {
    try {
      const agents = await prisma.monitoringAgent.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          server: {
            select: {
              id: true,
              name: true,
              hostname: true,
              ipAddress: true,
              os: true,
              status: true,
            },
          },
        },
      });

      return res.status(200).json({ success: true, data: agents });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async revoke(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const newToken = `cp_agent_${crypto.randomBytes(16).toString("hex")}`;

      const updated = await prisma.monitoringAgent.update({
        where: { id },
        data: {
          agentToken: newToken,
          status: "REVOKED",
        },
      });

      if (req.user) {
        await prisma.auditLog.create({
          data: {
            userId: req.user.id,
            action: "AGENT_REVOKED",
            resource: `Agent:${id}`,
            details: `Revoked token for agent ${id}`,
          },
        });
      }

      return res.status(200).json({ success: true, data: updated });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await prisma.monitoringAgent.delete({ where: { id } });

      if (req.user) {
        await prisma.auditLog.create({
          data: {
            userId: req.user.id,
            action: "AGENT_DELETED",
            resource: `Agent:${id}`,
            details: `Deleted agent ${id}`,
          },
        });
      }

      return res.status(200).json({ success: true, message: "Agent deleted" });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}
