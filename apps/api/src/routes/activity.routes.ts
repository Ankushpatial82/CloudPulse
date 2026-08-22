import { Router } from "express";
import { ActivityController } from "../controllers/activity.controller";
import { authenticateJwt } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", authenticateJwt, ActivityController.listLogs);

export default router;
