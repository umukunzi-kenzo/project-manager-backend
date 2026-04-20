import prisma from "../lib/prisma";

const canManageTasks = async (projectId: string, userId: string) => {
  const project = await prisma.project.findFirst({
    where: { id: projectId },
    include: { createdBy: true }
  });
  
  if (!project) return false;
  
  if (project.createdById === userId) return true;
  
  if (project.visibility === "public") {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });
    return user?.role === "MANAGER" || user?.role === "ADMIN";
  }
  
  return false;
};

const canEditProject = async (projectId: string, userId: string) => {
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
  
  if (user?.role === "ADMIN") return true;
  
  return false;
};

export const getProjectsByUser = async (userId: string) => {
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
        tasks: true,
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
};

export const getProjectById = async (id: string, userId: string) => {
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
        tasks: true,
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
};

export const createProject = async (userId: string, data: any) => {
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
        priority,
        section,
        visibility: visibility || "private",
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        createdById: userId,
        assigneeId,
        status: "planning"
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
};

export const updateProject = async (id: string, userId: string, data: any) => {
  try {
    const canEdit = await canEditProject(id, userId);
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
        priority: priority !== undefined ? priority : undefined,
        section: section !== undefined ? section : undefined,
        visibility: visibility !== undefined ? visibility : undefined,
        assigneeId,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        status: status !== undefined ? status : undefined,
        archived: archived !== undefined ? archived : undefined,
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
    console.error("Update project error:", error);
    return { success: false, message: "Failed to update project" };
  }
};

export const deleteProject = async (id: string, userId: string) => {
  try {
    const canEdit = await canEditProject(id, userId);
    if (!canEdit) {
      return { success: false, message: "Project not found or you don't have permission" };
    }
    
    await prisma.project.delete({ where: { id } });
    
    return { success: true, message: "Project deleted successfully" };
  } catch (error) {
    console.error("Delete project error:", error);
    return { success: false, message: "Failed to delete project" };
  }
};

export const addTask = async (projectId: string, userId: string, data: any) => {
  try {
    const { title, assignee } = data;
    
    const canManage = await canManageTasks(projectId, userId);
    if (!canManage) {
      return { success: false, message: "You don't have permission to add tasks to this project" };
    }
    
    let assignedToId = null;
    if (assignee) {
      const assigneeUser = await prisma.user.findFirst({
        where: { name: assignee }
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
      }
    });
    
    return { success: true, data: task };
  } catch (error) {
    console.error("Add task error:", error);
    return { success: false, message: "Failed to add task" };
  }
};

export const updateTask = async (taskId: string, userId: string, data: any) => {
  try {
    const { title, completed, assignee } = data;
    
    const task = await prisma.task.findFirst({
      where: { id: taskId },
      include: { project: true }
    });
    
    if (!task) {
      return { success: false, message: "Task not found" };
    }
    
    const canManage = await canManageTasks(task.projectId, userId);
    if (!canManage) {
      return { success: false, message: "You don't have permission to update tasks in this project" };
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
      }
    });
    
    const allTasks = await prisma.task.findMany({
      where: { projectId: task.projectId }
    });
    
    const allCompleted = allTasks.length > 0 && allTasks.every(t => t.completed);
    
    if (allCompleted) {
      await prisma.project.update({
        where: { id: task.projectId },
        data: { status: "completed" }
      });
    } else if (task.project.status === "completed") {
      await prisma.project.update({
        where: { id: task.projectId },
        data: { status: "in_progress" }
      });
    }
    
    return { success: true, data: updatedTask };
  } catch (error) {
    console.error("Update task error:", error);
    return { success: false, message: "Failed to update task" };
  }
};

export const deleteTask = async (taskId: string, userId: string) => {
  try {
    const task = await prisma.task.findFirst({
      where: { id: taskId },
      include: { project: true }
    });
    
    if (!task) {
      return { success: false, message: "Task not found" };
    }
    
    const canManage = await canManageTasks(task.projectId, userId);
    if (!canManage) {
      return { success: false, message: "You don't have permission to delete tasks in this project" };
    }
    
    await prisma.task.delete({ where: { id: taskId } });
    
    return { success: true, message: "Task deleted successfully" };
  } catch (error) {
    console.error("Delete task error:", error);
    return { success: false, message: "Failed to delete task" };
  }
};