import { Router } from "express";
import authRoutes from "./auth.routes";
import serverRoutes from "./server.routes";
import metricRoutes from "./metric.routes";
import alertRoutes from "./alert.routes";
import agentRoutes from "./agent.routes";
import reportRoutes from "./report.routes";
import activityRoutes from "./activity.routes";
import healthRoutes from "./health.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/servers", serverRoutes);
router.use("/metrics", metricRoutes);
router.use("/alerts", alertRoutes);
router.use("/agents", agentRoutes);
router.use("/reports", reportRoutes);
router.use("/activity", activityRoutes);
router.use("/health", healthRoutes);

export default router;
