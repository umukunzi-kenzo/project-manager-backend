import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { googleController } from "../controllers/google.controller";
import { validate } from "../middleware/validate.middleware";
import { registerSchema, loginSchema } from "../schemas/auth.schema";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);

router.post("/google", googleController.googleAuth);
router.post("/google-register", googleController.googleRegister);

export default router;