import { Request, Response } from "express";
import {
  getProjectsByUser,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addTask,
  updateTask,
  deleteTask
} from "../services/project.services";

export const getProjects = async (req: Request, res: Response): Promise<void> => {
  const response = await getProjectsByUser(req.user!.id);
  const status = response.success ? 200 : 400;
  res.status(status).json(response);
};

export const getProject = async (req: Request, res: Response): Promise<void> => {
  const response = await getProjectById(req.params.id as string, req.user!.id);
  const status = response.success ? 200 : 404;
  res.status(status).json(response);
};

export const create = async (req: Request, res: Response): Promise<void> => {
  const response = await createProject(req.user!.id, req.body);
  const status = response.success ? 201 : 400;
  res.status(status).json(response);
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const response = await updateProject(req.params.id as string, req.user!.id, req.body);
  const status = response.success ? 200 : 400;
  res.status(status).json(response);
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  const response = await deleteProject(req.params.id as string, req.user!.id);
  const status = response.success ? 200 : 400;
  res.status(status).json(response);
};

export const createTask = async (req: Request, res: Response): Promise<void> => {
  const response = await addTask(req.params.projectId as string, req.user!.id, req.body);
  const status = response.success ? 201 : 400;
  res.status(status).json(response);
};

export const editTask = async (req: Request, res: Response): Promise<void> => {
  const response = await updateTask(req.params.taskId as string, req.user!.id, req.body);
  const status = response.success ? 200 : 400;
  res.status(status).json(response);
};

export const removeTask = async (req: Request, res: Response): Promise<void> => {
  const response = await deleteTask(req.params.taskId as string, req.user!.id);
  const status = response.success ? 200 : 400;
  res.status(status).json(response);
};