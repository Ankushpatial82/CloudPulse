import { Router } from "express";
import { ServerController } from "../controllers/server.controller";
import { authenticateJwt } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/rbac.middleware";

const router = Router();

router.get("/overview", authenticateJwt, ServerController.overview);
router.get("/", authenticateJwt, ServerController.list);
router.get("/:id", authenticateJwt, ServerController.getById);
router.post("/", authenticateJwt, authorizeRoles("ADMIN", "USER"), ServerController.create);
router.delete("/:id", authenticateJwt, authorizeRoles("ADMIN"), ServerController.delete);

export default router;
