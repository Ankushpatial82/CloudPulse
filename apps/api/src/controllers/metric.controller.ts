import { Request, Response, NextFunction } from "express";
import { MetricService } from "../services/metric.service";
import { metricPayloadSchema } from "@cloudpulse/shared";
import { AgentRequest } from "../middlewares/agentAuth.middleware";

export class MetricController {
  static async ingest(req: AgentRequest, res: Response, next: NextFunction) {
    try {
      if (!req.agent) {
        return res.status(401).json({ success: false, message: "Agent unauthorized" });
      }

      const parsed = metricPayloadSchema.parse(req.body);
      const metric = await MetricService.ingestMetric(req.agent.serverId, parsed);
      return res.status(201).json({ success: true, data: { metricId: metric.id } });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  static async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { serverId } = req.params;
      const range = (req.query.range as any) || "1h";
      const metrics = await MetricService.getHistoricalMetrics(serverId, range);
      return res.status(200).json({ success: true, data: metrics });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getProcesses(req: Request, res: Response, next: NextFunction) {
    try {
      const processes = await MetricService.getLatestProcesses();
      return res.status(200).json({ success: true, data: processes });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
