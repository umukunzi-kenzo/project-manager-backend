import { Request, Response } from "express";
import { taskService } from "../services/task.service";

export class TaskController {
  async createTask(req: Request, res: Response): Promise<void> {
    const response = await taskService.addTask(req.params.projectId as string, req.user!.id, req.body);
    const status = response.success ? 201 : 400;
    res.status(status).json(response);
  }

  async editTask(req: Request, res: Response): Promise<void> {
    const response = await taskService.updateTask(req.params.taskId as string, req.user!.id, req.body);
    const status = response.success ? 200 : 400;
    res.status(status).json(response);
  }

  async removeTask(req: Request, res: Response): Promise<void> {
    const response = await taskService.deleteTask(req.params.taskId as string, req.user!.id);
    const status = response.success ? 200 : 400;
    res.status(status).json(response);
  }

  async assignTaskToMe(req: Request, res: Response): Promise<void> {
    const response = await taskService.assignTaskToMe(req.params.taskId as string, req.user!.id);
    const status = response.success ? 200 : 400;
    res.status(status).json(response);
  }

  async assignProjectToMe(req: Request, res: Response): Promise<void> {
    const response = await taskService.assignProjectToMe(req.params.projectId as string, req.user!.id);
    const status = response.success ? 200 : 400;
    res.status(status).json(response);
  }
}

export const taskController = new TaskController();