import { Request, Response, NextFunction } from "express";
import { AlertService } from "../services/alert.service";
import { createAlertRuleSchema } from "@cloudpulse/shared";
import { AuthRequest } from "../middlewares/auth.middleware";

export class AlertController {
  static async createRule(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });
      const parsed = createAlertRuleSchema.parse(req.body);
      const rule = await AlertService.createRule(req.user.id, parsed);
      return res.status(201).json({ success: true, data: rule });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  static async listRules(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const rules = await AlertService.getRules();
      return res.status(200).json({ success: true, data: rules });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async deleteRule(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });
      const result = await AlertService.deleteRule(req.params.id, req.user.id);
      return res.status(200).json({ success: true, message: "Alert rule deleted" });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  static async listAlerts(req: Request, res: Response, next: NextFunction) {
    try {
      const { serverId, status, severity } = req.query;
      const alerts = await AlertService.getAlerts({
        serverId: serverId as string,
        status: status as "ACTIVE" | "RESOLVED",
        severity: severity as string,
      });
      return res.status(200).json({ success: true, data: alerts });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async resolveAlert(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });
      const updated = await AlertService.resolveAlert(req.params.id, req.user.id);
      return res.status(200).json({ success: true, data: updated });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  static async deleteAlert(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });
      await AlertService.deleteAlert(req.params.id, req.user.id);
      return res.status(200).json({ success: true, message: "Alert deleted" });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}
