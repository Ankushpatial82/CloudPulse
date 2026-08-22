import { Router } from "express";
import { ReportController } from "../controllers/report.controller";
import { authenticateJwt } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", authenticateJwt, ReportController.generateReport);

export default router;
