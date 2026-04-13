import { Request, Response } from "express";
import {
  getMeService,
  getAllUsersService,
  getUserByIdService,
  updateMeService,
  deleteMeService,
} from "../services/user.services";

export const getMe = async (req: Request, res: Response): Promise<void> => {
  const response = await getMeService(req.user!.id);
  const status = response.success ? 200 : 400;
  res.status(status).json(response);
};

export const getAllUsers = async (_req: Request, res: Response): Promise<void> => {
  const response = await getAllUsersService();
  const status = response.success ? 200 : 400;
  res.status(status).json(response);
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  const response = await getUserByIdService(req.params.id as string);
  const status = response.success ? 200 : 404;
  res.status(status).json(response);
};

export const updateMe = async (req: Request, res: Response): Promise<void> => {
  const response = await updateMeService(req.user!.id, req.body);
  const status = response.success ? 200 : 400;
  res.status(status).json(response);
};

export const deleteMe = async (req: Request, res: Response): Promise<void> => {
  const response = await deleteMeService(req.user!.id);
  const status = response.success ? 200 : 400;
  res.status(status).json(response);
};