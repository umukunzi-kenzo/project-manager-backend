import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { projectController } from "../controllers/project.controller";
import { validate } from "../middleware/validate.middleware";
import { createProjectSchema, updateProjectSchema } from "../schemas/project.schema";

const router = Router();

router.use(authenticate);

router.get("/", projectController.getProjects);
router.get("/:id", projectController.getProject);
router.post("/", validate(createProjectSchema), projectController.create);
router.put("/:id", validate(updateProjectSchema), projectController.update);
router.delete("/:id", projectController.remove);

export default router;