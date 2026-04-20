import prisma from "../lib/prisma";
import { Status } from "@prisma/client";

export class TaskService {
  private async canManageTasks(projectId: string, userId: string) {
    const project = await prisma.project.findFirst({
      where: { id: projectId },
      include: { 
        createdBy: true,
        assignee: true
      }
    });
    
    if (!project) return false;
    
    if (project.createdById === userId) return true;
    

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });
    
    
    if (project.visibility === "public" && user?.role === "ADMIN") return true;
    
    
    if (user?.role === "MANAGER") {
      if (project.visibility === "public") return true;
      if (project.assigneeId === userId) return true;
    }
    
    return false;
  }

  async addTask(projectId: string, userId: string, data: any) {
    try {
      const { title, assignee } = data;
      
      if (!title || title.trim() === "") {
        return { success: false, message: "Task title is required" };
      }
      
      const canManage = await this.canManageTasks(projectId, userId);
      if (!canManage) {
        return { success: false, message: "You don't have permission to add tasks to this project" };
      }
      
      let assignedToId = null;
      if (assignee && assignee !== "") {
        const assigneeUser = await prisma.user.findFirst({
          where: { 
            OR: [
              { name: assignee },
              { email: assignee }
            ]
          }
        });
        if (assigneeUser) {
          assignedToId = assigneeUser.id;
        }
      }
      
      const task = await prisma.task.create({
        data: {
          title,
          projectId,
          assignedToId
        },
        include: {
          assignedTo: {
            select: { id: true, name: true, email: true }
          }
        }
      });
      
      return { success: true, data: task };
    } catch (error) {
      console.error("Add task error:", error);
      return { success: false, message: "Failed to add task" };
    }
  }

  async updateTask(taskId: string, userId: string, data: any) {
    try {
      const { title, completed, assignee } = data;
      
      const task = await prisma.task.findFirst({
        where: { id: taskId },
        include: { 
          project: {
            include: { createdBy: true }
          }
        }
      });
      
      if (!task) {
        return { success: false, message: "Task not found" };
      }
      
      
      let hasPermission = false;
      
      
      if (task.project.createdById === userId) {
        hasPermission = true;
      } else {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { role: true }
        });
        
        
        if (task.project.visibility === "public" && user?.role === "ADMIN") {
          hasPermission = true;
        }
        
        else if (user?.role === "MANAGER") {
          if (task.project.visibility === "public") hasPermission = true;
          if (task.project.assigneeId === userId) hasPermission = true;
        }
        
        else if (completed !== undefined && task.assignedToId === userId) {
          hasPermission = true;
        }
      }
      
      if (!hasPermission) {
        return { success: false, message: "You don't have permission to update this task" };
      }
      
      let assignedToId = task.assignedToId;
      if (assignee !== undefined) {
        if (assignee) {
          const assigneeUser = await prisma.user.findFirst({
            where: { name: assignee }
          });
          assignedToId = assigneeUser?.id || null;
        } else {
          assignedToId = null;
        }
      }
      
      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: {
          title: title !== undefined ? title : undefined,
          completed: completed !== undefined ? completed : undefined,
          assignedToId
        },
        include: {
          assignedTo: {
            select: { id: true, name: true, email: true }
          }
        }
      });
      
      
      const allTasks = await prisma.task.findMany({
        where: { projectId: task.projectId }
      });
      
      const allCompleted = allTasks.length > 0 && allTasks.every(t => t.completed);
      
      if (allCompleted) {
        await prisma.project.update({
          where: { id: task.projectId },
          data: { status: Status.COMPLETED }
        });
      } else if (task.project.status === Status.COMPLETED) {
        await prisma.project.update({
          where: { id: task.projectId },
          data: { status: Status.IN_PROGRESS }
        });
      }
      
      return { success: true, data: updatedTask };
    } catch (error) {
      console.error("Update task error:", error);
      return { success: false, message: "Failed to update task" };
    }
  }

  async deleteTask(taskId: string, userId: string) {
    try {
      const task = await prisma.task.findFirst({
        where: { id: taskId },
        include: { project: true }
      });
      
      if (!task) {
        return { success: false, message: "Task not found" };
      }
      
      const canManage = await this.canManageTasks(task.projectId, userId);
      if (!canManage) {
        return { success: false, message: "You don't have permission to delete tasks in this project" };
      }
      
      await prisma.task.delete({ where: { id: taskId } });
      
      return { success: true, message: "Task deleted successfully" };
    } catch (error) {
      console.error("Delete task error:", error);
      return { success: false, message: "Failed to delete task" };
    }
  }

  async assignTaskToMe(taskId: string, userId: string) {
    try {
      const task = await prisma.task.findFirst({
        where: { id: taskId },
        include: { 
          project: {
            include: { createdBy: true }
          }
        }
      });
      
      if (!task) {
        return { success: false, message: "Task not found" };
      }
      
      
      let canAssign = false;
      
      
      if (task.project.createdById === userId) {
        canAssign = true;
      }
      
      
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });
      

      if (task.project.visibility === "public" && user?.role === "ADMIN") {
        canAssign = true;
      }
      
      
      if (user?.role === "MANAGER") {
        if (task.project.visibility === "public") canAssign = true;
        if (task.project.assigneeId === userId) canAssign = true;
      }
      
    
      if (task.project.assigneeId === userId) {
        canAssign = true;
      }
      
      if (!canAssign) {
        return { success: false, message: "You don't have permission to assign yourself to this task" };
      }
      
      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: { assignedToId: userId },
        include: {
          assignedTo: {
            select: { id: true, name: true, email: true }
          }
        }
      });
      
      return { success: true, data: updatedTask, message: "Task assigned to you" };
    } catch (error) {
      console.error("Assign task error:", error);
      return { success: false, message: "Failed to assign task" };
    }
  }

  async assignProjectToMe(projectId: string, userId: string) {
    try {
      const project = await prisma.project.findFirst({
        where: { id: projectId }
      });
      
      if (!project) {
        return { success: false, message: "Project not found" };
      }
      
      
      let canAssign = false;
      
      // Get user role
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });
      
      
      if (project.visibility === "public" && user?.role === "ADMIN") {
        canAssign = true;
      }
      
    
      if (user?.role === "MANAGER" && project.visibility === "public") {
        canAssign = true;
      }
      
      
      if (project.createdById === userId) {
        return { success: false, message: "You already own this project" };
      }
      
      if (!canAssign) {
        return { success: false, message: "You don't have permission to assign yourself to this project" };
      }
      
      const updatedProject = await prisma.project.update({
        where: { id: projectId },
        data: { assigneeId: userId },
        include: {
          assignee: {
            select: { id: true, name: true, email: true, avatar: true }
          }
        }
      });
      
      return { success: true, data: updatedProject, message: "Project assigned to you" };
    } catch (error) {
      console.error("Assign project error:", error);
      return { success: false, message: "Failed to assign project" };
    }
  }
}

export const taskService = new TaskService();