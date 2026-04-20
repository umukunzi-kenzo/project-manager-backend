import { Request, Response } from "express";
import { googleAuthService } from "../services/google.services";

export class GoogleController {
  async googleAuth(req: Request, res: Response): Promise<void> {
    const response = await googleAuthService.googleAuth(req.body);
    const status = response.success ? 200 : 400;
    res.status(status).json(response);
  }

  async googleRegister(req: Request, res: Response): Promise<void> {
    const response = await googleAuthService.googleRegister(req.body);
    const status = response.success ? 200 : 400;
    res.status(status).json(response);
  }
}

export const googleController = new GoogleController();