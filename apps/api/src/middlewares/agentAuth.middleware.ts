import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/db";

export interface AgentRequest extends Request {
  agent?: {
    id: string;
    agentToken: string;
    serverId: string;
  };
}

export const authenticateAgent = async (req: AgentRequest, res: Response, next: NextFunction) => {
  const token = req.headers["x-agent-token"] || req.body.agentToken;

  if (!token || typeof token !== "string") {
    return res.status(401).json({ success: false, message: "Agent token is missing" });
  }

  try {
    const agent = await prisma.monitoringAgent.findUnique({
      where: { agentToken: token },
      include: { server: true },
    });

    if (!agent) {
      return res.status(401).json({ success: false, message: "Invalid agent token" });
    }

    req.agent = {
      id: agent.id,
      agentToken: agent.agentToken,
      serverId: agent.serverId,
    };

    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error authenticating agent token" });
  }
};
