import prisma from "../lib/prisma";
import { Priority, Section, Status } from "@prisma/client";

export class ProjectService {
  private async canEditProject(projectId: string, userId: string) {
    const project = await prisma.project.findFirst({
      where: { id: projectId },
      include: { createdBy: true }
    });
    
    if (!project) return false;
    if (project.createdById === userId) return true;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });
    
    return user?.role === "ADMIN";
  }

  async getProjectsByUser(userId: string) {
    try {
      const projects = await prisma.project.findMany({
        where: {
          OR: [
            { createdById: userId },
            { assigneeId: userId },
            { visibility: "public" }
          ]
        },
        include: {
          tasks: {
            include: {
              assignedTo: {
                select: { id: true, name: true, email: true }
              }
            }
          },
          createdBy: {
            select: { id: true, name: true, email: true, role: true }
          },
          assignee: {
            select: { id: true, name: true, email: true, avatar: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      
      return { success: true, data: projects };
    } catch (error) {
      console.error("Get projects error:", error);
      return { success: false, message: "Failed to fetch projects" };
    }
  }

  async getProjectById(id: string, userId: string) {
    try {
      const project = await prisma.project.findFirst({
        where: {
          id,
          OR: [
            { createdById: userId },
            { assigneeId: userId },
            { visibility: "public" }
          ]
        },
        include: {
          tasks: {
            include: {
              assignedTo: {
                select: { id: true, name: true, email: true }
              }
            }
          },
          createdBy: {
            select: { id: true, name: true, email: true, role: true }
          },
          assignee: {
            select: { id: true, name: true, email: true, avatar: true }
          }
        }
      });
      
      if (!project) {
        return { success: false, message: "Project not found" };
      }
      
      return { success: true, data: project };
    } catch (error) {
      console.error("Get project error:", error);
      return { success: false, message: "Failed to fetch project" };
    }
  }

  async createProject(userId: string, data: any) {
    try {
      const { title, description, priority, section, visibility, assignee, startDate, endDate } = data;
      
      let assigneeId = null;
      if (assignee) {
        const assigneeUser = await prisma.user.findFirst({
          where: { name: assignee }
        });
        if (assigneeUser) {
          assigneeId = assigneeUser.id;
        }
      }
      
      const project = await prisma.project.create({
        data: {
          title,
          description: description || "",
          priority: (priority as Priority) || Priority.MEDIUM,
          section: (section as Section) || Section.OTHER,
          visibility: visibility || "private",
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          createdById: userId,
          assigneeId,
          status: Status.PLANNING
        },
        include: {
          tasks: true,
          assignee: {
            select: { id: true, name: true, email: true, avatar: true }
          }
        }
      });
      
      return { success: true, data: project };
    } catch (error) {
      console.error("Create project error:", error);
      return { success: false, message: "Failed to create project" };
    }
  }

  async updateProject(id: string, userId: string, data: any) {
    try {
      const canEdit = await this.canEditProject(id, userId);
      if (!canEdit) {
        return { success: false, message: "Project not found or you don't have permission" };
      }
      
      const { title, description, priority, section, visibility, assignee, startDate, endDate, status, archived } = data;
      
      let assigneeId = undefined;
      if (assignee !== undefined) {
        if (assignee) {
          const assigneeUser = await prisma.user.findFirst({
            where: { name: assignee }
          });
          assigneeId = assigneeUser?.id || null;
        } else {
          assigneeId = null;
        }
      }
      
      const project = await prisma.project.update({
        where: { id },
        data: {
          title: title !== undefined ? title : undefined,
          description: description !== undefined ? description : undefined,
          priority: priority !== undefined ? (priority as Priority) : undefined,
          section: section !== undefined ? (section as Section) : undefined,
          visibility: visibility !== undefined ? visibility : undefined,
          assigneeId,
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
          status: status !== undefined ? (status as Status) : undefined,
          archived: archived !== undefined ? archived : undefined,
        },
        include: {
          tasks: {
            include: {
              assignedTo: {
                select: { id: true, name: true, email: true }
              }
            }
          },
          assignee: {
            select: { id: true, name: true, email: true, avatar: true }
          }
        }
      });
      
      return { success: true, data: project };
    } catch (error) {
      console.error("Update project error:", error);
      return { success: false, message: "Failed to update project" };
    }
  }

  async deleteProject(id: string, userId: string) {
    try {
      const canEdit = await this.canEditProject(id, userId);
      if (!canEdit) {
        return { success: false, message: "Project not found or you don't have permission" };
      }
      
      await prisma.project.delete({ where: { id } });
      
      return { success: true, message: "Project deleted successfully" };
    } catch (error) {
      console.error("Delete project error:", error);
      return { success: false, message: "Failed to delete project" };
    }
  }
}

export const projectService = new ProjectService();
