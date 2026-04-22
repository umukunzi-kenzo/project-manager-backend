import { Request, Response } from "express";
import { authService } from "../services/auth.services";

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    const response = await authService.registerUser(req.body);
    const status = response.success ? 201 : 400;
    res.status(status).json(response);
  }

  async login(req: Request, res: Response): Promise<void> {
    const response = await authService.loginUser(req.body);
    const status = response.success ? 200 : 400;
    res.status(status).json(response);
  }
}

export const authController = new AuthController();