import { Router } from "express";
import { AgentController } from "../controllers/agent.controller";
import { authenticateJwt } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/rbac.middleware";

const router = Router();

router.get("/", authenticateJwt, AgentController.listAgents);
router.post("/:id/revoke", authenticateJwt, authorizeRoles("ADMIN"), AgentController.revoke);
router.delete("/:id", authenticateJwt, authorizeRoles("ADMIN"), AgentController.delete);

export default router;
