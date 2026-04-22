import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { userController } from "../controllers/user.controller";
import { validate } from "../middleware/validate.middleware";
import { updateUserSchema } from "../schemas/user.schema";

const router = Router();

router.use(authenticate);

router.get("/me", userController.getMe);
router.get("/", authorize("ADMIN"), userController.getAllUsers);
router.get("/:id", authorize("ADMIN", "MANAGER"), userController.getUserById);
router.put("/me", validate(updateUserSchema), userController.updateMe);
router.delete("/me", userController.deleteMe);

export default router;