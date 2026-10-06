import { Request, Response } from "express";
import { projectService } from "../services/project.services";

export class ProjectController {
  async getProjects(req: Request, res: Response): Promise<void> {
    const response = await projectService.getProjectsByUser(req.user!.id);
    const status = response.success ? 200 : 400;
    res.status(status).json(response);
  }

  async getProject(req: Request, res: Response): Promise<void> {
    const response = await projectService.getProjectById(req.params.id as string, req.user!.id);
    const status = response.success ? 200 : 404;
    res.status(status).json(response);
  }

  async create(req: Request, res: Response): Promise<void> {
    const response = await projectService.createProject(req.user!.id, req.body);
    const status = response.success ? 201 : 400;
    res.status(status).json(response);
  }

  async update(req: Request, res: Response): Promise<void> {
    const response = await projectService.updateProject(req.params.id as string, req.user!.id, req.body);
    const status = response.success ? 200 : 400;
    res.status(status).json(response);
  }

  async remove(req: Request, res: Response): Promise<void> {
    const response = await projectService.deleteProject(req.params.id as string, req.user!.id);
    const status = response.success ? 200 : 400;
    res.status(status).json(response);
  }
}

export const projectController = new ProjectController();
