import { Router } from "express";
import { AlertController } from "../controllers/alert.controller";
import { authenticateJwt } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/rbac.middleware";

const router = Router();

router.get("/rules", authenticateJwt, AlertController.listRules);
router.post("/rules", authenticateJwt, authorizeRoles("ADMIN", "USER"), AlertController.createRule);
router.delete("/rules/:id", authenticateJwt, authorizeRoles("ADMIN", "USER"), AlertController.deleteRule);

router.get("/", authenticateJwt, AlertController.listAlerts);
router.patch("/:id/resolve", authenticateJwt, authorizeRoles("ADMIN", "USER"), AlertController.resolveAlert);
router.delete("/:id", authenticateJwt, authorizeRoles("ADMIN"), AlertController.deleteAlert);

export default router;
