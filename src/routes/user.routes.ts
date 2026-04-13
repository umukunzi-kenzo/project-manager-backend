import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { getMe, getAllUsers, getUserById, updateMe, deleteMe } from "../controllers/user.controller";
import { validate } from "../middleware/validate.middleware";
import { updateUserSchema } from "../schemas/validation.schema";


const router = Router();

router.use(authenticate);

router.get("/me", getMe);
router.get("/", authorize("ADMIN"), getAllUsers);
router.get("/:id", authorize("ADMIN", "MANAGER"), getUserById);
router.put("/me", updateMe);
router.delete("/me", deleteMe);
router.put("/me", validate(updateUserSchema), updateMe);

export default router;