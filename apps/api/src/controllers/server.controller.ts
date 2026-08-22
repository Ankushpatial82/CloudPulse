import { Request, Response, NextFunction } from "express";
import { ServerService } from "../services/server.service";
import { createServerSchema, ServerStatus } from "@cloudpulse/shared";
import { AuthRequest } from "../middlewares/auth.middleware";

export class ServerController {
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });
      const parsed = createServerSchema.parse(req.body);
      const server = await ServerService.createServer(req.user.id, parsed);
      return res.status(201).json({ success: true, data: server });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, status, sortBy, order, page, limit } = req.query;
      const result = await ServerService.getServers({
        search: search as string,
        status: status as ServerStatus,
        sortBy: sortBy as string,
        order: order as "asc" | "desc",
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      });
      return res.status(200).json({ success: true, data: result.servers, pagination: result.pagination });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const server = await ServerService.getServerById(req.params.id);
      return res.status(200).json({ success: true, data: server });
    } catch (error: any) {
      return res.status(404).json({ success: false, message: error.message });
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });
      const result = await ServerService.deleteServer(req.params.id, req.user.id);
      return res.status(200).json({ success: true, message: result.message });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  static async overview(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await ServerService.getOverviewStats();
      return res.status(200).json({ success: true, data: stats });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
