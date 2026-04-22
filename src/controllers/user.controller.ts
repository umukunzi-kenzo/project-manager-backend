import { Request, Response } from "express";
import { userService } from "../services/user.services";

export class UserController {
  async getMe(req: Request, res: Response): Promise<void> {
    const response = await userService.getMe(req.user!.id);
    const status = response.success ? 200 : 400;
    res.status(status).json(response);
  }

  async getAllUsers(req: Request, res: Response): Promise<void> {
    const response = await userService.getAllUsers();
    const status = response.success ? 200 : 400;
    res.status(status).json(response);
  }

  async getUserById(req: Request, res: Response): Promise<void> {
    const response = await userService.getUserById(req.params.id as string);
    const status = response.success ? 200 : 404;
    res.status(status).json(response);
  }

  async updateMe(req: Request, res: Response): Promise<void> {
    const response = await userService.updateMe(req.user!.id, req.body);
    const status = response.success ? 200 : 400;
    res.status(status).json(response);
  }

  async deleteMe(req: Request, res: Response): Promise<void> {
    const response = await userService.deleteMe(req.user!.id);
    const status = response.success ? 200 : 400;
    res.status(status).json(response);
  }
}

export const userController = new UserController();