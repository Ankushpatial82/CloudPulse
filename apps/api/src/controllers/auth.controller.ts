import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { registerSchema, loginSchema } from "@cloudpulse/shared";
import { AuthRequest } from "../middlewares/auth.middleware";

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = registerSchema.parse(req.body);
      const result = await AuthService.register(parsed);
      return res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = loginSchema.parse(req.body);
      const result = await AuthService.login(parsed);
      return res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      return res.status(401).json({ success: false, message: error.message });
    }
  }

  static async me(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: "Not authenticated" });
      }
      const profile = await AuthService.getUserProfile(req.user.id);
      return res.status(200).json({ success: true, data: profile });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async logout(req: Request, res: Response) {
    return res.status(200).json({ success: true, message: "Logged out successfully" });
  }
}
