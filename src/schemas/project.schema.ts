import { z } from "zod";

export const createProjectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]).default("MEDIUM"),
  section: z.enum(["DEPARTMENT", "OTHER"]).default("OTHER"),
  visibility: z.enum(["public", "private"]).default("private"),
  assignee: z.string().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

export const updateProjectSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]).optional(),
  section: z.enum(["DEPARTMENT", "OTHER"]).optional(),
  visibility: z.enum(["public", "private"]).optional(),
  assignee: z.string().optional().nullable(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  status: z.enum(["PLANNING", "IN_PROGRESS", "COMPLETED", "OVERDUE"]).optional(),
  archived: z.boolean().optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;