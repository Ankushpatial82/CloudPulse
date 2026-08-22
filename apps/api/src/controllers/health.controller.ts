import { Request, Response } from "express";
import { prisma } from "../config/db";

export class HealthController {
  static async check(req: Request, res: Response) {
    let dbConnected = false;
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbConnected = true;
    } catch (e) {
      dbConnected = false;
    }

    return res.status(dbConnected ? 200 : 500).json({
      success: dbConnected,
      status: dbConnected ? "UP" : "DOWN",
      timestamp: new Date(),
      services: {
        database: dbConnected ? "HEALTHY" : "UNHEALTHY",
        api: "HEALTHY",
      },
    });
  }
}
