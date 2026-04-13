import { Request, Response } from "express";
import { registerUser, loginUser } from "../services/auth.services";

export const register = async (req: Request, res: Response): Promise<void> => {
  const response = await registerUser(req.body);
  const status = response.success ? 201 : 400;

  res.status(status).json(response);
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const response = await loginUser(req.body);
  const status = response.success ? 200 : 400;

  res.status(status).json(response);
};