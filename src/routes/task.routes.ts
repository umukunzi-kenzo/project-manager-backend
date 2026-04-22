import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { taskController } from "../controllers/task.controller";
import { validate } from "../middleware/validate.middleware";
import { createTaskSchema, updateTaskSchema } from "../schemas/task.schema";

const router = Router();

router.use(authenticate);

router.post("/:projectId/tasks", validate(createTaskSchema), taskController.createTask);
router.put("/tasks/:taskId", validate(updateTaskSchema), taskController.editTask);
router.delete("/tasks/:taskId", taskController.removeTask);
router.post("/tasks/:taskId/assign-to-me", taskController.assignTaskToMe);
router.post("/:projectId/assign-to-me", taskController.assignProjectToMe);

export default router;