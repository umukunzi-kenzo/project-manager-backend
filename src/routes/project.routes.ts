import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
  getProjects,
  getProject,
  create,
  update,
  remove,
  createTask,
  editTask,
  removeTask
} from "../controllers/project.controller";

const router = Router();

// All project routes require authentication
router.use(authenticate);

// Project CRUD
router.get("/", getProjects);
router.get("/:id", getProject);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", remove);

// Task CRUD
router.post("/:projectId/tasks", createTask);
router.put("/tasks/:taskId", editTask);
router.delete("/tasks/:taskId", removeTask);

export default router;