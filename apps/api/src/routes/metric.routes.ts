import { Router } from "express";
import { MetricController } from "../controllers/metric.controller";
import { authenticateAgent } from "../middlewares/agentAuth.middleware";
import { authenticateJwt } from "../middlewares/auth.middleware";

const router = Router();

// Endpoint called by Python Agent
router.post("/ingest", authenticateAgent, MetricController.ingest);

// Endpoint called by Frontend Dashboard
router.get("/server/:serverId", authenticateJwt, MetricController.getHistory);

// Cross-server live process list
router.get("/processes", authenticateJwt, MetricController.getProcesses);

export default router;
