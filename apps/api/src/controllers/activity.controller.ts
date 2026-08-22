import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/db";

export class ActivityController {
  static async listLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt((req.query.page as string) || "1", 10);
      const limit = parseInt((req.query.limit as string) || "50", 10);
      const skip = (page - 1) * limit;

      const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
          include: {
            user: { select: { name: true, email: true, role: true } },
          },
        }),
        prisma.auditLog.count(),
      ]);

      return res.status(200).json({
        success: true,
        data: logs,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
